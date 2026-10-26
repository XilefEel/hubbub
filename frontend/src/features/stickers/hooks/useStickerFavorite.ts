import { useMyStickers, useSaveSticker, useRemoveSticker } from "./useStickers";

export function useStickerFavorite(stickerId: string | undefined) {
  const { data: myStickers } = useMyStickers();
  const saveSticker = useSaveSticker();
  const removeSticker = useRemoveSticker();

  const savedRecord = stickerId
    ? myStickers?.find((s) => s.sticker === stickerId)
    : undefined;

  const toggle = () => {
    if (!stickerId) return;

    if (savedRecord) {
      removeSticker.mutate(savedRecord.id);
    } else {
      saveSticker.mutate({ stickerId });
    }
  };

  return {
    isSaved: !!savedRecord,
    isPending: saveSticker.isPending || removeSticker.isPending,
    isError: saveSticker.isError || removeSticker.isError,
    toggle,
  };
}
