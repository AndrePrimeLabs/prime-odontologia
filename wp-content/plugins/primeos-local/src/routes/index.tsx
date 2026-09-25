import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      throw redirect({
        to: "/reset-password",
        hash: window.location.hash.slice(1),
      });
    }

    throw redirect({ to: "/dashboard" });
  },
});
