package main

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/subscriptions"
)

var presenceMap sync.Map

type PresenceEvent struct {
	Type   string   `json:"type"`
	Online []string `json:"online"`
}

func broadcastPresence(app core.App) {
	onlineIds := []string{}
	now := time.Now()

	presenceMap.Range(func(key, value any) bool {
		userId := key.(string)
		lastSeen := value.(time.Time)

		// Remove users who haven't sent a heartbeat in the last 45 seconds
		if now.Sub(lastSeen) > 45*time.Second {
			presenceMap.Delete(userId)
		} else {
			onlineIds = append(onlineIds, userId)
		}

		return true
	})

	payload, err := json.Marshal(PresenceEvent{
		Type:   "presence_update",
		Online: onlineIds,
	})

	if err != nil {
		log.Println("Failed to marshal presence payload:", err)
		return
	}

	msg := subscriptions.Message{
		Name: "global_presence",
		Data: payload,
	}

	for _, client := range app.SubscriptionsBroker().Clients() {
		if client.HasSubscription("global_presence") {
			client.Send(msg)
		}
	}
}

func startPresenceHeartbeat(app core.App) {
	go func() {
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			broadcastPresence(app)
		}
	}()
}
