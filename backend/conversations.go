package main

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

func openDmsHandler(e *core.RequestEvent) error {
	var body struct {
		UserId string `json:"userId"`
	}

	if err := e.BindBody(&body); err != nil || body.UserId == "" {
		return e.BadRequestError("userId is required", err)
	}

	me := e.Auth.Id
	if body.UserId == me {
		return e.BadRequestError("You cannot open a DM with yourself", nil)
	}

	if _, err := e.App.FindRecordById("users", body.UserId); err != nil {
		return e.NotFoundError("User not found", err)
	}

	var convoId string

	err := e.App.RunInTransaction(func(tx core.App) error {
		// check if a conversation already exists between the two users
		err := tx.DB().
			Select("a.conversation").
			From("conversation_members AS a").
			InnerJoin("conversation_members AS b", dbx.NewExp("a.conversation = b.conversation")).
			Where(dbx.HashExp{"a.user": me, "b.user": body.UserId}).
			Limit(1).
			Row(&convoId)

		// if a conversation exists, return it
		if err == nil {
			return nil
		}

		// if the error is not "no rows", return the error
		if !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		convos, err := tx.FindCollectionByNameOrId("conversations")
		if err != nil {
			return err
		}

		// create a new conversation record
		newConvo := core.NewRecord(convos)
		newConvo.Set("lastMessageAt", types.NowDateTime())
		if err := tx.Save(newConvo); err != nil {
			return err
		}

		members, err := tx.FindCollectionByNameOrId("conversation_members")
		if err != nil {
			return err
		}

		// add both users as members of the new conversation
		for _, userId := range []string{me, body.UserId} {
			member := core.NewRecord(members)
			member.Set("conversation", newConvo.Id)
			member.Set("user", userId)
			if err := tx.Save(member); err != nil {
				return err
			}
		}

		convoId = newConvo.Id
		return nil
	})

	if err != nil {
		return e.InternalServerError("Failed to open DM", err)
	}

	return e.JSON(http.StatusOK, map[string]string{
		"conversationId": convoId,
	})
}
