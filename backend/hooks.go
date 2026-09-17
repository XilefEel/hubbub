package main

import "github.com/pocketbase/pocketbase/core"

func registerServerHooks(app core.App) {
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
}
