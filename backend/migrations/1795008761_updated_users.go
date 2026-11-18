package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(10, []byte(`{
			"help": "",
			"hidden": false,
			"id": "select3752246326",
			"maxSelect": 0,
			"name": "presencePreference",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "select",
			"values": [
				"auto",
				"dnd",
				"invisible"
			]
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(10, []byte(`{
			"help": "",
			"hidden": false,
			"id": "select3752246326",
			"maxSelect": 0,
			"name": "presenceStatus",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "select",
			"values": [
				"online",
				"invisible",
				"dnd"
			]
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
