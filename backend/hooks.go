package main

import (
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

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

	app.OnRecordAfterCreateSuccess("messages").BindFunc(func(e *core.RecordEvent) error {
		// update the last_message_at field of the channel when a new message is created
		channel, err := e.App.FindRecordById("channels", e.Record.GetString("channel"))
		if err != nil {
			return err
		}

		channel.Set("lastMessageAt", e.Record.GetString("created"))

		if err := e.App.Save(channel); err != nil {
			return err
		}

		readStates, err := e.App.FindCollectionByNameOrId("read_states")
		if err != nil {
			return err
		}

		channelId := e.Record.GetString("channel")
		userId := e.Record.GetString("user")

		for _, id := range e.Record.GetStringSlice("mentions") {
			if id == userId {
				continue
			}

			state, err := e.App.FindFirstRecordByFilter(
				"read_states",
				"user = {:user} && channel = {:channel}",
				dbx.Params{"user": id, "channel": channelId},
			)

			if err != nil {
				state = core.NewRecord(readStates)
				state.Set("user", id)
				state.Set("channel", channelId)
				state.Set("lastReadAt", channel.GetString("lastMessageAt"))
			}

			state.Set("mentionCount", state.GetInt("mentionCount")+1)
			if err := e.App.Save(state); err != nil {
				log.Println("hook: failed to save read state:", err)
			}
		}

		// broadcast typing stop event when a new message is created
		broadcastTyping(e.App, e.Record.GetString("channel"), e.Record.GetString("user"), "stop_typing")

		return e.Next()
	})

}
