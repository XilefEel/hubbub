package membership

import (
	"hubbub/backend/collections"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func Find(app core.App, serverId, userId string) (*core.Record, error) {
	return app.FindFirstRecordByFilter(
		collections.ServerMembers,
		"server = {:server} && user = {:user}",
		dbx.Params{"server": serverId, "user": userId},
	)
}

func InConversation(app core.App, userId, conversationId string) bool {
	_, err := app.FindFirstRecordByFilter(
		collections.ConversationMembers,
		"conversation = {:c} && user = {:u}",
		dbx.Params{"c": conversationId, "u": userId},
	)
	return err == nil
}

func ShareServer(app core.App, a, b string) bool {
	var id string
	err := app.DB().
		Select("a.server").
		From("server_members AS a").
		InnerJoin("server_members AS b", dbx.NewExp("a.server = b.server")).
		Where(dbx.HashExp{"a.user": a, "b.user": b}).
		Limit(1).
		Row(&id)
	return err == nil
}
