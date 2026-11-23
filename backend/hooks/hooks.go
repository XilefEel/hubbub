package hooks

import (
	"hubbub/backend/collections"
	"hubbub/backend/membership"
	"hubbub/backend/permissions"

	"github.com/pocketbase/pocketbase/core"
)

func Register(app core.App) {
	registerRealtimeHooks(app)
	registerServerHooks(app)
	registerChannelHooks(app)
	registerMessageHooks(app)
	registerFriendshipHooks(app)
}

func requirePerm(e *core.RequestEvent, serverId string, perm permissions.Permission) error {
	server, err := e.App.FindRecordById(collections.Servers, serverId)
	if err != nil {
		return e.NotFoundError("Server not found", nil)
	}
	member, err := membership.Find(e.App, server.Id, e.Auth.Id)
	if err != nil {
		return e.ForbiddenError("You're not in this server", nil)
	}
	if !permissions.Can(e.App, server, member, perm) {
		return e.ForbiddenError("You don't have permission to do that", nil)
	}
	return nil
}
