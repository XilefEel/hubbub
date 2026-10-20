import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import type { Sticker, UserSticker } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMyStickers() {
  return useQuery({
    queryKey: queryKeys.stickers.all(),
    queryFn: () =>
      pb.collection<UserSticker>("user_stickers").getFullList({
        expand: "sticker",
        sort: "-created",
      }),
  });
}

export function useCreateSticker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to create stickers");

      const form = new FormData();
      form.append("file", file);
      form.append("creator", userId);

      const sticker = await pb.collection<Sticker>("stickers").create(form);

      await pb.collection<UserSticker>("user_stickers").create({
        user: userId,
        sticker: sticker.id,
      });

      return sticker;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.stickers.all() }),
  });
}

export function useSaveSticker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stickerId }: { stickerId: string }) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to save stickers");

      return await pb.collection<UserSticker>("user_stickers").create({
        user: userId,
        sticker: stickerId,
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.stickers.all() }),
  });
}

export function useRemoveSticker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userStickerId: string) => {
      return await pb
        .collection<UserSticker>("user_stickers")
        .delete(userStickerId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.stickers.all() }),
  });
}
