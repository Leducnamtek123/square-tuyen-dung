'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import store from '../redux/store';
import '../configs/dayjs-config';
import '../i18n';
import { useTranslation } from 'react-i18next';
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
  // Use useState lazy initializer to avoid mutating ref during render
  // and maintain component instance isolation in Next.js App Router.
  const [queryClient] = React.useState(() => makeQueryClient());
  const { i18n } = useTranslation();
  const activeLocale = i18n.language?.startsWith('en') ? 'en' : 'vi';

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={activeLocale}>
          {children}
        </LocalizationProvider>
      </QueryClientProvider>
    </Provider>
  );
}
