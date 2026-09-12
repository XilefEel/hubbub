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
    list: (channelId: string) => ["messages", channelId] as const,
  },
  reactions: {
    list: (channelId: string) => ["reactions", channelId] as const,
  },
};
