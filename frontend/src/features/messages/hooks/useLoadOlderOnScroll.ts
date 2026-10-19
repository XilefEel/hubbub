import { useEffect, useLayoutEffect, useRef } from "react";

export function useLoadOlderOnScroll({
  oldestId,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  oldestId: string | undefined;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef(0);

  useEffect(() => {
    const el = topRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        prevScrollHeight.current = containerRef.current?.scrollHeight ?? 0;
        fetchNextPage();
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useLayoutEffect(() => {
    const c = containerRef.current;
    if (!c || !prevScrollHeight.current) return;

    c.scrollTop += c.scrollHeight - prevScrollHeight.current;
    prevScrollHeight.current = 0;
  }, [oldestId]);

  return { containerRef, topRef };
}
