import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { pb } from "../lib/pocketbase";

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
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
