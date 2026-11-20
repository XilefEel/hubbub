package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_271957204")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("select1466534506")

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(3, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_2105053228",
			"help": "",
			"hidden": false,
			"id": "relation3057528519",
			"maxSelect": 10,
			"minSelect": 0,
			"name": "roles",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_271957204")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(3, []byte(`{
			"help": "",
			"hidden": false,
			"id": "select1466534506",
			"maxSelect": 0,
			"name": "role",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "select",
			"values": [
				"owner",
				"admin",
				"member"
			]
		}`)); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("relation3057528519")

		return app.Save(collection)
	})
}
