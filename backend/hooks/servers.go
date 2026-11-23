package hooks

import (
	"hubbub/backend/collections"
	"hubbub/backend/permissions"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
)

const inviteAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789"

func newInviteCode() string {
	return security.RandomStringWithAlphabet(8, inviteAlphabet)
}

func registerServerHooks(app core.App) {
	app.OnRecordCreateRequest(collections.Servers).BindFunc(validateServerOwner)
	app.OnRecordCreate(collections.Servers).BindFunc(onServerCreated)
	app.OnRecordUpdateRequest(collections.Servers).BindFunc(authorizeUpdateServer)
}

func validateServerOwner(e *core.RecordRequestEvent) error {
	if e.Auth == nil {
		return e.UnauthorizedError("Authentication required.", nil)
	}

	e.Record.Set("owner", e.Auth.Id)
	e.Record.Set("inviteCode", newInviteCode())

	return e.Next()
}

func onServerCreated(e *core.RecordEvent) error {
	return e.App.RunInTransaction(func(tx core.App) error {
		e.App = tx

		if err := e.Next(); err != nil {
			return err
		}

		members, err := tx.FindCollectionByNameOrId(collections.ServerMembers)
		if err != nil {
			return err
		}

		membership := core.NewRecord(members)
		membership.Set("server", e.Record.Id)
		membership.Set("user", e.Record.GetString("owner"))
		membership.Set("role", "owner")
		if err := tx.Save(membership); err != nil {
			return err
		}

		channels, err := tx.FindCollectionByNameOrId(collections.Channels)
		if err != nil {
			return err
		}

		channel := core.NewRecord(channels)
		channel.Set("name", "general")
		channel.Set("server", e.Record.Id)
		channel.Set("type", "text")
		return tx.Save(channel)
	})
}

func authorizeUpdateServer(e *core.RecordRequestEvent) error {
	if err := requirePerm(e.RequestEvent, e.Record.Id, permissions.ManageServer); err != nil {
		return err
	}
	return e.Next()
}
