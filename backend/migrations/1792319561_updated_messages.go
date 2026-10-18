package migrations

import (
	"encoding/json/v2"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_2605467279")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"createRule": "@request.body.user = @request.auth.id &&\n(\n  @request.body.content != \"\" ||\n  @request.body.attachments:length > 0\n) &&\n(\n  channel.server.server_members_via_server.user ?= @request.auth.id ||\n  conversation.conversation_members_via_conversation.user ?= @request.auth.id\n)",
			"updateRule": "user = @request.auth.id &&\n@request.body.channel:isset = false &&\n@request.body.conversation:isset = false &&\n@request.body.user:isset = false &&\n@request.body.attachments:isset = false &&\n(\n  @request.body.content:isset = false ||\n  @request.body.content != \"\" ||\n  attachments:length > 0\n)"
		}`), &collection); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
			"autogeneratePattern": "",
			"help": "",
			"hidden": false,
			"id": "text999008199",
			"max": 0,
			"min": 0,
			"name": "content",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_2605467279")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"createRule": "@request.body.user = @request.auth.id &&\n(\n  channel.server.server_members_via_server.user ?= @request.auth.id ||\n  conversation.conversation_members_via_conversation.user ?= @request.auth.id\n)",
			"updateRule": "user = @request.auth.id && @request.body.channel:isset = false && @request.body.conversation:isset = false && @request.body.user:isset = false"
		}`), &collection); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
			"autogeneratePattern": "",
			"help": "",
			"hidden": false,
			"id": "text999008199",
			"max": 0,
			"min": 0,
			"name": "content",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": true,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
