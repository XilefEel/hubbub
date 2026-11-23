package realtime

import (
	"encoding/json"
	"log"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/subscriptions"
)

func BroadcastTyping(app core.App, subscription string, userId string, eventType string) {
	payload, err := json.Marshal(map[string]any{
		"type":   eventType,
		"userId": userId,
	})
	if err != nil {
		log.Println("Failed to marshal typing payload:", err)
		return
	}

	msg := subscriptions.Message{
		Name: subscription,
		Data: payload,
	}

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
