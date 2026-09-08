package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/subscriptions"
)

func main() {
	app := pocketbase.New()

	// migration handler
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	app.OnRecordAfterCreateSuccess("servers").BindFunc(func(e *core.RecordEvent) error {
		// auto add the owner to server_members when a server is created
		members, err := e.App.FindCollectionByNameOrId("server_members")
		if err != nil {
			return err
		}

		membership := core.NewRecord(members)
		membership.Set("server", e.Record.Id)
		membership.Set("user", e.Record.GetString("owner"))
		membership.Set("role", "owner")

		if err := e.App.Save(membership); err != nil {
			return err
		}

		// auto add general channel to channels when a server is created
		channels, err := e.App.FindCollectionByNameOrId("channels")
		if err != nil {
			return err
		}

		channel := core.NewRecord(channels)
		channel.Set("name", "general")
		channel.Set("server", e.Record.Id)
		channel.Set("type", "text")

		if err := e.App.Save(channel); err != nil {
			return err
		}

		return e.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// custom endpoint to join servers via invite code
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

		// custom endpoint to send typing events to a channel
		se.Router.POST("/api/channels/{channelId}/typing", func(e *core.RequestEvent) error {
			channelId := e.Request.PathValue("channelId")
			subscription := "channel_" + channelId

			payload, err := json.Marshal(map[string]any{
				"name":   e.Auth.GetString("name"),
				"type":   "typing",
				"userId": e.Auth.Id,
			})

			if err != nil {
				return e.InternalServerError("Failed to marshal payload", err)
			}

			msg := subscriptions.Message{Name: subscription, Data: payload}

			// protect agaisnt unauthorized users
			senderId := ""
			if e.Auth != nil {
				senderId = e.Auth.Id
			}

			// for each client subscribed to the channel, send the typing event
			for _, client := range e.App.SubscriptionsBroker().Clients() {
				if !client.HasSubscription(subscription) {
					continue
				}

				authRecord, _ := client.Get(apis.RealtimeClientAuthKey).(*core.Record)

				if authRecord != nil && authRecord.Id == senderId {
					continue
				}

				client.Send(msg)
			}

			return e.NoContent(http.StatusOK)
		}).Bind(apis.RequireAuth())

		return se.Next()
	})

	// start the app
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
