package main

import (
	"net/http"
	"regexp"

	"github.com/pocketbase/pocketbase/core"
)

var hexColor = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

func createRoleHandler(e *core.RequestEvent) error {
	server, err := e.App.FindRecordById("servers", e.Request.PathValue("serverId"))
	if err != nil {
		return e.NotFoundError("Server not found", nil)
	}

	actor, err := findMember(e.App, server.Id, e.Auth.Id)
	if err != nil {
		return e.ForbiddenError("You're not in this server", nil)
	}

	var body struct {
		Name        string     `json:"name"`
		Color       string     `json:"color"`
		Permissions Permission `json:"permissions"`
		Mentionable bool       `json:"mentionable"`
	}
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Invalid body", nil)
	}

	if body.Name == "" || len(body.Name) > 32 {
		return e.BadRequestError("Name must be 1-32 characters", nil)
	}
	if body.Color != "" && !hexColor.MatchString(body.Color) {
		return e.BadRequestError("Color must be a hex color code", nil)
	}
	if body.Permissions > allPerms {
		return e.BadRequestError("Invalid permissions", nil)
	}

	if !can(e.App, server, actor, PermManageRoles) {
		return e.ForbiddenError("You can't manage roles", nil)
	}
	if !can(e.App, server, actor, body.Permissions) {
		return e.ForbiddenError("You can't grant permissions you don't have", nil)
	}

	roles, err := e.App.FindCollectionByNameOrId("roles")
	if err != nil {
		return err
	}
	role := core.NewRecord(roles)

	role.Set("server", server.Id)
	role.Set("name", body.Name)
	role.Set("color", body.Color)
	role.Set("permissions", int(body.Permissions))
	role.Set("mentionable", body.Mentionable)
	role.Set("position", 1)

	if err := e.App.Save(role); err != nil {
		return err
	}

	return e.JSON(http.StatusOK, role)
}
