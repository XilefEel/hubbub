import PresenceSection from "./PresenceSection";

export default function PrivacySettings() {
  return (
    <div
      style={{ scrollbarGutter: "stable" }}
      className="flex flex-col gap-6 overflow-y-auto"
    >
      <h3 className="font-semibold">Privacy</h3>

      <PresenceSection />
    </div>
  );
}
