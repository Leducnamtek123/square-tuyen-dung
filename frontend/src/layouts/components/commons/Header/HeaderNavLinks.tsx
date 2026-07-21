'use client';

import * as React from "react";
import Link from "next/link";
import { Box, Button } from "@mui/material";

type HeaderNavLink = {
  id: string;
  label: string;
  path: string;
};

type HeaderNavLinksProps = {
  pages: HeaderNavLink[];
  activePathname: string;
  onClose: () => void;
};

const HeaderNavLinks = ({ pages, activePathname, onClose }: HeaderNavLinksProps) => {
  return (
    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
      {pages.map((page) => (
        <Link href={page.path} key={page.id} onClick={onClose} style={{ textDecoration: "none" }}>
          <Button
            color="inherit"
            variant="text"
            sx={{
              my: 1,
              mr: 0.75,
              color: '#0f172a',
              display: "block",
              whiteSpace: "nowrap",
              textDecoration: "none",
              fontWeight: 700,
              px: 2,
              py: 0.85,
              backgroundColor: activePathname.startsWith(page.path) ? 'rgba(15, 23, 42, 0.06)' : 'transparent',
              border: "1px solid",
              borderColor: activePathname.startsWith(page.path) ? 'rgba(15, 23, 42, 0.10)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.04)',
                borderColor: 'rgba(15, 23, 42, 0.10)',
                textDecoration: "none",
              },
              '&:focus, &:active': {
                textDecoration: "none",
              },
            }}
          >
            {page.label}
          </Button>
        </Link>
      ))}
    </Box>
  );
};

export default HeaderNavLinks;
