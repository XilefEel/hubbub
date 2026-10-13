package main

import (
	"net/http"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func mutualsHandler(e *core.RequestEvent) error {
	viewer, target := e.Auth.Id, e.Request.PathValue("targetId")

	var servers []string
	err := e.App.DB().
		Select("a.server").
		From("server_members AS a").
		InnerJoin("server_members AS b", dbx.NewExp("a.server = b.server")).
		Where(dbx.HashExp{"a.user": viewer, "b.user": target}).
		Column(&servers)
	if err != nil {
		return e.InternalServerError("", err)
	}
	if servers == nil {
		servers = []string{}
	}

	var friends []string

	// Get all friends of the viewer and target, then find the intersection of those two sets
	err = e.App.DB().
		NewQuery(`
			SELECT friend FROM (
				SELECT addressee AS friend FROM friendships WHERE requester = {:v} AND status = 'accepted'
				UNION
				SELECT requester AS friend FROM friendships WHERE addressee = {:v} AND status = 'accepted'
			)
			INTERSECT
			SELECT friend FROM (
				SELECT addressee AS friend FROM friendships WHERE requester = {:t} AND status = 'accepted'
				UNION
				SELECT requester AS friend FROM friendships WHERE addressee = {:t} AND status = 'accepted'
			)`).
		Bind(dbx.Params{"v": viewer, "t": target}).
		Column(&friends)
	if err != nil {
		return e.InternalServerError("", err)
	}
	if friends == nil {
		friends = []string{}
	}

	return e.JSON(http.StatusOK, map[string]any{
		"servers": servers,
		"friends": friends,
	})
}
