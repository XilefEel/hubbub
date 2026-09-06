package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	// migration handler
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	// add the owner to server_members when a server is created
	app.OnRecordAfterCreateSuccess("servers").BindFunc(func(e *core.RecordEvent) error {
		collection, err := e.App.FindCollectionByNameOrId("server_members")
		if err != nil {
			return err
		}

		membership := core.NewRecord(collection)
		membership.Set("server", e.Record.Id)
		membership.Set("user", e.Record.GetString("owner"))
		membership.Set("role", "owner")

		if err := e.App.Save(membership); err != nil {
			return err
		}

		return e.Next()
	})

	// custom endpoint to join servers via invite code
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/api/servers/join", func(e *core.RequestEvent) error {
			data := struct {
				InviteCode string `json:"inviteCode"`
			}{}

			if err := e.BindBody(&data); err != nil {
				return e.BadRequestError("Failed to read request data", err)
			}

			if e.Auth == nil {
				return e.ForbiddenError("You must be logged in to join a server", nil)
			}

			server, err := e.App.FindFirstRecordByFilter(
				"servers",
				"inviteCode = {:code}",
				map[string]any{"code": data.InviteCode},
			)

			if err != nil {
				return e.NotFoundError("Server not found", err)
			}

			existing, _ := e.App.FindFirstRecordByFilter(
				"server_members",
				"server = {:server} && user = {:user}",
				map[string]any{"server": server.Id, "user": e.Auth.Id},
			)

			if existing != nil {
				return e.BadRequestError("You are already a member of this server", nil)
			}

			collection, err := e.App.FindCollectionByNameOrId("server_members")
			if err != nil {
				return err
			}

			membership := core.NewRecord(collection)
			membership.Set("server", server.Id)
			membership.Set("user", e.Auth.Id)
			membership.Set("role", "member")

			if err := e.App.Save(membership); err != nil {
				return err
			}

			return e.JSON(200, map[string]any{
				"message": "Successfully joined the server",
				"server":  server,
			})
		}).Bind(apis.RequireAuth())

		return se.Next()
	})

	// start the app
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
