import * as React from 'react';
import { Box } from "@mui/material";
import ChatProvider from '../../context/ChatProvider';

const ChatLayout = ({ children }: { children?: React.ReactNode }) => {

  return (

    <ChatProvider>

      <Box

        sx={{

          backgroundColor: 'white',

        }}

      >

        <section>

          {children}

        </section>

      </Box>

    </ChatProvider>

  );

};

export default ChatLayout;
