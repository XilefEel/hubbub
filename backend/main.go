package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

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

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
