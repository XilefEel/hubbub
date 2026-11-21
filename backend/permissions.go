package main

import (
	"math"

	"github.com/pocketbase/pocketbase/core"
)

type Permission uint64

const (
	PermAdministrator   Permission = 1 << iota // 00000001 = 1
	PermManageServer                           // 00000010 = 2
	PermManageChannels                         // 00000100 = 4
	PermManageRoles                            // 00001000 = 8
	PermManageMessages                         // 00010000 = 16
	PermKickMembers                            // 00100000 = 32
	PermBanMembers                             // 01000000 = 64
	PermMentionEveryone                        // 10000000 = 128
)

const allPerms = math.MaxUint64

func (p Permission) Has(perm Permission) bool {
	return p&perm == perm
}

func (p *Permission) Add(flags Permission) {
	*p |= flags
}

func (p *Permission) Remove(flags Permission) {
	*p &^= flags
}

func getPerms(app core.App, server *core.Record, member *core.Record) Permission {
	if member.GetString("server") != server.Id {
		return 0
	}

	if server.GetString("owner") == member.GetString("user") {
		return allPerms
	}

	roleIDs := member.GetStringSlice("roles")
	if len(roleIDs) == 0 {
		return 0
	}

	roles, err := app.FindRecordsByIds("roles", roleIDs)
	if err != nil {
		return 0
	}

	var perms Permission
	for _, r := range roles {
		if r.GetString("server") == server.Id {
			perms.Add(Permission(r.GetInt("permissions")))
		}
	}

	if perms.Has(PermAdministrator) {
		return allPerms
	}

	return perms
}

func can(app core.App, server *core.Record, member *core.Record, perm Permission) bool {
	return getPerms(app, server, member).Has(perm)
}

// return the highest position of the member's roles in the server.
// if the member is the server owner, return math.MaxInt
// if the member has no roles, return -1
func highestRolePosition(app core.App, server *core.Record, member *core.Record) int {
	if server.GetString("owner") == member.GetString("user") {
		return math.MaxInt
	}

	roleIDs := member.GetStringSlice("roles")
	if len(roleIDs) == 0 {
		return -1
	}

	roles, err := app.FindRecordsByIds("roles", roleIDs)
	if err != nil {
		return -1
	}

	top := -1
	for _, r := range roles {
		if r.GetString("server") == server.Id {
			top = max(top, r.GetInt("position"))
		}
	}

	return top
}
