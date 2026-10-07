package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/webhook"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// endpoint to mint a LiveKit join token for a voice channel
func voiceTokenHandler(e *core.RequestEvent) error {
	if e.Auth == nil {
		return e.ForbiddenError("You must be logged in to join a voice channel", nil)
	}

	var body struct {
		Type string `json:"type"` // "channel" or "conversation"
		Id   string `json:"id"`
	}
	if err := e.BindBody(&body); err != nil || body.Id == "" {
		return e.BadRequestError("Id is required", err)
	}

	var room string

	switch body.Type {
	case "channel":
		channel, err := e.App.FindRecordById("channels", body.Id)
		if err != nil {
			return e.NotFoundError("Channel not found", err)
		}
		if channel.GetString("type") != "voice" {
			return e.BadRequestError("This channel is not a voice channel", nil)
		}
		if !userCanJoinChannel(e.App, e.Auth, channel) {
			return e.ForbiddenError("You are not allowed to join this channel", nil)
		}

		room = body.Id

	case "conversation":
		if !userInConversation(e.App, e.Auth.Id, body.Id) {
			return e.ForbiddenError("You are not part of this conversation", nil)
		}

		room = "conversation_" + body.Id

	default:
		return e.BadRequestError("invalid type", nil)
	}

	// create a LiveKit access token for the user to join the voice channel
	apiKey := os.Getenv("LIVEKIT_API_KEY")
	apiSecret := os.Getenv("LIVEKIT_API_SECRET")

	at := auth.NewAccessToken(apiKey, apiSecret)

	// set the video grant to allow joining the room
	grant := &auth.VideoGrant{
		RoomJoin: true,
		Room:     room,
	}

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
		return e.BadRequestError("invalid webhook signature", nil)
	}

	room := event.Room.GetName()
	userId := event.Participant.GetIdentity()

	field, id := "channel", room
	if after, found := strings.CutPrefix(room, "conversation_"); found {
		field, id = "conversation", after
	}

	// handle the event based on its type
	switch event.Event {
	case "participant_left":
		// remove the participant from voice_participants
		record, err := app.FindFirstRecordByFilter(
			"voice_participants",
			field+" = {:id} && user = {:user}",
			dbx.Params{"id": id, "user": userId},
		)
		if err != nil {
			return e.JSON(http.StatusOK, map[string]bool{"ok": true})
		}

		if err := app.Delete(record); err != nil {
			log.Printf("voice webhook: failed to delete participant record %s: %v", record.Id, err)
		}

	case "room_finished":
		// remove all participants from voice_participants for this channel
		records, err := app.FindRecordsByFilter(
			"voice_participants",
			field+" = {:id}",
			"-created", 200, 0,
			dbx.Params{"id": id},
		)
		if err != nil || len(records) == 0 {
			return e.JSON(http.StatusOK, map[string]bool{"ok": true})
		}

		for _, r := range records {
			if err := app.Delete(r); err != nil {
				log.Printf("voice webhook: failed to delete participant record %s: %v", r.Id, err)
			}
		}
	}

	return e.JSON(http.StatusOK, map[string]bool{"ok": true})
}

func userCanJoinChannel(app core.App, authRecord *core.Record, channel *core.Record) bool {
	serverId := channel.GetString("server")
	if serverId == "" {
		return false
	}

	membership, err := app.FindFirstRecordByFilter(
		"server_members",
		"server = {:server} && user = {:user}",
		dbx.Params{"server": serverId, "user": authRecord.Id},
	)
	return err == nil && membership != nil
}

func userInConversation(app core.App, userId, conversationId string) bool {
	_, err := app.FindFirstRecordByFilter(
		"conversation_members",
		"conversation = {:c} && user = {:u}",
		dbx.Params{"c": conversationId, "u": userId},
	)
	return err == nil
}
