import { useState } from "react";
import Dialog from "@/components/ui/Dialog";
import { User, Palette, LogOut } from "lucide-react";
import { cn } from "cn";
import AccountSettings from "../components/AccountSettings";
import AppearanceSettings from "../components/AppearanceSettings";
import { useSettingsModal } from "./useSettingsModal";
import { pb } from "@/lib/pocketbase";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

type TabId = "account" | "appearance";

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "account", label: "Account", Icon: User },
  { id: "appearance", label: "Appearance", Icon: Palette },
];

export default function SettingsModal() {
  const { isOpen, setIsOpen } = useSettingsModal();
  const [activeTab, setActiveTab] = useState<TabId>("account");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Settings"
      width="max-w-3xl"
    >
      <div className="flex h-120">
        <nav className="flex w-48 shrink-0 flex-col border-r border-zinc-200 pr-2 dark:border-zinc-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-100",
                tab.id === activeTab
                  ? "bg-zinc-100 font-medium dark:bg-zinc-700"
                  : "dark:hover:bg-zinc-750 text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300",
              )}
            >
              <tab.Icon className="size-4 shrink-0" />
              {tab.label}
            </button>
          ))}

          <button
            onClick={async () => {
              setIsOpen(false);
              await pb.realtime.unsubscribe().catch(() => {});
              pb.authStore.clear();
              queryClient.clear();
              navigate({ to: "/login" });
            }}
            className="mt-auto flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors duration-100 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <LogOut className="size-4 shrink-0" />
            Log out
          </button>
        </nav>

        <div className="flex-1 overflow-y-auto px-6">
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
        </div>
      </div>
    </Dialog>
  );
}
