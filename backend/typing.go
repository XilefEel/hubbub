package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/subscriptions"
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

	if !userCanJoinChannel(e.App, e.Auth, channel) {
		return e.ForbiddenError("Not a member of this channel", nil)
	}

	subscription := "channel_" + channelId
	broadcastTyping(e.App, subscription, e.Auth.Id, "typing")
	return e.NoContent(http.StatusOK)
}

// endpoint to send typing events to a conversation
func conversationTypingHandler(e *core.RequestEvent) error {
	conversationId := e.Request.PathValue("conversationId")

	if !userInConversation(e.App, e.Auth.Id, conversationId) {
		return e.ForbiddenError("Not a member of this conversation", nil)
	}

	subscription := "conversation_" + conversationId
	broadcastTyping(e.App, subscription, e.Auth.Id, "typing")
	return e.NoContent(http.StatusOK)
}

func broadcastTyping(app core.App, subscription string, userId string, eventType string) {
	// create a new payload for the typing event
	payload, err := json.Marshal(map[string]any{
		"type":   eventType,
		"userId": userId,
	})
	if err != nil {
		log.Println("Failed to marshal typing payload:", err)
		return
	}

	// create the message to broadcast
	msg := subscriptions.Message{
		Name: subscription,
		Data: payload,
	}

	// for each client subscribed to the channel, send the typing event
	for _, client := range app.SubscriptionsBroker().Clients() {
		if !client.HasSubscription(subscription) {
			continue
		}

		// prevent the sender from receiving their own typing event
		authRecord, _ := client.Get(apis.RealtimeClientAuthKey).(*core.Record)
		if authRecord != nil && authRecord.Id == userId {
			continue
		}
		client.Send(msg)
	}
}
