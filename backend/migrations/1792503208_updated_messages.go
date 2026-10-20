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
			"createRule": "@request.body.user = @request.auth.id &&\n(\n  @request.body.content != \"\" ||\n  @request.body.attachments:length > 0 ||\n  @request.body.sticker != \"\"\n) &&\n(\n  channel.server.server_members_via_server.user ?= @request.auth.id ||\n  conversation.conversation_members_via_conversation.user ?= @request.auth.id\n)"
		}`), &collection); err != nil {
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
			"createRule": "@request.body.user = @request.auth.id &&\n(\n  @request.body.content != \"\" ||\n  @request.body.attachments:length > 0\n) &&\n(\n  channel.server.server_members_via_server.user ?= @request.auth.id ||\n  conversation.conversation_members_via_conversation.user ?= @request.auth.id\n)"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
