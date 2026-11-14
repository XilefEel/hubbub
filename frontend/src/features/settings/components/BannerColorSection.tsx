import { Palette } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUpdateBannerColor } from "@/features/users/hooks/useUserProfile";
import ColorPicker from "@/components/ui/ColorPicker";

const DEFAULT_BANNER_COLOR = "#14B8A6";

export default function BannerColorSection() {
  const { user } = useAuth();
  const updateBannerColor = useUpdateBannerColor();

  const color = user?.bannerColor ?? DEFAULT_BANNER_COLOR;

  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-2 text-sm">
        <Palette className="size-4 shrink-0" />
        Banner Color
      </span>

      <ColorPicker
        currentColor={color}
        onColorSelect={(c) => updateBannerColor.mutate(c)}
      >
        <div
          style={{ backgroundColor: color }}
          className="h-16 w-full rounded-lg transition-opacity duration-100 hover:opacity-80"
        />
      </ColorPicker>
    </div>
  );
}
