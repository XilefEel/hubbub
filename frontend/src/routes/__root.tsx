import {
  createRootRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { pb } from "../lib/pocketbase";
import { ServerRail } from "../components/servers/ServerRail";

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const isLoggedIn = pb.authStore.isValid;
    const isLoginPage = location.pathname === "/login";

    if (!isLoggedIn && !isLoginPage) {
      throw redirect({ to: "/login" });
    }
    if (isLoggedIn && isLoginPage) {
      throw redirect({ to: "/" });
    }
  },
  component: RootLayout,
});

function RootLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return (
      <>
        <Outlet />
        <TanStackRouterDevtools position="bottom-right" />
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden">
        <ServerRail />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
