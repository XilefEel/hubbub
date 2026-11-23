package hooks

import (
	"strings"

	"hubbub/backend/collections"
	"hubbub/backend/membership"

	"github.com/pocketbase/pocketbase/core"
)

func registerRealtimeHooks(app core.App) {
	app.OnRealtimeSubscribeRequest().BindFunc(validateSubscription)
}

func validateSubscription(e *core.RealtimeSubscribeRequestEvent) error {
	if e.Auth == nil {
		return e.UnauthorizedError("Authentication required.", nil)
	}

	for _, sub := range e.Subscriptions {
		topic, _, _ := strings.Cut(sub, "?")

		channelId, isChannel := strings.CutPrefix(topic, "channel_")
		conversationId, isConversation := strings.CutPrefix(topic, "conversation_")

		if isChannel {
			channel, err := e.App.FindRecordById(collections.Channels, channelId)
			if err != nil || !membership.CanJoinChannel(e.App, e.Auth, channel) {
				return e.ForbiddenError("You are not allowed to subscribe to this channel.", nil)
			}
		}

		if isConversation {
			if !membership.InConversation(e.App, e.Auth.Id, conversationId) {
				return e.ForbiddenError("You are not allowed to subscribe to this conversation.", nil)
			}
		}
	}

	return e.Next()
}
