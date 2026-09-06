package migrations

import (
	"encoding/json/v2"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3738798621")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "@collection.server_members.user ?= @request.auth.id && @collection.server_members.server ?= id",
			"viewRule": "@collection.server_members.user ?= @request.auth.id && @collection.server_members.server ?= id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3738798621")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "",
			"viewRule": ""
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
