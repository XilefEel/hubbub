package hooks

import (
	"hubbub/backend/collections"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func registerFriendshipHooks(app core.App) {
	app.OnRecordCreate(collections.Friendships).BindFunc(validateFriendship)
}

func validateFriendship(e *core.RecordEvent) error {
	requester := e.Record.GetString("requester")
	addressee := e.Record.GetString("addressee")

	if requester == addressee {
		return apis.NewBadRequestError("You cannot send a friend request to yourself", nil)
	}

	existing, err := e.App.FindRecordsByFilter(
		collections.Friendships,
		"(requester = {:requester} && addressee = {:addressee}) || (requester = {:addressee} && addressee = {:requester})",
		"",
		1,
		0,
		dbx.Params{"requester": requester, "addressee": addressee},
	)
	if err != nil {
		return err
	}
	if len(existing) > 0 {
		return apis.NewBadRequestError("A friendship or request already exists between these users", nil)
	}

	return e.Next()
}
