package migrations

import (
	"encoding/json/v2"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3009067695")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"createRule": "@request.auth.id != \"\"",
			"deleteRule": "@request.auth.id != \"\"",
			"updateRule": "@request.auth.id != \"\" && @request.body.server:isset = false"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3009067695")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"createRule": "server.owner = @request.auth.id",
			"deleteRule": "server.owner = @request.auth.id",
			"updateRule": "server.owner = @request.auth.id && @request.body.server:isset = false"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
