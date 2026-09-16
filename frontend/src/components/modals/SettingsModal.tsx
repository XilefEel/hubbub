import { useState } from "react";
import { useSettingsModal } from "../../stores/useModalStore";
import { Dialog } from "../ui/Dialog";
import { User, Palette } from "lucide-react";
import { cn } from "cn";
import AccountSettings from "../settings/AccountSettings";
import { AppearanceSettings } from "../settings/AppearanceSettings";

type TabId = "account" | "appearance";

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "account", label: "Account", Icon: User },
  { id: "appearance", label: "Appearance", Icon: Palette },
];

export default function SettingsModal() {
  const { isOpen, closeModal } = useSettingsModal();
  const [activeTab, setActiveTab] = useState<TabId>("account");

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={closeModal}
      title="Settings"
      width="max-w-3xl"
    >
      <div className="flex h-120">
        <nav className="w-48 shrink-0 border-r border-zinc-200 pr-2 dark:border-zinc-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
                tab.id === activeTab
                  ? "bg-zinc-100 font-medium dark:bg-zinc-700"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700/50",
              )}
            >
              <tab.Icon className="size-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto px-6">
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
        </div>
      </div>
    </Dialog>
  );
}
