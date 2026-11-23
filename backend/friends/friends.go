package friends

import (
	"hubbub/backend/collections"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func AreFriends(app core.App, a, b string) bool {
	_, err := app.FindFirstRecordByFilter(
		collections.Friendships,
		"status = 'accepted' && ((requester = {:a} && addressee = {:b}) || (requester = {:b} && addressee = {:a}))",
		dbx.Params{"a": a, "b": b},
	)
	return err == nil
}
