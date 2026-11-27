package api

import (
	"errors"
	"hubbub/backend/collections"
	"hubbub/backend/membership"
	"hubbub/backend/permissions"
	"net/http"
	"regexp"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

var hexColor = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

func createRoleHandler(e *core.RequestEvent) error {
	server, actor, err := getServerAndActor(e)
	if err != nil {
		return err
	}

	perms := permissions.GetPerms(e.App, server, actor)
	if !perms.Has(permissions.ManageRoles) {
		return e.ForbiddenError("You can't manage roles", nil)
	}

	var body roleInput
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Invalid body", nil)
	}
	if err := body.validate(); err != nil {
		return e.BadRequestError(err.Error(), nil)
	}
	if !perms.Has(body.Permissions) {
		return e.ForbiddenError("You can't grant permissions you don't have", nil)
	}

	roles, err := e.App.FindCollectionByNameOrId(collections.Roles)
	if err != nil {
		return err
	}

	role := core.NewRecord(roles)
	role.Set("server", server.Id)
	role.Set("name", body.Name)
	role.Set("color", body.Color)
	role.Set("permissions", int(body.Permissions))
	role.Set("mentionable", body.Mentionable)

	count, err := e.App.CountRecords(collections.Roles, dbx.HashExp{"server": server.Id})
	if err != nil {
		return err
	}
	role.Set("position", int(count))

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

	perms := permissions.GetPerms(e.App, server, actor)
	if !perms.Has(permissions.ManageRoles) {
		return e.ForbiddenError("You can't manage roles", nil)
	}

	var body roleInput
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Invalid body", nil)
	}
	if err := body.validate(); err != nil {
		return e.BadRequestError(err.Error(), nil)
	}

	roleId := e.Request.PathValue("roleId")

	role, err := e.App.FindRecordById(collections.Roles, roleId)
	if err != nil || role.GetString("server") != server.Id {
		return e.NotFoundError("Role not found", nil)
	}

	actorRank := permissions.MemberRank(e.App, server, actor)
	if !permissions.Outranks(actorRank, role.GetInt("position")) {
		return e.ForbiddenError("That role is equal or higher than your top role", nil)
	}

	changed := permissions.Permission(role.GetInt("permissions")) ^ body.Permissions
	if !perms.Has(changed) {
		return e.ForbiddenError("You can't change permissions you don't have", nil)
	}

	role.Set("name", body.Name)
	role.Set("color", body.Color)
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

func reorderRolesHandler(e *core.RequestEvent) error {
	server, _, err := getServerAndActor(e)
	if err != nil {
		return err
	}
	if server.GetString("owner") != e.Auth.Id {
		return e.ForbiddenError("Only the owner can reorder roles", nil)
	}

	var body struct {
		RoleIds []string `json:"roleIds"`
	}
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Invalid body", nil)
	}

	roles, err := e.App.FindRecordsByFilter(
		collections.Roles,
		"server = {:server}",
		"",
		0,
		0,
		dbx.Params{"server": server.Id},
	)
	if err != nil {
		return err
	}
	if len(body.RoleIds) != len(roles) {
		return e.BadRequestError("RoleIds length must match the number of roles in the server", nil)
	}

	roleMap := make(map[string]*core.Record, len(roles))
	for _, r := range roles {
		roleMap[r.Id] = r
	}

	seen := make(map[string]bool, len(body.RoleIds))
	for _, id := range body.RoleIds {
		if roleMap[id] == nil || seen[id] {
			return e.BadRequestError("Invalid role list", nil)
		}
		seen[id] = true
	}

	err = e.App.RunInTransaction(func(tx core.App) error {
		for i, id := range body.RoleIds {
			role := roleMap[id]
			if role.GetInt("position") == i {
				continue
			}
			role.Set("position", i)
			if err := tx.Save(role); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
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

	actorRank := permissions.MemberRank(e.App, server, actor)
	if !permissions.Outranks(actorRank, role.GetInt("position")) {
		return nil, nil, e.ForbiddenError("That role is equal or higher than your top role", nil)
	}

	if target.Id != actor.Id {
		targetRank := permissions.MemberRank(e.App, server, target)
		if !permissions.Outranks(actorRank, targetRank) {
			return nil, nil, e.ForbiddenError("That member is equal or higher than you", nil)
		}
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

type roleInput struct {
	Name        string                 `json:"name"`
	Color       string                 `json:"color"`
	Permissions permissions.Permission `json:"permissions"`
	Mentionable bool                   `json:"mentionable"`
}

func (r *roleInput) validate() error {
	r.Name = strings.TrimSpace(r.Name)
	r.Color = strings.TrimSpace(r.Color)

	switch {
	case r.Name == "" || len(r.Name) > 32:
		return errors.New("Name must be 1-32 characters")
	case r.Color != "" && !hexColor.MatchString(r.Color):
		return errors.New("Color must be a hex color code")
	case !r.Permissions.IsValid():
		return errors.New("Invalid permissions")
	default:
		return nil
	}
}
