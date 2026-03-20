import * as React from 'react';
import { Outlet } from 'react-router-dom';
import ChatProvider from '../../context/ChatProvider';

const ChatLayout = () => {

  return (

    <ChatProvider>

      <div className="bg-white">
        <section>
          <Outlet />
        </section>
      </div>

    </ChatProvider>

  );

};

export default ChatLayout;
