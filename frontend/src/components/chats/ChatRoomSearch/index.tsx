// @ts-nocheck
import React from 'react';

import { TextField } from "@mui/material";

interface Props {
  [key: string]: any;
}



const ChatRoomSearch = ({ value, setValue, placeholder }: Props) => {

  return (

    <TextField

      fullWidth

      id="filled-search"

      type="search"

      variant="outlined"

      size="small"

      placeholder={placeholder}

      value={value}

      onChange={(e) => setValue(e.target.value)}

    />

  );

};

export default ChatRoomSearch;
