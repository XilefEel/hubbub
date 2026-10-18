import { pb } from "@/lib/pocketbase";
import type { Message } from "@/lib/types";
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { cn } from "cn";
import {
  ChevronLeft,
  ChevronRight,
  XIcon,
  PanelBottomClose,
  PanelBottomOpen,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";

const isImage = (name: string) => /\.(png|jpe?g|gif|webp|avif)$/i.test(name);

export default function AttachmentGrid({ message }: { message: Message }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const images = useMemo(
    () =>
      (message.attachments ?? []).filter(isImage).map((filename) => ({
        filename,
        src: pb.files.getURL(message, filename),
      })),
    [message],
  );

  if (images.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {images.map((image, index) => (
        <img
          key={image.filename}
          src={image.src}
          alt="Attachment"
          loading="lazy"
          onClick={() => setLightboxIndex(index)}
          className="w-auto cursor-zoom-in object-cover transition-opacity duration-100 hover:opacity-95"
        />
      ))}

      {lightboxIndex >= 0 && (
        <Lightbox
          open
          index={lightboxIndex}
          close={() => setLightboxIndex(-1)}
          slides={images}
          controller={{
            closeOnBackdropClick: true,
          }}
          plugins={[Thumbnails, Zoom]}
          carousel={{
            preload: 7,
            padding: 0,
          }}
          styles={{
            thumbnailsContainer: { padding: 4 },
            thumbnail: { cursor: "default" },
          }}
          thumbnails={{
            showToggle: true,
            width: 60,
            border: 0,
            gap: 8,
          }}
          zoom={{
            maxZoomPixelRatio: 5,
            zoomInMultiplier: 1.5,
            minZoom: 0.5,
            scrollToZoom: true,
            doubleClickDelay: 250,
            wheelZoomDistanceFactor: 400,
          }}
          animation={{
            zoom: 200,
            swipe: 0,
          }}
          render={{
            iconPrev: () => <LightboxIcon Icon={ChevronLeft} size="size-10" />,
            iconNext: () => <LightboxIcon Icon={ChevronRight} size="size-10" />,
            iconClose: () => <LightboxIcon Icon={XIcon} />,
            iconThumbnailsVisible: () => (
              <LightboxIcon Icon={PanelBottomClose} />
            ),
            iconThumbnailsHidden: () => <LightboxIcon Icon={PanelBottomOpen} />,
            iconZoomIn: () => <LightboxIcon Icon={ZoomIn} />,
            iconZoomOut: () => <LightboxIcon Icon={ZoomOut} />,
          }}
        />
      )}
    </div>
  );
}

const LightboxIcon = ({
  Icon,
  size = "size-6",
}: {
  Icon: LucideIcon;
  size?: string;
}) => (
  <Icon
    className={cn(size, "text-zinc-200 transition-colors hover:text-white")}
  />
);
