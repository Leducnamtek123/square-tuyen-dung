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
        <Link href={page.path} key={page.id} onClick={onClose}>
          <Button
            color="inherit"
            variant="text"
            sx={{
              my: 1,
              mr: 0.75,
              color: "white",
              display: "block",
              whiteSpace: "nowrap",
              borderRadius: 999,
              px: 2,
              py: 0.85,
              backgroundColor: activePathname.startsWith(page.path) ? "rgba(255, 255, 255, 0.12)" : "transparent",
              border: "1px solid",
              borderColor: activePathname.startsWith(page.path) ? "rgba(255, 255, 255, 0.22)" : "transparent",
              '&:hover': {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderColor: "rgba(255, 255, 255, 0.15)",
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
