package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/subscriptions"
)

func registerRoutes(se *core.ServeEvent) {
	se.Router.POST("/api/servers/join", joinServerHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/channels/{channelId}/typing", typingHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/presence/heartbeat", heartbeatHandler).Bind(apis.RequireAuth())
}

// auto add the owner to server_members when a server is created
func joinServerHandler(e *core.RequestEvent) error {
	data := struct {
		InviteCode string `json:"inviteCode"`
	}{}

	if err := e.BindBody(&data); err != nil {
		return e.BadRequestError("Failed to read request data", err)
	}

	if e.Auth == nil {
		return e.ForbiddenError("You must be logged in to join a server", nil)
	}

	server, err := e.App.FindFirstRecordByFilter(
		"servers",
		"inviteCode = {:code}",
		map[string]any{"code": data.InviteCode},
	)

	if err != nil {
		return e.NotFoundError("Server not found", err)
	}

	existing, _ := e.App.FindFirstRecordByFilter(
		"server_members",
		"server = {:server} && user = {:user}",
		map[string]any{"server": server.Id, "user": e.Auth.Id},
	)

	if existing != nil {
		return e.BadRequestError("You are already a member of this server", nil)
	}

	collection, err := e.App.FindCollectionByNameOrId("server_members")
	if err != nil {
		return err
	}

	membership := core.NewRecord(collection)
	membership.Set("server", server.Id)
	membership.Set("user", e.Auth.Id)
	membership.Set("role", "member")

	if err := e.App.Save(membership); err != nil {
		return err
	}

	return e.JSON(200, map[string]any{
		"message": "Successfully joined the server",
		"server":  server,
	})
}

// custom endpoint to send typing events to a channel
func typingHandler(e *core.RequestEvent) error {
	channelId := e.Request.PathValue("channelId")
	subscription := "channel_" + channelId

	payload, err := json.Marshal(map[string]any{
		"name":   e.Auth.GetString("name"),
		"type":   "typing",
		"userId": e.Auth.Id,
	})

	if err != nil {
		return e.InternalServerError("Failed to marshal payload", err)
	}

	msg := subscriptions.Message{Name: subscription, Data: payload}

	// protect agaisnt unauthorized users
	senderId := ""
	if e.Auth != nil {
		senderId = e.Auth.Id
	}

	// for each client subscribed to the channel, send the typing event
	for _, client := range e.App.SubscriptionsBroker().Clients() {
		if !client.HasSubscription(subscription) {
			continue
		}

		authRecord, _ := client.Get(apis.RealtimeClientAuthKey).(*core.Record)

		if authRecord != nil && authRecord.Id == senderId {
			continue
		}

		client.Send(msg)
	}

	return e.NoContent(http.StatusOK)
}

// custom endpoint to handle presence heartbeat
func heartbeatHandler(e *core.RequestEvent) error {
	presenceMap.Store(e.Auth.Id, time.Now())
	return e.NoContent(200)
}
