import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient, useMutation } from "@tanstack/react-query";

function invalidateUserDependents(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.serverMembers.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.messages.all() });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to update avatar");

      const formData = new FormData();
      formData.append("avatar", file);

      return await pb.collection("users").update(userId, formData);
    },
    onSuccess: () => invalidateUserDependents(queryClient),
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to remove avatar");

      return await pb.collection("users").update(userId, { avatar: "" });
    },
    onSuccess: () => invalidateUserDependents(queryClient),
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to update username");

      return await pb.collection("users").update(userId, { name });
    },
    onSuccess: () => invalidateUserDependents(queryClient),
  });
}

export function useUpdateBio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bio: string) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to update bio");

      return await pb.collection("users").update(userId, { bio });
    },
    onSuccess: () => invalidateUserDependents(queryClient),
  });
}

export function useUpdateBannerColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bannerColor: string) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to update banner color");

      return await pb.collection("users").update(userId, { bannerColor });
    },
    onSuccess: () => invalidateUserDependents(queryClient),
  });
}
