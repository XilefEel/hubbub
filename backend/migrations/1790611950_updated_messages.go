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
			"createRule": "@request.body.user = @request.auth.id &&\n(\n  channel.server.server_members_via_server.user ?= @request.auth.id ||\n  conversation.conversation_members_via_conversation.user ?= @request.auth.id\n)",
			"listRule": "channel.server.server_members_via_server.user ?= @request.auth.id ||\nconversation.conversation_members_via_conversation.user ?= @request.auth.id",
			"viewRule": "channel.server.server_members_via_server.user ?= @request.auth.id ||\nconversation.conversation_members_via_conversation.user ?= @request.auth.id"
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
			"createRule": "channel.server.server_members_via_server.user ?= @request.auth.id && @request.body.user = @request.auth.id",
			"listRule": "channel.server.server_members_via_server.user ?= @request.auth.id",
			"viewRule": "channel.server.server_members_via_server.user ?= @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
