package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	// migration handler
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	registerServerHooks(app)

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		registerRoutes(se)
		startPresenceHeartbeat(app)
		return se.Next()
	})

	// start the app
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
