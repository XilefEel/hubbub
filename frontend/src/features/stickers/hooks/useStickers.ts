import { Collections } from "@/lib/collections";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/lib/querykeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMyStickers() {
  return useQuery({
    queryKey: queryKeys.stickers.list(),
    queryFn: () =>
      pb.collection(Collections.UserStickers).getFullList({
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

      const sticker = await pb.collection(Collections.Stickers).create(form);

      await pb.collection(Collections.UserStickers).create({
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

      return await pb.collection(Collections.UserStickers).create({
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
    mutationFn: (userStickerId: string) =>
      pb.collection(Collections.UserStickers).delete(userStickerId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.stickers.all() }),
  });
}
