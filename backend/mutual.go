package main

import (
	"net/http"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func mutualServersHandler(e *core.RequestEvent) error {
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

	return e.JSON(http.StatusOK, map[string]any{
		"servers": servers,
	})
}
