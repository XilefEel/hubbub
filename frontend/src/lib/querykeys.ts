export const queryKeys = {
  servers: {
    all: () => ["servers"] as const,
    byUser: (userId: string) => ["servers", "byUser", userId] as const,
    detail: (serverId: string) => ["servers", "detail", serverId] as const,
  },
  serverMembers: {
    all: () => ["server_members"] as const,
    byServer: (serverId: string) =>
      ["server_members", "byServer", serverId] as const,
    byUser: (userId?: string) => ["server_members", "byUser", userId] as const,
  },
  channels: {
    all: () => ["channels"] as const,
    byServer: (serverId: string) => ["channels", "byServer", serverId] as const,
    byUser: (userId?: string) => ["channels", "byUser", userId] as const,
    detail: (channelId: string) => ["channels", "detail", channelId] as const,
  },
  messages: {
    all: () => ["messages"] as const,
    byParent: (type: "channel" | "conversation", id: string) =>
      ["messages", "byParent", type, id] as const,
  },
  reactions: {
    all: () => ["reactions"] as const,
    byParent: (type: "channel" | "conversation", id: string) =>
      ["reactions", "byParent", type, id] as const,
  },
  voiceParticipants: {
    all: () => ["voice_participants"] as const,
    byParent: (type: "channel" | "conversation", id: string) =>
      ["voice_participants", "byParent", type, id] as const,
    byServer: (serverId: string) =>
      ["voice_participants", "byServer", serverId] as const,
    dmCalls: () => ["voice_participants", "dmCalls"] as const,
  },
  readStates: {
    all: () => ["read_states"] as const,
    list: () => ["read_states", "list"] as const,
  },
  friendships: {
    all: () => ["friendships"] as const,
    byUser: (userId?: string) => ["friendships", "byUser", userId] as const,
  },
  conversations: {
    all: () => ["conversations"] as const,
    list: () => ["conversations", "list"] as const,
  },
  conversationMembers: {
    all: () => ["conversation_members"] as const,
    byConversation: (conversationId: string) =>
      ["conversation_members", "byConversation", conversationId] as const,
  },
  mutualServers: {
    all: () => ["mutual_servers"] as const,
    byUser: (userId: string) => ["mutual_servers", "byUser", userId] as const,
  },
  mutualFriends: {
    all: () => ["mutual_friends"] as const,
    byUsers: (currentUserId?: string, targetId?: string) =>
      ["mutual_friends", "byUsers", currentUserId, targetId] as const,
  },
  stickers: {
    all: () => ["stickers"] as const,
    list: () => ["stickers", "list"] as const,
  },
  presence: {
    all: () => ["presence"] as const,
    online: () => ["presence", "online"] as const,
  },
};
