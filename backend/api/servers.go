package api

import (
	"hubbub/backend/collections"
	"hubbub/backend/membership"
	"net/http"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func joinServerHandler(e *core.RequestEvent) error {
	var body struct {
		InviteCode string `json:"inviteCode"`
	}
	if err := e.BindBody(&body); err != nil || strings.TrimSpace(body.InviteCode) == "" {
		return e.BadRequestError("inviteCode is required", err)
	}

	// find the server by invite code
	cleanInviteCode := strings.ToLower(strings.TrimSpace(body.InviteCode))

	server, err := e.App.FindFirstRecordByFilter(
		collections.Servers,
		"inviteCode = {:code}",
		dbx.Params{"code": cleanInviteCode},
	)
	if err != nil {
		return e.NotFoundError("Server not found", err)
	}

	// check if the user is already a member of the server
	existing, _ := membership.Find(e.App, server.Id, e.Auth.Id)
	if existing != nil {
		return e.BadRequestError("You are already a member of this server", nil)
	}

	// add the user to server_members
	collection, err := e.App.FindCollectionByNameOrId(collections.ServerMembers)
	if err != nil {
		return e.InternalServerError("Failed to join server", err)
	}

	membership := core.NewRecord(collection)
	membership.Set("server", server.Id)
	membership.Set("user", e.Auth.Id)

	if err := e.App.Save(membership); err != nil {
		return e.InternalServerError("Failed to join server", err)
	}

	return e.JSON(http.StatusOK, map[string]any{
		"message":  "Successfully joined the server",
		"serverId": server.Id,
	})
}
