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
			"listRule": "server_members_via_server.user ?= @request.auth.id",
			"updateRule": "@request.auth.id != \"\" && @request.body.owner:isset = false && @request.body.inviteCode:isset = false",
			"viewRule": "server_members_via_server.user ?= @request.auth.id"
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
			"listRule": "@collection.server_members.user ?= @request.auth.id && @collection.server_members.server ?= id",
			"updateRule": "@request.auth.id = owner && @request.body.owner:isset = false",
			"viewRule": "@collection.server_members.user ?= @request.auth.id && @collection.server_members.server ?= id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
