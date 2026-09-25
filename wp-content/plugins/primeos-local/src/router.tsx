import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { PrimeOSClient } from "primeos-sdk"; 
import { routeTree } from "./routeTree.gen";

// Initialize the PrimeOS SDK instance once.
// It will look for your Vite environment variables or fallback to your local Docker container.
const primeOS = new PrimeOSClient({
  baseUrl: import.meta.env.VITE_PRIMEOS_API_URL || "http://localhost:5000/api",
  apiKey: import.meta.env.VITE_PRIMEOS_API_KEY || "",
});

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    // Injecting both clients into context exposes them globally to your route loaders and hooks
    context: { 
      queryClient,
      primeOS 
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
