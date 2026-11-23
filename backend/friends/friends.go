package friends

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func AreFriends(app core.App, a, b string) bool {
	_, err := app.FindFirstRecordByFilter(
		"friendships",
		"status = 'accepted' && ((requester = {:a} && addressee = {:b}) || (requester = {:b} && addressee = {:a}))",
		dbx.Params{"a": a, "b": b},
	)
	return err == nil
}
