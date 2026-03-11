/*

MyJob Recruitment System - Part of MyJob Platform



Author: Bui Khanh Huy

Email: khuy220@gmail.com

Copyright (c) 2023 Bui Khanh Huy



License: MIT License

See the LICENSE file in the project root for full license information.

*/



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



import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



const queryClient = new QueryClient({

  defaultOptions: {

    queries: {

      refetchOnWindowFocus: false,

      retry: 1,

    },

  },

});



ReactDOM.createRoot(document.getElementById('root')).render(

  <Provider store={store}>

    <QueryClientProvider client={queryClient}>

      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >

        <LocalizationProvider

          dateAdapter={AdapterDayjs}

          adapterLocale="en"

          dateFormats={{ monthAndYear: "MM/YYYY" }}

          localeText={{
            okButtonLabel: "OK",
            cancelButtonLabel: "Cancel",
            clearButtonLabel: "Clear",
            todayButtonLabel: "Today",
          }}

          adapterLocaleData={{ timezone: 'Asia/Ho_Chi_Minh' }}

        >

          <App />

        </LocalizationProvider>

      </BrowserRouter>

    </QueryClientProvider>

  </Provider>

);

