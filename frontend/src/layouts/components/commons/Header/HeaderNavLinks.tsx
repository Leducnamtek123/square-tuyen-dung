import * as React from "react";
import Link from "next/link";
import { Box, Button } from "@mui/material";

export type HeaderNavLink = {
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
            color="primary"
            sx={{
              my: 1,
              mr: 0.5,
              color: "white",
              display: "block",
              whiteSpace: "nowrap",
              backgroundColor: activePathname.startsWith(page.path) ? "rgba(255, 255, 255, 0.1)" : null,
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

