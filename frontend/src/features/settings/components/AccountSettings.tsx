import AvatarSection from "./AvatarSection";
import AccountDetailsSection from "./AccountDetailsSection";
import BioSection from "./BioSection";
import BannerColorSection from "./BannerColorSection";
import DeleteAccountSection from "./DeleteAccountSection";

export default function AccountSettings() {
  return (
    <div
      style={{ scrollbarGutter: "stable" }}
      className="flex flex-col gap-6 overflow-y-auto"
    >
      <h3 className="font-semibold">Account</h3>

      <AvatarSection />
      <AccountDetailsSection />

      <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />

      <BioSection />
      <BannerColorSection />

      <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />

      <DeleteAccountSection />
    </div>
  );
}
