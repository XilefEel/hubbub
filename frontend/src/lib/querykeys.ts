export const queryKeys = {
  servers: {
    list: (userId: string) => ["servers", userId] as const,
    detail: (serverId: string) => ["servers", "detail", serverId] as const,
  },
  serverMembers: {
    list: (serverId: string) => ["server_members", serverId] as const,
  },
  channels: {
    list: (serverId: string) => ["channels", serverId] as const,
    detail: (channelId: string) => ["channels", "detail", channelId] as const,
  },
  messages: {
    list: (type: "channel" | "conversation", id: string) =>
      ["messages", type, id] as const,
  },
  reactions: {
    list: (channelId: string) => ["reactions", channelId] as const,
  },
  voiceParticipants: {
    list: (type: "channel" | "conversation", id: string) =>
      ["voiceParticipants", type, id] as const,
  },
  readStates: {
    list: () => ["read_states"] as const,
  },
  friendships: {
    list: (userId: string) => ["friendships", userId] as const,
  },
};
