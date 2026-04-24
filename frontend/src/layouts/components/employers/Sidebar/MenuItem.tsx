'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

interface MenuItemProps {
  icon?: React.ElementType;
  text: string;
  to?: string;
  onClick?: () => void;
  isSelected?: boolean;
  isExpanded?: boolean;
  hasChildren?: boolean;
  isChild?: boolean;
}

const StyledListItemButton = styled(ListItemButton)<{ component?: React.ElementType; href?: string }>(({ theme }) => ({
  borderRadius: '8px',
  marginBottom: '2px',
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.primary.background,
    color: theme.palette.text.secondary,
    textDecoration: 'none',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.background,
    color: theme.palette.primary.main,
    fontWeight: 600,
    '&:hover': {
      backgroundColor: theme.palette.primary.background,
      color: theme.palette.primary.main,
    },
  },
  '& .MuiTypography-root': {
    color: 'inherit',
  },
  '& .MuiListItemIcon-root': {
    color: 'inherit',
  },
  '&.active': {
    backgroundColor: theme.palette.primary.background,
    color: theme.palette.primary.main,
    fontWeight: 600,
    '&:hover': {
      backgroundColor: theme.palette.primary.background,
      color: theme.palette.primary.main,
    },
  },
}));

const MenuItem = ({ icon: Icon, text, to, onClick, isSelected, isExpanded, hasChildren, isChild }: MenuItemProps) => {
  const pathname = usePathname();
  const isActive = to ? pathname === to || pathname.startsWith(to + '/') : false;

  return (
    <StyledListItemButton
      component={to ? Link : 'div'}
      href={to}
      onClick={onClick}
      selected={isSelected || isActive}
      sx={{
        pl: isChild ? 3 : 2,
        ...(hasChildren ? {} : { '& .MuiListItemIcon-root': { ml: 0 } })
      }}
    >
      {!isChild && Icon && (
        <ListItemIcon sx={{ minWidth: 35 }}>
          <Icon fontSize="small" />
        </ListItemIcon>
      )}
      {isChild && (
        <Box
          sx={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: 'text.secondary',
            mr: 1.5,
            ml: 1,
          }}
        />
      )}
      <ListItemText
        primary={text}
        slotProps={{
          primary: {
            variant: 'body2',
            fontSize: '0.9rem',
          }
        }}
      />
      {hasChildren && (
        <Box component="span" sx={{ ml: 'auto' }}>
          {isExpanded ? <ArrowDropDownIcon fontSize="small" /> : <ArrowRightIcon fontSize="small" />}
        </Box>
      )}
    </StyledListItemButton>
  );
};

export default MenuItem;
