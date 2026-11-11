import { pb } from "@/lib/pocketbase";
import type { ServerMember, ConversationMember, User } from "@/lib/types";
import { useMemo, useState, type RefObject } from "react";

export function useMentions({
  members,
  content,
  setContent,
  inputRef,
}: {
  members: ServerMember[] | ConversationMember[] | undefined;
  content: string;
  setContent: (v: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const [mentions, setMentions] = useState<User[]>([]);
  const [query, setQuery] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);

  const mentionableMembers = useMemo(
    () =>
      (members ?? [])
        .map((m) => m.expand?.user)
        .filter((u): u is User => !!u && u.id !== pb.authStore.record?.id),
    [members],
  );

  const matched = useMemo(() => {
    if (query === null) return [];

    return mentionableMembers
      .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6);
  }, [mentionableMembers, query]);

  const pick = (user: User) => {
    const input = inputRef.current;
    if (!input) return;

    const value = input.value;
    const cursor = input.selectionStart ?? value.length;
    const before = value.slice(0, cursor).replace(/@\w*$/, `@${user.name} `);
    const after = value.slice(cursor);

    setQuery(null);
    setContent(before + after);
    setMentions((prev) =>
      prev.some((m) => m.id === user.id) ? prev : [...prev, user],
    );

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(before.length, before.length);
    });
  };

  const updateQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart ?? value.length;
    const match = value.slice(0, cursor).match(/(?:^|\s)@(\w*)$/);
    setQuery(match ? match[1] : null);
    setSelected(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (query === null || matched.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (s + 1) % matched.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (s - 1 + matched.length) % matched.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      pick(matched[selected]);
    } else if (e.key === "Escape") {
      setQuery(null);
    }
  };

  const userIds = useMemo(
    () =>
      mentions.filter((m) => content.includes(`@${m.name}`)).map((m) => m.id),
    [mentions, content],
  );

  const reset = () => setMentions([]);

  return {
    matched,
    selected,
    pick,
    updateQuery,
    onKeyDown,
    userIds,
    reset,
  };
}
