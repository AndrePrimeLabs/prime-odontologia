import { Router } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { PrimeOSClient } from 'primeos-sdk';

declare module '@tanstack/react-router' {
  interface Register {
    router: Router;
  }
  interface RouteContext {
    queryClient: QueryClient;
    primeOS: PrimeOSClient; // Tells code auto-complete that primeOS is available globally on routes
  }
}
