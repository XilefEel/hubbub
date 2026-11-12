import {
  createRootRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { pb } from "../lib/pocketbase";
import ServerRail from "@/features/servers/components/ServerRail";
import { useFriendshipsSubscription } from "@/features/friends/hooks/useFriendships";
import GlobalModals from "@/app/modals/GlobalModals";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useConversationsSubscription } from "@/features/conversations/hooks/useConversations";
import { useDmCallsSubscription } from "@/features/voice/hooks/useVoiceParticipants";
import { usePresence } from "@/features/members/hooks/usePresence";

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const isLoggedIn = pb.authStore.isValid;
    const isLoginPage = location.pathname === "/login";

    if (!isLoggedIn && !isLoginPage) {
      throw redirect({ to: "/login" });
    }
    if (isLoggedIn && isLoginPage) {
      throw redirect({ to: "/me" });
    }
    if (isLoggedIn && location.pathname === "/") {
      throw redirect({ to: "/me" });
    }
  },
  component: RootLayout,
});

function RootLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  useFriendshipsSubscription();
  useConversationsSubscription();
  useDmCallsSubscription();
  usePresence();

  if (isLoginPage) {
    return (
      <>
        <Outlet />
        <ReactQueryDevtools />
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden">
        <ServerRail />
        <div className="flex-1 overflow-hidden">
          <Outlet />
          <GlobalModals />
          <ReactQueryDevtools />
        </div>
      </div>
    </>
  );
}
