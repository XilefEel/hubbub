package main

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func usersAreFriends(app core.App, a string, b string) bool {
	_, err := app.FindFirstRecordByFilter(
		"friendships",
		"status = 'accepted' && ((requester = {:a} && addressee = {:b}) || (requester = {:b} && addressee = {:a}))",
		dbx.Params{"a": a, "b": b},
	)
	return err == nil
}

func usersShareServer(app core.App, a string, b string) bool {
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

func canStartDM(app core.App, a, b string) bool {
	return usersAreFriends(app, a, b) || usersShareServer(app, a, b)
}

func userCanJoinChannel(app core.App, authRecord *core.Record, channel *core.Record) bool {
	serverId := channel.GetString("server")
	if serverId == "" {
		return false
	}

	membership, err := app.FindFirstRecordByFilter(
		"server_members",
		"server = {:server} && user = {:user}",
		dbx.Params{"server": serverId, "user": authRecord.Id},
	)

	return err == nil && membership != nil
}

func userInConversation(app core.App, userId, conversationId string) bool {
	_, err := app.FindFirstRecordByFilter(
		"conversation_members",
		"conversation = {:c} && user = {:u}",
		dbx.Params{"c": conversationId, "u": userId},
	)

	return err == nil
}
