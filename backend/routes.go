package main

import (
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func registerRoutes(se *core.ServeEvent) {
	se.Router.POST("/api/servers/join", joinServerHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/channels/{channelId}/typing", channelTypingHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/conversations/{conversationId}/typing", conversationTypingHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/presence/heartbeat", heartbeatHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/voice/token", voiceTokenHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/voice/webhook", voiceWebhookHandler)
	se.Router.POST("/api/dms/open", openDmsHandler).Bind(apis.RequireAuth())
	se.Router.POST("/api/dms/group", createGroupHandler).Bind(apis.RequireAuth())
}
