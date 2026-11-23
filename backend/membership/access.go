package membership

import (
	"hubbub/backend/friends"

	"github.com/pocketbase/pocketbase/core"
)

func CanJoinChannel(app core.App, auth, channel *core.Record) bool {
	serverId := channel.GetString("server")
	if serverId == "" {
		return false
	}
	member, err := Find(app, serverId, auth.Id)
	return err == nil && member != nil
}

func CanStartDM(app core.App, a, b string) bool {
	return friends.AreFriends(app, a, b) || ShareServer(app, a, b)
}
