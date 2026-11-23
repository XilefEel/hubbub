package api

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/subscriptions"
)

var presenceMap sync.Map

type PresenceEntry struct {
	lastSeen time.Time
	status   string
}

type PresenceEvent struct {
	Type   string            `json:"type"`
	Online map[string]string `json:"online"`
}

func onlineUsers() map[string]string {
	online := make(map[string]string)
	now := time.Now()

	// for each user in the presence map
	presenceMap.Range(func(key, value any) bool {
		entry := value.(PresenceEntry)
		if now.Sub(entry.lastSeen) > 45*time.Second {
			presenceMap.Delete(key)
		} else {
			online[key.(string)] = entry.status
		}
		return true
	})

	return online
}

func broadcastPresence(app core.App) {
	subscription := "global_presence"

	// create the presence event payload
	payload, err := json.Marshal(PresenceEvent{
		Type:   "presence_update",
		Online: onlineUsers(),
	})
	if err != nil {
		log.Println("Failed to marshal presence payload:", err)
		return
	}

	// create the message to broadcast
	msg := subscriptions.Message{
		Name: subscription,
		Data: payload,
	}

	// for each client subscribed to the channel, send the presence update
	for _, client := range app.SubscriptionsBroker().Clients() {
		if !client.HasSubscription(subscription) {
			continue
		}

		client.Send(msg)
	}
}

func StartPresenceHeartbeat(app core.App) {
	// start a goroutine to periodically broadcast presence updates
	go func() {
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			broadcastPresence(app)
		}
	}()
}

// endpoint to handle presence heartbeat
func heartbeatHandler(e *core.RequestEvent) error {
	pref := e.Auth.GetString("presencePreference")

	if pref == "invisible" {
		if _, wasOnline := presenceMap.LoadAndDelete(e.Auth.Id); wasOnline {
			broadcastPresence(e.App)
		}
		return e.JSON(http.StatusOK, map[string]any{"online": onlineUsers()})
	}

	status := "online"
	if pref == "dnd" {
		status = "dnd"
	}

	prev, wasOnline := presenceMap.Swap(e.Auth.Id, PresenceEntry{time.Now(), status})
	if !wasOnline || prev.(PresenceEntry).status != status {
		broadcastPresence(e.App)
	}

	return e.JSON(http.StatusOK, map[string]any{"online": onlineUsers()})
}
