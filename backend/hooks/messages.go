package hooks

import (
	"hubbub/backend/permissions"
	"hubbub/backend/realtime"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func registerMessageHooks(app core.App) {
	app.OnRecordDeleteRequest("messages").BindFunc(authorizeDeleteMessage)
	app.OnRecordCreate("messages").BindFunc(validateMessageTarget)
	app.OnRecordAfterCreateSuccess("messages").BindFunc(onMessageCreated)
}

func authorizeDeleteMessage(e *core.RecordRequestEvent) error {
	isAuthor := e.Record.GetString("user") == e.Auth.Id

	// DM message: author only
	if e.Record.GetString("conversation") != "" {
		if !isAuthor {
			return e.ForbiddenError("You can't delete this message", nil)
		}
		return e.Next()
	}

	channel, err := e.App.FindRecordById("channels", e.Record.GetString("channel"))
	if err != nil {
		return e.NotFoundError("Channel not found", nil)
	}

	if !isAuthor {
		if err := requirePerm(e.RequestEvent, channel.GetString("server"), permissions.ManageMessages); err != nil {
			return err
		}
	}
	return e.Next()
}

func validateMessageTarget(e *core.RecordEvent) error {
	channelId := e.Record.GetString("channel")
	conversationId := e.Record.GetString("conversation")

	if channelId == "" && conversationId == "" {
		return apis.NewBadRequestError("A message must belong to either a channel or a conversation", nil)
	}
	if channelId != "" && conversationId != "" {
		return apis.NewBadRequestError("A message cannot belong to both a channel and a conversation", nil)
	}

	return e.Next()
}

func onMessageCreated(e *core.RecordEvent) error {
	if e.Record.GetString("conversation") != "" {
		return onConversationMessageCreated(e)
	}
	return onChannelMessageCreated(e)
}

func onConversationMessageCreated(e *core.RecordEvent) error {
	conversationId := e.Record.GetString("conversation")
	userId := e.Record.GetString("user")

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

	realtime.BroadcastTyping(e.App, "conversation_"+conversationId, userId, "stop_typing")
	return e.Next()
}

func onChannelMessageCreated(e *core.RecordEvent) error {
	channelId := e.Record.GetString("channel")
	userId := e.Record.GetString("user")

	channel, err := e.App.FindRecordById("channels", channelId)
	if err != nil {
		return err
	}

	channel.Set("lastMessageAt", e.Record.GetString("created"))
	if err := e.App.Save(channel); err != nil {
		return err
	}

	if err := bumpMentionCounts(e.App, e.Record, channel); err != nil {
		return err
	}

	realtime.BroadcastTyping(e.App, "channel_"+channelId, userId, "stop_typing")
	return e.Next()
}

func bumpMentionCounts(app core.App, msg, channel *core.Record) error {
	readStates, err := app.FindCollectionByNameOrId("read_states")
	if err != nil {
		return err
	}

	userId := msg.GetString("user")
	serverId := channel.GetString("server")
	seen := map[string]bool{userId: true}

	for _, id := range msg.GetStringSlice("mentions") {
		if id == "" || seen[id] {
			continue
		}
		seen[id] = true

		if _, err := app.FindFirstRecordByFilter(
			"server_members",
			"server = {:server} && user = {:user}",
			dbx.Params{"server": serverId, "user": id},
		); err != nil {
			continue
		}

		state, err := app.FindFirstRecordByFilter(
			"read_states",
			"user = {:user} && channel = {:channel}",
			dbx.Params{"user": id, "channel": channel.Id},
		)
		if err != nil {
			state = core.NewRecord(readStates)
			state.Set("user", id)
			state.Set("channel", channel.Id)
			state.Set("lastReadAt", channel.GetString("lastMessageAt"))
		}

		state.Set("mentionCount", state.GetInt("mentionCount")+1)
		if err := app.Save(state); err != nil {
			app.Logger().Error(
				"Failed to update read state mention count",
				"userId", id,
				"channelId", channel.Id,
				"error", err,
			)
		}
	}

	return nil
}
