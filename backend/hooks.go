package main

import (
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
)

const inviteAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789"

func newInviteCode() string {
	return security.RandomStringWithAlphabet(8, inviteAlphabet)
}

func registerHooks(app core.App) {
	// auto validate realtime subscriptions to ensure the user is allowed to subscribe
	app.OnRealtimeSubscribeRequest().BindFunc(func(e *core.RealtimeSubscribeRequestEvent) error {
		if e.Auth == nil {
			return e.UnauthorizedError("Authentication required.", nil)
		}

		for _, sub := range e.Subscriptions {
			topic, _, _ := strings.Cut(sub, "?")

			channelId, isChannel := strings.CutPrefix(topic, "channel_")
			conversationId, isConversation := strings.CutPrefix(topic, "conversation_")

			if isChannel {
				channel, err := e.App.FindRecordById("channels", channelId)
				if err != nil || !userCanJoinChannel(e.App, e.Auth, channel) {
					return e.ForbiddenError("You are not allowed to subscribe to this channel.", nil)
				}
			}

			if isConversation {
				if !userInConversation(e.App, e.Auth.Id, conversationId) {
					return e.ForbiddenError("You are not allowed to subscribe to this conversation.", nil)
				}
			}
		}

		return e.Next()
	})

	// auto set the owner and invite code when a server is created
	app.OnRecordCreateRequest("servers").BindFunc(func(e *core.RecordRequestEvent) error {
		if e.Auth == nil {
			return e.UnauthorizedError("Authentication required.", nil)
		}

		e.Record.Set("owner", e.Auth.Id)
		e.Record.Set("inviteCode", newInviteCode())

		return e.Next()
	})

	app.OnRecordCreate("servers").BindFunc(func(e *core.RecordEvent) error {
		return e.App.RunInTransaction(func(tx core.App) error {
			e.App = tx

			if err := e.Next(); err != nil {
				return err
			}

			// auto add the owner to server_members when a server is created
			members, err := tx.FindCollectionByNameOrId("server_members")
			if err != nil {
				return err
			}

			membership := core.NewRecord(members)
			membership.Set("server", e.Record.Id)
			membership.Set("user", e.Record.GetString("owner"))
			membership.Set("role", "owner")
			if err := tx.Save(membership); err != nil {
				return err
			}

			// auto add general channel to channels when a server is created
			channels, err := tx.FindCollectionByNameOrId("channels")
			if err != nil {
				return err
			}

			channel := core.NewRecord(channels)
			channel.Set("name", "general")
			channel.Set("server", e.Record.Id)
			channel.Set("type", "text")
			return tx.Save(channel)
		})
	})

	// auto validate messages to ensure they belong to either a channel or a conversation, but not both
	app.OnRecordCreate("messages").BindFunc(func(e *core.RecordEvent) error {
		channelId := e.Record.GetString("channel")
		conversationId := e.Record.GetString("conversation")

		if channelId == "" && conversationId == "" {
			return apis.NewBadRequestError("A message must belong to either a channel or a conversation", nil)
		}
		if channelId != "" && conversationId != "" {
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
				e.App.Logger().Error(
					"Failed to update conversation lastMessageAt",
					"conversationId", conversationId,
					"error", err,
				)
			}

			subscription := "conversation_" + conversationId
			broadcastTyping(e.App, subscription, userId, "stop_typing")

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

		// update the mention count for each user mentioned in the message
		seen := map[string]bool{userId: true}
		serverId := channel.GetString("server")

		for _, id := range e.Record.GetStringSlice("mentions") {
			if id == "" || seen[id] {
				continue
			}
			seen[id] = true

			if _, err := e.App.FindFirstRecordByFilter(
				"server_members",
				"server = {:server} && user = {:user}",
				dbx.Params{"server": serverId, "user": id},
			); err != nil {
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
				e.App.Logger().Error(
					"Failed to update read state mention count",
					"userId", id,
					"channelId", channelId,
					"error", err,
				)
			}
		}

		// broadcast typing stop event when a new message is created
		subscription := "channel_" + channelId
		broadcastTyping(e.App, subscription, userId, "stop_typing")

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
