package migrations

import (
	"encoding/json/v2"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_271957204")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"deleteRule": "user = @request.auth.id || server.owner = @request.auth.id",
			"listRule": "server.server_members_via_server.user ?= @request.auth.id",
			"viewRule": "server.server_members_via_server.user ?= @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_271957204")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"deleteRule": "@request.auth.id = user",
			"listRule": "@collection.server_members.server ?= server && @collection.server_members.user ?= @request.auth.id",
			"viewRule": "user = @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
