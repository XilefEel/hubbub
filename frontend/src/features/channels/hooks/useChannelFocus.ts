import { useEffect, useState } from "react";

export function useChannelFocus(
  bottomRef: React.RefObject<HTMLDivElement | null>,
  channelId: string,
) {
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setAtBottom(entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [bottomRef, channelId]);

  return { atBottom };
}
