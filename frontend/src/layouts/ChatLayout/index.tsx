// @ts-nocheck
import * as React from 'react';

import { Outlet } from 'react-router-dom';

import { Box } from "@mui/material";

import ChatProvider from '../../context/ChatProvider';

interface Props {
  [key: string]: any;
}



const ChatLayout = () => {

  return (

    <ChatProvider>

      <Box

        sx={{

          backgroundColor: 'white',

        }}

      >

        <section>

          <Outlet />

        </section>

      </Box>

    </ChatProvider>

  );

};

export default ChatLayout;
