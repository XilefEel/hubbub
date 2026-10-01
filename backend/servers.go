package main

import (
	"net/http"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// auto add the owner to server_members when a server is created
func joinServerHandler(e *core.RequestEvent) error {
	data := struct {
		InviteCode string `json:"inviteCode"`
	}{}

	// read the request body
	if err := e.BindBody(&data); err != nil || strings.TrimSpace(data.InviteCode) == "" {
		return e.BadRequestError("inviteCode is required", err)
	}

	// find the server by invite code
	server, err := e.App.FindFirstRecordByFilter(
		"servers",
		"inviteCode = {:code}",
		dbx.Params{"code": strings.TrimSpace(data.InviteCode)},
	)
	if err != nil {
		return e.NotFoundError("Server not found", err)
	}

	// check if the user is already a member of the server
	existing, _ := e.App.FindFirstRecordByFilter(
		"server_members",
		"server = {:server} && user = {:user}",
		dbx.Params{"server": server.Id, "user": e.Auth.Id},
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
