package migrations

import (
	"encoding/json/v2"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		jsonData := `{
			"createRule": null,
			"deleteRule": null,
			"fields": [
				{
					"autogeneratePattern": "[a-z0-9]{15}",
					"help": "",
					"hidden": false,
					"id": "text3208210256",
					"max": 15,
					"min": 15,
					"name": "id",
					"pattern": "^[a-z0-9]+$",
					"presentable": false,
					"primaryKey": true,
					"required": true,
					"system": true,
					"type": "text"
				},
				{
					"cascadeDelete": true,
					"collectionId": "pbc_3738798621",
					"help": "",
					"hidden": false,
					"id": "relation1517147638",
					"maxSelect": 0,
					"minSelect": 0,
					"name": "server",
					"presentable": false,
					"required": true,
					"system": false,
					"type": "relation"
				},
				{
					"autogeneratePattern": "",
					"help": "",
					"hidden": false,
					"id": "text1579384326",
					"max": 0,
					"min": 0,
					"name": "name",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": true,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"help": "",
					"hidden": false,
					"id": "text1716930793",
					"max": 0,
					"min": 0,
					"name": "color",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": true,
					"system": false,
					"type": "text"
				},
				{
					"help": "",
					"hidden": false,
					"id": "number1177347317",
					"max": null,
					"min": null,
					"name": "position",
					"onlyInt": false,
					"presentable": false,
					"required": true,
					"system": false,
					"type": "number"
				},
				{
					"help": "",
					"hidden": false,
					"id": "number770559087",
					"max": null,
					"min": null,
					"name": "permissions",
					"onlyInt": false,
					"presentable": false,
					"required": true,
					"system": false,
					"type": "number"
				},
				{
					"help": "",
					"hidden": false,
					"id": "bool2254775162",
					"name": "mentionable",
					"presentable": false,
					"required": true,
					"system": false,
					"type": "bool"
				},
				{
					"hidden": false,
					"id": "autodate2990389176",
					"name": "created",
					"onCreate": true,
					"onUpdate": false,
					"presentable": false,
					"system": false,
					"type": "autodate"
				},
				{
					"hidden": false,
					"id": "autodate3332085495",
					"name": "updated",
					"onCreate": true,
					"onUpdate": true,
					"presentable": false,
					"system": false,
					"type": "autodate"
				}
			],
			"id": "pbc_2105053228",
			"indexes": [],
			"listRule": "@request.auth.id != \"\" &&\n@collection.server_members.server ?= server &&\n@collection.server_members.user ?= @request.auth.id",
			"name": "roles",
			"system": false,
			"type": "base",
			"updateRule": null,
			"viewRule": "@request.auth.id != \"\" &&\n@collection.server_members.server ?= server &&\n@collection.server_members.user ?= @request.auth.id"
		}`

		collection := &core.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_2105053228")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	})
}
