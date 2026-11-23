package api

import (
	"hubbub/backend/collections"
	"hubbub/backend/membership"
	"hubbub/backend/permissions"
	"net/http"
	"regexp"
	"strings"

	"github.com/pocketbase/pocketbase/core"
)

var hexColor = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

func createRoleHandler(e *core.RequestEvent) error {
	server, actor, err := getServerAndActor(e)
	if err != nil {
		return err
	}

	var body struct {
		Name        string                 `json:"name"`
		Color       string                 `json:"color"`
		Permissions permissions.Permission `json:"permissions"`
		Mentionable bool                   `json:"mentionable"`
	}
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Invalid body", nil)
	}

	cleanName := strings.TrimSpace(body.Name)
	cleanColor := strings.TrimSpace(body.Color)

	if cleanName == "" || len(cleanName) > 32 {
		return e.BadRequestError("Name must be 1-32 characters", nil)
	}
	if cleanColor != "" && !hexColor.MatchString(cleanColor) {
		return e.BadRequestError("Color must be a hex color code", nil)
	}
	if body.Permissions > permissions.AllPerms {
		return e.BadRequestError("Invalid permissions", nil)
	}

	perms := permissions.GetPerms(e.App, server, actor)

	if !perms.Has(permissions.ManageRoles) {
		return e.ForbiddenError("You can't manage roles", nil)
	}
	if body.Permissions != 0 && !perms.Has(body.Permissions) {
		return e.ForbiddenError("You can't grant permissions you don't have", nil)
	}

	roles, err := e.App.FindCollectionByNameOrId(collections.Roles)
	if err != nil {
		return err
	}
	role := core.NewRecord(roles)

	role.Set("server", server.Id)
	role.Set("name", cleanName)
	role.Set("color", cleanColor)
	role.Set("permissions", int(body.Permissions))
	role.Set("mentionable", body.Mentionable)
	role.Set("position", 1)

	if err := e.App.Save(role); err != nil {
		return err
	}

	return e.JSON(http.StatusOK, role)
}

func updateRoleHandler(e *core.RequestEvent) error {
	server, actor, err := getServerAndActor(e)
	if err != nil {
		return err
	}

	roleId := e.Request.PathValue("roleId")

	role, err := e.App.FindRecordById(collections.Roles, roleId)
	if err != nil || role.GetString("server") != server.Id {
		return e.NotFoundError("Role not found", nil)
	}

	var body struct {
		Name        string                 `json:"name"`
		Color       string                 `json:"color"`
		Permissions permissions.Permission `json:"permissions"`
		Mentionable bool                   `json:"mentionable"`
	}
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Invalid body", nil)
	}

	perms := permissions.GetPerms(e.App, server, actor)

	if !perms.Has(permissions.ManageRoles) {
		return e.ForbiddenError("You can't manage roles", nil)
	}
	if role.GetInt("position") >= permissions.HighestRolePosition(e.App, server, actor) {
		return e.ForbiddenError("That role is equal or higher than your top role", nil)
	}
	if body.Permissions > permissions.AllPerms {
		return e.BadRequestError("Invalid permissions", nil)
	}

	changed := permissions.Permission(role.GetInt("permissions")) ^ body.Permissions
	if !perms.Has(changed) {
		return e.ForbiddenError("You can't change permissions you don't have", nil)
	}

	cleanName := strings.TrimSpace(body.Name)
	if cleanName == "" || len(cleanName) > 32 {
		return e.BadRequestError("Name must be 1-32 characters", nil)
	}

	cleanColor := strings.TrimSpace(body.Color)
	if cleanColor != "" && !hexColor.MatchString(cleanColor) {
		return e.BadRequestError("Color must be a hex color code", nil)
	}

	role.Set("name", cleanName)
	role.Set("color", cleanColor)
	role.Set("permissions", int(body.Permissions))
	role.Set("mentionable", body.Mentionable)
	if err := e.App.Save(role); err != nil {
		return err
	}

	return e.JSON(http.StatusOK, role)
}

func addMemberRoleHandler(e *core.RequestEvent) error {
	target, role, err := checkRolePermissions(e)
	if err != nil {
		return err
	}
	target.Set("roles+", role.Id)
	if err := e.App.Save(target); err != nil {
		return err
	}
	return e.NoContent(http.StatusNoContent)
}

func removeMemberRoleHandler(e *core.RequestEvent) error {
	target, role, err := checkRolePermissions(e)
	if err != nil {
		return err
	}
	target.Set("roles-", role.Id)
	if err := e.App.Save(target); err != nil {
		return err
	}
	return e.NoContent(http.StatusNoContent)
}

func checkRolePermissions(e *core.RequestEvent) (*core.Record, *core.Record, error) {
	server, actor, err := getServerAndActor(e)
	if err != nil {
		return nil, nil, err
	}
	target, err := membership.Find(e.App, server.Id, e.Request.PathValue("userId"))
	if err != nil {
		return nil, nil, e.NotFoundError("Member not found", nil)
	}
	role, err := e.App.FindRecordById(collections.Roles, e.Request.PathValue("roleId"))
	if err != nil || role.GetString("server") != server.Id {
		return nil, nil, e.NotFoundError("Role not found", nil)
	}

	if !permissions.Can(e.App, server, actor, permissions.ManageRoles) {
		return nil, nil, e.ForbiddenError("You can't manage roles", nil)
	}

	actorPos := permissions.HighestRolePosition(e.App, server, actor)
	if role.GetInt("position") >= actorPos {
		return nil, nil, e.ForbiddenError("That role is equal or higher than your top role", nil)
	}

	targetPos := permissions.HighestRolePosition(e.App, server, target)
	if target.Id != actor.Id && targetPos >= actorPos {
		return nil, nil, e.ForbiddenError("That member is equal or higher than you", nil)
	}

	return target, role, nil
}

func getServerAndActor(e *core.RequestEvent) (*core.Record, *core.Record, error) {
	server, err := e.App.FindRecordById(collections.Servers, e.Request.PathValue("serverId"))
	if err != nil {
		return nil, nil, e.NotFoundError("Server not found", nil)
	}
	actor, err := membership.Find(e.App, server.Id, e.Auth.Id)
	if err != nil {
		return nil, nil, e.ForbiddenError("You're not in this server", nil)
	}
	return server, actor, nil
}
