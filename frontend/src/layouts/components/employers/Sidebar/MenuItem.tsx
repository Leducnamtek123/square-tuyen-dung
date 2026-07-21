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
  external?: boolean;
  onClick?: () => void;
  kind?: 'item' | 'group' | 'child';
  badgeContent?: number;
  state?: {
    selected?: boolean;
    expanded?: boolean;
  };
}

const StyledListItemButton = styled(ListItemButton)<{ component?: React.ElementType; href?: string; target?: string; rel?: string }>(({ theme }) => ({
  borderRadius: 0,
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

const MenuItem = ({ icon: Icon, text, to, external = false, onClick, kind = 'item', badgeContent, state }: MenuItemProps) => {
  const pathname = usePathname();
  const isChild = kind === 'child';
  const hasChildren = kind === 'group';
  const isExpanded = state?.expanded ?? false;
  const isActive = to && !external ? pathname === to || pathname.startsWith(to + '/') : false;
  const visibleBadgeContent = typeof badgeContent === 'number' && badgeContent >= 0
    ? badgeContent > 99 ? '99+' : String(badgeContent)
    : null;
  const hasActiveBadge = typeof badgeContent === 'number' && badgeContent > 0;

  return (
    <StyledListItemButton
      component={to ? (external ? 'a' : Link) : 'div'}
      href={to}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      selected={state?.selected || isActive}
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
      {visibleBadgeContent && (
        <Box
          component="span"
          sx={{
            ml: 1,
            minWidth: 18,
            height: 18,
            px: 0.75,
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: hasActiveBadge ? 'error.main' : 'grey.400',
            color: hasActiveBadge ? 'error.contrastText' : 'common.white',
            fontSize: '0.7rem',
            fontWeight: 800,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {visibleBadgeContent}
        </Box>
      )}
      {hasChildren && (
        <Box component="span" sx={{ ml: 'auto' }}>
          {isExpanded ? <ArrowDropDownIcon fontSize="small" /> : <ArrowRightIcon fontSize="small" />}
        </Box>
      )}
    </StyledListItemButton>
  );
};

export default MenuItem;
