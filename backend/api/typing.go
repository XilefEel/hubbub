package api

import (
	"net/http"

	"hubbub/backend/membership"
	"hubbub/backend/realtime"

	"github.com/pocketbase/pocketbase/core"
)

// endpoint to send typing events to a channel
func channelTypingHandler(e *core.RequestEvent) error {
	channelId := e.Request.PathValue("channelId")

	channel, err := e.App.FindRecordById("channels", channelId)
	if err != nil {
		return e.NotFoundError("Channel not found", err)
	}
	if channel.GetString("type") != "text" {
		return e.BadRequestError("This channel is not a text channel", nil)
	}

	if !membership.CanJoinChannel(e.App, e.Auth, channel) {
		return e.ForbiddenError("Not a member of this channel", nil)
	}

	realtime.BroadcastTyping(e.App, "channel_"+channelId, e.Auth.Id, "typing")
	return e.NoContent(http.StatusOK)
}

// endpoint to send typing events to a conversation
func conversationTypingHandler(e *core.RequestEvent) error {
	conversationId := e.Request.PathValue("conversationId")

	if !membership.InConversation(e.App, e.Auth.Id, conversationId) {
		return e.ForbiddenError("Not a member of this conversation", nil)
	}

	realtime.BroadcastTyping(e.App, "conversation_"+conversationId, e.Auth.Id, "typing")
	return e.NoContent(http.StatusOK)
}
