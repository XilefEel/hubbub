export const queryKeys = {
  servers: {
    all: () => ["servers"] as const,
    list: (userId: string) => ["servers", userId] as const,
    detail: (serverId: string) => ["servers", "detail", serverId] as const,
  },
  serverMembers: {
    all: () => ["server_members"] as const,
    list: (serverId: string) => ["server_members", serverId] as const,
    mine: (userId?: string) => ["server_members", "mine", userId] as const,
  },
  channels: {
    list: (serverId: string) => ["channels", serverId] as const,
    detail: (channelId: string) => ["channels", "detail", channelId] as const,
  },
  messages: {
    all: () => ["messages"] as const,
    list: (type: "channel" | "conversation", id: string) =>
      ["messages", type, id] as const,
  },
  reactions: {
    all: () => ["reactions"] as const,
    list: (channelId: string) => ["reactions", channelId] as const,
  },
  voiceParticipants: {
    list: (type: "channel" | "conversation", id: string) =>
      ["voice_participants", type, id] as const,
    byServer: (serverId: string) =>
      ["voice_participants", "server", serverId] as const,
  },
  readStates: {
    list: () => ["read_states"] as const,
  },
  friendships: {
    list: (userId: string) => ["friendships", userId] as const,
  },
  conversations: {
    all: () => ["conversations"] as const,
    list: () => ["conversations", "list"] as const,
  },
  conversationMembers: {
    list: (conversationId: string) =>
      ["conversation_members", conversationId] as const,
  },
};
