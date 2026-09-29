package main

import (
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
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

	// auto validate messages to ensure they belong to either a channel or a conversation, but not both
	app.OnRecordCreate("messages").BindFunc(func(e *core.RecordEvent) error {
		hasChannel := e.Record.GetString("channel")
		hasConversation := e.Record.GetString("conversation")

		if hasChannel == "" && hasConversation == "" {
			return apis.NewBadRequestError("A message must belong to either a channel or a conversation", nil)
		}

		if hasChannel != "" && hasConversation != "" {
			return apis.NewBadRequestError("A message cannot belong to both a channel and a conversation", nil)
		}

		return e.Next()
	})

	app.OnRecordAfterCreateSuccess("messages").BindFunc(func(e *core.RecordEvent) error {
		conversationId := e.Record.GetString("conversation")
		userId := e.Record.GetString("user")

		// if the message belongs to a conversation, update the last_message_at field of the conversation
		if conversationId != "" {
			conversation, err := e.App.FindRecordById("conversations", conversationId)
			if err != nil {
				return err
			}

			conversation.Set("lastMessageAt", e.Record.GetString("created"))
			if err := e.App.Save(conversation); err != nil {
				return err
			}

			broadcastTyping(e.App, "conversation_"+conversationId, userId, "stop_typing")

			// skip the rest of the hook
			return e.Next()
		}

		// update the last_message_at field of the channel when a new message is created
		channelId := e.Record.GetString("channel")

		channel, err := e.App.FindRecordById("channels", channelId)
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
				log.Println("failed to save read state:", err)
			}
		}

		// broadcast typing stop event when a new message is created
		broadcastTyping(e.App, "channel_"+channelId, userId, "stop_typing")

		return e.Next()
	})

	// auto validate friendships to prevent duplicates and self-friendships
	app.OnRecordCreate("friendships").BindFunc(func(e *core.RecordEvent) error {
		requester := e.Record.GetString("requester")
		addressee := e.Record.GetString("addressee")

		if requester == addressee {
			return apis.NewBadRequestError("You cannot send a friend request to yourself", nil)
		}

		existing, err := e.App.FindRecordsByFilter(
			"friendships",
			"(requester = {:requester} && addressee = {:addressee}) || (requester = {:addressee} && addressee = {:requester})",
			"",
			1,
			0,
			dbx.Params{"requester": requester, "addressee": addressee},
		)

		if err != nil {
			return err
		}

		if len(existing) > 0 {
			return apis.NewBadRequestError("A friendship or request already exists between these users", nil)
		}

		return e.Next()
	})
}
