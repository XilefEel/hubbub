package permissions

import (
	"hubbub/backend/collections"
	"math"

	"github.com/pocketbase/pocketbase/core"
)

type Permission uint64

const (
	Administrator   Permission = 1 << iota // 00000001 = 1
	ManageServer                           // 00000010 = 2
	ManageChannels                         // 00000100 = 4
	ManageRoles                            // 00001000 = 8
	ManageMessages                         // 00010000 = 16
	KickMembers                            // 00100000 = 32
	BanMembers                             // 01000000 = 64
	MentionEveryone                        // 10000000 = 128
)

const AllPerms = (1 << 8) - 1 // 11111111 = 255

func (p Permission) Has(perm Permission) bool {
	return p&perm == perm
}

func (p *Permission) Add(flags Permission) {
	*p |= flags
}

func GetPerms(app core.App, server *core.Record, member *core.Record) Permission {
	if member.GetString("server") != server.Id {
		return 0
	}

	if server.GetString("owner") == member.GetString("user") {
		return AllPerms
	}

	roleIDs := member.GetStringSlice(collections.Roles)
	if len(roleIDs) == 0 {
		return 0
	}

	roles, err := app.FindRecordsByIds(collections.Roles, roleIDs)
	if err != nil {
		return 0
	}

	var perms Permission
	for _, r := range roles {
		if r.GetString("server") == server.Id {
			perms.Add(Permission(r.GetInt("permissions")))
		}
	}

	if perms.Has(Administrator) {
		return AllPerms
	}

	return perms
}

func Can(app core.App, server *core.Record, member *core.Record, perm Permission) bool {
	return GetPerms(app, server, member).Has(perm)
}

// return the highest position of the member's roles in the server.
// if the member is the server owner, return math.MinInt
// if the member has no roles, return math.MaxInt
func HighestRolePosition(app core.App, server *core.Record, member *core.Record) int {
	if server.GetString("owner") == member.GetString("user") {
		return math.MinInt
	}

	roleIDs := member.GetStringSlice(collections.Roles)
	if len(roleIDs) == 0 {
		return math.MaxInt
	}

	roles, err := app.FindRecordsByIds(collections.Roles, roleIDs)
	if err != nil {
		return math.MaxInt
	}

	top := math.MaxInt
	for _, r := range roles {
		if r.GetString("server") == server.Id {
			top = min(top, r.GetInt("position"))
		}
	}

	return top
}
