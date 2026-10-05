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
	var errNotAllowed = errors.New("not allowed")

	err := e.App.RunInTransaction(func(tx core.App) error {
		if !canStartDM(tx, me, body.UserId) {
			return errNotAllowed
		}

		// check if a conversation already exists between the two users
		err := tx.DB().
			Select("a.conversation").
			From("conversation_members AS a").
			InnerJoin("conversation_members AS b", dbx.NewExp("a.conversation = b.conversation")).
			InnerJoin("conversations AS c", dbx.NewExp("c.id = a.conversation")).
			Where(dbx.HashExp{"a.user": me, "b.user": body.UserId, "c.isGroup": false}).
			Limit(1).
			Row(&convoId)
		if err == nil {
			return nil
		}
		if !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		convos, err := tx.FindCollectionByNameOrId("conversations")
		if err != nil {
			return err
		}

		now := types.NowDateTime()

		convo := core.NewRecord(convos)
		convo.Set("isGroup", false)
		convo.Set("lastMessageAt", now)
		if err := tx.Save(convo); err != nil {
			return err
		}

		members, err := tx.FindCollectionByNameOrId("conversation_members")
		if err != nil {
			return err
		}

		for _, userId := range []string{me, body.UserId} {
			member := core.NewRecord(members)
			member.Set("conversation", convo.Id)
			member.Set("user", userId)
			member.Set("lastReadAt", now)
			if err := tx.Save(member); err != nil {
				return err
			}
		}

		convoId = convo.Id
		return nil
	})

	if errors.Is(err, errNotAllowed) {
		return e.ForbiddenError("You can't message this user", nil)
	}
	if err != nil {
		return e.InternalServerError("Failed to open DM", err)
	}

	return e.JSON(http.StatusOK, map[string]string{
		"conversationId": convoId,
	})
}

func createGroupHandler(e *core.RequestEvent) error {
	var body struct {
		UserIds []string `json:"userIds"`
	}

	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("invalid body", err)
	}

	// remove duplicates and the creator from the list of userIds
	me := e.Auth.Id
	seen := map[string]bool{me: true}
	others := []string{}

	for _, id := range body.UserIds {
		if id != "" && !seen[id] {
			seen[id] = true
			others = append(others, id)
		}
	}
	if len(others) < 2 || len(others) > 9 {
		return e.BadRequestError("a group needs 3 to 10 people including you", nil)
	}

	// check that all users are friends with the creator
	for _, id := range others {
		if !usersAreFriends(e.App, me, id) {
			return e.ForbiddenError("You can only add friends to a group", nil)
		}
	}

	var convoId string

	err := e.App.RunInTransaction(func(tx core.App) error {
		convos, err := tx.FindCollectionByNameOrId("conversations")
		if err != nil {
			return err
		}

		now := types.NowDateTime()

		convo := core.NewRecord(convos)
		convo.Set("isGroup", true)
		convo.Set("owner", me)
		convo.Set("lastMessageAt", now)
		if err := tx.Save(convo); err != nil {
			return err
		}

		members, err := tx.FindCollectionByNameOrId("conversation_members")
		if err != nil {
			return err
		}

		for _, userId := range append(others, me) {
			member := core.NewRecord(members)
			member.Set("conversation", convo.Id)
			member.Set("user", userId)
			member.Set("lastReadAt", now)
			if err := tx.Save(member); err != nil {
				return err
			}
		}

		convoId = convo.Id
		return nil
	})

	if err != nil {
		return e.InternalServerError("Failed to create group", err)
	}

	return e.JSON(http.StatusOK, map[string]string{
		"conversationId": convoId,
	})
}

func usersAreFriends(app core.App, a string, b string) bool {
	_, err := app.FindFirstRecordByFilter(
		"friendships",
		"status = 'accepted' && ((requester = {:a} && addressee = {:b}) || (requester = {:b} && addressee = {:a}))",
		dbx.Params{"a": a, "b": b},
	)
	return err == nil
}

func usersShareServer(app core.App, a string, b string) bool {
	var id string
	err := app.DB().
		Select("a.server").
		From("server_members AS a").
		InnerJoin("server_members AS b", dbx.NewExp("a.server = b.server")).
		Where(dbx.HashExp{"a.user": a, "b.user": b}).
		Limit(1).
		Row(&id)
	return err == nil
}

func canStartDM(app core.App, a, b string) bool {
	return usersAreFriends(app, a, b) || usersShareServer(app, a, b)
}
