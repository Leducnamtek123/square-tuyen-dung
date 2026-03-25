import React from 'react';

import ReactDOM from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';

import './index.css';

import App from './App';

import { Provider } from 'react-redux';

import store from './redux/store';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import 'dayjs/locale/en';

// Import dayjs configuration

import './configs/dayjs-config';

import './i18n';
import { localizeRoutePath } from './configs/routeLocalization';
import { getPreferredLanguage, normalizePortalPath } from './configs/portalRouting';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Recover from stale chunk references after a new deploy.
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

const queryClient = new QueryClient({

  defaultOptions: {

    queries: {

      refetchOnWindowFocus: false,

      retry: 1,

      staleTime: 5 * 60_000,  // 5min — data considered fresh, skip refetch

      gcTime: 10 * 60_000,   // 10min — garbage collect unused cache entries

    },

  },

});

const getRouterBaseName = (pathname: string) => {
  const currentPath = pathname || window.location.pathname || "/";
  if (currentPath.startsWith("/admin")) return "/admin";
  if (currentPath.startsWith("/quan-tri")) return "/quan-tri";
  if (currentPath.startsWith("/employer")) return "/employer";
  if (currentPath.startsWith("/nha-tuyen-dung")) return "/nha-tuyen-dung";
  if (currentPath.startsWith("/employee")) return "/employee";
  return "/";
};

const initialPathname = window.location.pathname || "/";
const preferredLanguage = getPreferredLanguage();
const normalizedPortalPath = normalizePortalPath(initialPathname, preferredLanguage);
const normalizedFullPath = localizeRoutePath(normalizedPortalPath, preferredLanguage);

if (normalizedFullPath !== initialPathname) {
  window.location.replace(`${normalizedFullPath}${window.location.search}${window.location.hash}`);
}

const routerBaseName = getRouterBaseName(normalizedFullPath);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(

  <Provider store={store}>

    <QueryClientProvider client={queryClient}>

      <BrowserRouter
        basename={routerBaseName}

        future={{

          v7_startTransition: true,

          v7_relativeSplatPath: true,

        }}

      >

        <LocalizationProvider

          dateAdapter={AdapterDayjs}

          adapterLocale="en"

          dateFormats={{ monthAndYear: "MM/YYYY" } as any}

          localeText={{

            okButtonLabel: "OK",

            cancelButtonLabel: "Cancel",

            clearButtonLabel: "Clear",

            todayButtonLabel: "Today",

          }}


        >

          <App />

        </LocalizationProvider>

      </BrowserRouter>

    </QueryClientProvider>

  </Provider>

);
