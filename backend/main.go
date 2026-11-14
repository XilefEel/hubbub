package main

import (
	"log"
	"os"

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

	registerHooks(app)

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		if os.Getenv("LIVEKIT_API_KEY") == "" || os.Getenv("LIVEKIT_API_SECRET") == "" || os.Getenv("LIVEKIT_URL") == "" {
			log.Fatal("LIVEKIT_API_KEY, LIVEKIT_API_SECRET and LIVEKIT_URL must be set")
		}

		registerRoutes(se)
		startPresenceHeartbeat(app)
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
