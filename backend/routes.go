package main

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/webhook"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/subscriptions"
)

func registerRoutes(se *core.ServeEvent) {
	se.Router.POST("/api/servers/join", joinServerHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/channels/{channelId}/typing", typingHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/presence/heartbeat", heartbeatHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/voice/token", voiceTokenHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/voice/webhook", voiceWebhookHandler).Bind(apis.RequireAuth())
}

// auto add the owner to server_members when a server is created
func joinServerHandler(e *core.RequestEvent) error {
	data := struct {
		InviteCode string `json:"inviteCode"`
	}{}

	// read the request body
	if err := e.BindBody(&data); err != nil {
		return e.BadRequestError("Failed to read request data", err)
	}

	if e.Auth == nil {
		return e.ForbiddenError("You must be logged in to join a server", nil)
	}

	// find the server by invite code
	server, err := e.App.FindFirstRecordByFilter(
		"servers",
		"inviteCode = {:code}",
		map[string]any{"code": data.InviteCode},
	)

	if err != nil {
		return e.NotFoundError("Server not found", err)
	}

	// check if the user is already a member of the server
	existing, _ := e.App.FindFirstRecordByFilter(
		"server_members",
		"server = {:server} && user = {:user}",
		map[string]any{"server": server.Id, "user": e.Auth.Id},
	)

	if existing != nil {
		return e.BadRequestError("You are already a member of this server", nil)
	}

	// add the user to server_members
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

	return e.JSON(http.StatusOK, map[string]any{
		"message": "Successfully joined the server",
		"server":  server,
	})
}

// endpoint to send typing events to a channel
func typingHandler(e *core.RequestEvent) error {
	// create a new payload for the typing event
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

	// create the message to broadcast
	msg := subscriptions.Message{
		Name: subscription,
		Data: payload,
	}

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

		// prevent the sender from receiving their own typing event
		authRecord, _ := client.Get(apis.RealtimeClientAuthKey).(*core.Record)
		if authRecord != nil && authRecord.Id == senderId {
			continue
		}

		client.Send(msg)
	}

	return e.NoContent(http.StatusOK)
}

// endpoint to handle presence heartbeat
func heartbeatHandler(e *core.RequestEvent) error {
	presenceMap.Store(e.Auth.Id, time.Now())
	return e.NoContent(http.StatusOK)
}

// endpoint to mint a LiveKit join token for a voice channel
func voiceTokenHandler(e *core.RequestEvent) error {
	if e.Auth == nil {
		return e.ForbiddenError("You must be logged in to join a voice channel", nil)
	}

	// read the request body
	data := struct {
		ChannelId string `json:"channelId"`
	}{}

	// validate the request body
	if err := e.BindBody(&data); err != nil || data.ChannelId == "" {
		return e.BadRequestError("channelId is required", err)
	}

	channel, err := e.App.FindRecordById("channels", data.ChannelId)
	if err != nil {
		return e.NotFoundError("Channel not found", err)
	}

	if channel.GetString("type") != "voice" {
		return e.BadRequestError("This channel is not a voice channel", nil)
	}

	if !userCanJoinChannel(e.App, e.Auth, channel) {
		return e.ForbiddenError("You are not allowed to join this channel", nil)
	}

	// create a LiveKit access token for the user to join the voice channel
	apiKey := os.Getenv("LIVEKIT_API_KEY")
	apiSecret := os.Getenv("LIVEKIT_API_SECRET")

	at := auth.NewAccessToken(apiKey, apiSecret)

	// set the video grant to allow joining the room
	grant := &auth.VideoGrant{
		RoomJoin: true,
		Room:     data.ChannelId,
	}

	// set the identity to the user's id and name
	at.SetVideoGrant(grant).
		SetIdentity(e.Auth.Id).
		SetName(e.Auth.GetString("name")).
		SetValidFor(time.Hour)

	// generate the JWT token
	token, err := at.ToJWT()
	if err != nil {
		return e.InternalServerError("Failed to create voice token", err)
	}

	// send the token and LiveKit URL to the client
	return e.JSON(http.StatusOK, map[string]string{
		"token": token,
		"url":   os.Getenv("LIVEKIT_URL"),
	})
}

func userCanJoinChannel(app core.App, authRecord *core.Record, channel *core.Record) bool {
	serverId := channel.GetString("server")
	if serverId == "" {
		return false
	}

	// check if the user is a member of the server
	membership, err := app.FindFirstRecordByFilter(
		"server_members",
		"server = {:server} && user = {:user}",
		map[string]any{"server": serverId, "user": authRecord.Id},
	)

	return err == nil && membership != nil
}

// endpoint to handle LiveKit webhooks for voice channel events
func voiceWebhookHandler(e *core.RequestEvent) error {
	app := e.App

	// create a key provider for verifying the webhook signature
	apiKey := os.Getenv("LIVEKIT_API_KEY")
	apiSecret := os.Getenv("LIVEKIT_API_SECRET")
	keyProvider := auth.NewSimpleKeyProvider(apiKey, apiSecret)

	// receive the webhook event and verify the signature
	event, err := webhook.ReceiveWebhookEvent(e.Request, keyProvider)
	if err != nil {
		return apis.NewBadRequestError("invalid webhook signature", nil)
	}

	channelId := event.Room.GetName()
	userId := event.Participant.GetIdentity()

	// handle the event based on its type
	switch event.Event {
	case "participant_left":
		// remove the participant from voice_participants
		record, err := app.FindFirstRecordByFilter(
			"voice_participants",
			"channel = {:channel} && user = {:user}",
			map[string]any{"channel": channelId, "user": userId},
		)

		if err != nil {
			return e.JSON(http.StatusOK, map[string]bool{"ok": true})
		}

		app.Delete(record)

	case "room_finished":
		// remove all participants from voice_participants for this channel
		records, err := app.FindRecordsByFilter(
			"voice_participants",
			"channel = {:channel}",
			"-created",
			200,
			0,
			map[string]any{"channel": channelId},
		)

		if err != nil || len(records) == 0 {
			return e.JSON(http.StatusOK, map[string]bool{"ok": true})
		}

		for _, r := range records {
			app.Delete(r)
		}
	}

	return e.JSON(http.StatusOK, map[string]bool{"ok": true})
}
