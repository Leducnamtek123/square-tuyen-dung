'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import store from '../redux/store';
import '../configs/dayjs-config';
import '../i18n';
import errorHandling from '@/utils/errorHandling';
import { isMaintenanceModeError } from '@/utils/maintenanceMode';

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => errorHandling(error)
    }),
    mutationCache: new MutationCache({
      onError: (error) => errorHandling(error)
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          !isMaintenanceModeError(error) && failureCount < 1,
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Use useRef instead of module-level singleton to avoid shared state
  // between SSR requests in Next.js App Router.
  const queryClientRef = React.useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = makeQueryClient();
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClientRef.current}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
          {children}
        </LocalizationProvider>
      </QueryClientProvider>
    </Provider>
  );
}
