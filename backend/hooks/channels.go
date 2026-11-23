package hooks

import (
	"hubbub/backend/collections"
	"hubbub/backend/permissions"

	"github.com/pocketbase/pocketbase/core"
)

func registerChannelHooks(app core.App) {
	app.OnRecordCreateRequest(collections.Channels).BindFunc(authorizeCreateChannel)
	app.OnRecordUpdateRequest(collections.Channels).BindFunc(authorizeUpdateChannel)
	app.OnRecordDeleteRequest(collections.Channels).BindFunc(authorizeDeleteChannel)
}

func authorizeCreateChannel(e *core.RecordRequestEvent) error {
	serverId := e.Record.GetString("server")
	if err := requirePerm(e.RequestEvent, serverId, permissions.ManageChannels); err != nil {
		return err
	}
	return e.Next()
}

func authorizeUpdateChannel(e *core.RecordRequestEvent) error {
	serverId := e.Record.Original().GetString("server")
	if err := requirePerm(e.RequestEvent, serverId, permissions.ManageChannels); err != nil {
		return err
	}
	return e.Next()
}

func authorizeDeleteChannel(e *core.RecordRequestEvent) error {
	serverId := e.Record.GetString("server")
	if err := requirePerm(e.RequestEvent, serverId, permissions.ManageChannels); err != nil {
		return err
	}
	return e.Next()
}
