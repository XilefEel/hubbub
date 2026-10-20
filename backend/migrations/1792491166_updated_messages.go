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
			"updateRule": "user = @request.auth.id &&\n@request.body.channel:isset = false &&\n@request.body.conversation:isset = false &&\n@request.body.user:isset = false &&\n@request.body.attachments:isset = false &&\n@request.body.sticker:isset = false &&\n(\n  @request.body.content:isset = false ||\n  @request.body.content != \"\" ||\n  attachments:length > 0\n)"
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
			"updateRule": "user = @request.auth.id &&\n@request.body.channel:isset = false &&\n@request.body.conversation:isset = false &&\n@request.body.user:isset = false &&\n@request.body.attachments:isset = false &&\n(\n  @request.body.content:isset = false ||\n  @request.body.content != \"\" ||\n  attachments:length > 0\n)"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
