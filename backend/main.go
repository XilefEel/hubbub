package main

import (
	"log"

	_ "hubbub/backend/migrations"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	_ = godotenv.Load()

	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	registerServerHooks(app)

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		registerRoutes(se)
		startPresenceHeartbeat(app)
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
