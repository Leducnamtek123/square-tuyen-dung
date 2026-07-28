import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, ListItemIcon, ListItemText, ListItemButton, Tooltip, Menu, MenuItem as MuiMenuItem, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

export interface SubMenuItemData {
  text: string;
  to: string;
  external?: boolean;
  badgeContent?: number;
  isSelected?: boolean;
}

interface MenuItemProps {
  icon?: React.ElementType;
  text: string;
  to?: string;
  external?: boolean;
  onClick?: () => void;
  kind?: 'item' | 'group' | 'child';
  badgeContent?: number;
  isCollapsed?: boolean;
  subItems?: SubMenuItemData[];
  state?: {
    selected?: boolean;
    expanded?: boolean;
  };
}

const StyledListItemButton = styled(ListItemButton)<{ component?: React.ElementType; href?: string; target?: string; rel?: string }>(({ theme }) => ({
  borderRadius: '10px',
  margin: '2px 8px',
  padding: '8px 12px',
  color: '#475569',
  textDecoration: 'none',
  position: 'relative',
  transition: 'all 0.15s ease-in-out',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    textDecoration: 'none',
    '& .MuiListItemIcon-root': {
      color: '#0f172a',
    },
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    color: '#2563eb',
    fontWeight: 600,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '18%',
      bottom: '18%',
      width: 4,
      borderRadius: '0 4px 4px 0',
      backgroundColor: '#2563eb',
    },
    '&:hover': {
      backgroundColor: 'rgba(37, 99, 235, 0.12)',
      color: '#2563eb',
    },
    '& .MuiListItemIcon-root': {
      color: '#2563eb',
    },
  },
  '& .MuiTypography-root': {
    color: 'inherit',
    fontWeight: 'inherit',
  },
  '& .MuiListItemIcon-root': {
    color: '#64748b',
    transition: 'color 0.15s ease-in-out',
  },
}));

const MenuItem = ({ icon: Icon, text, to, external = false, onClick, kind = 'item', badgeContent, isCollapsed = false, subItems, state }: MenuItemProps) => {
  const pathname = usePathname();
  const isChild = kind === 'child';
  const hasChildren = kind === 'group';
  const isExpanded = state?.expanded ?? false;
  const isActive = to && !external ? pathname === to || pathname.startsWith(to + '/') : false;
  const isGroupSelected = hasChildren && subItems ? subItems.some((s) => s.isSelected) : false;
  const isSelected = state?.selected || isActive || isGroupSelected;
  const visibleBadgeContent = typeof badgeContent === 'number' && badgeContent >= 0
    ? badgeContent > 99 ? '99+' : String(badgeContent)
    : null;
  const hasActiveBadge = typeof badgeContent === 'number' && badgeContent > 0;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isCollapsed && hasChildren && subItems && subItems.length > 0) {
      setAnchorEl(e.currentTarget);
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const itemContent = (
    <StyledListItemButton
      component={to ? (external ? 'a' : Link) : 'div'}
      href={to}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={handleClick}
      selected={isSelected}
      sx={{
        pl: isCollapsed ? 0 : (isChild ? 3.5 : 1.75),
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        minHeight: 42,
        px: isCollapsed ? 0 : undefined,
        mx: isCollapsed ? 1 : '8px',
      }}
    >
      {!isChild && Icon && (
        <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 32, mr: isCollapsed ? 0 : 1, justifyContent: 'center' }}>
          <Icon sx={{ fontSize: 20 }} />
        </ListItemIcon>
      )}
      {isChild && (
        <Box
          sx={{
            width: isSelected ? 7 : 5,
            height: isSelected ? 7 : 5,
            borderRadius: '50%',
            backgroundColor: isSelected ? '#2563eb' : '#cbd5e1',
            boxShadow: isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.18)' : 'none',
            mr: isCollapsed ? 0 : 2,
            ml: isCollapsed ? 0 : 0.5,
            transition: 'all 0.15s ease-in-out',
            flexShrink: 0,
          }}
        />
      )}
      {!isCollapsed && (
        <>
          <ListItemText
            primary={text}
            slotProps={{
              primary: {
                variant: 'body2',
                fontSize: isChild ? '0.83rem' : '0.85rem',
                fontWeight: isSelected ? 600 : 500,
                noWrap: true,
                sx: {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }
              }
            }}
          />
          {visibleBadgeContent && (
            <Box
              component="span"
              sx={{
                ml: 1,
                minWidth: 20,
                height: 20,
                px: 0.75,
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: hasActiveBadge ? '#ef4444' : 'rgba(37, 99, 235, 0.08)',
                color: hasActiveBadge ? '#ffffff' : '#2563eb',
                fontSize: '0.72rem',
                fontWeight: 700,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {visibleBadgeContent}
            </Box>
          )}
          {hasChildren && (
            <Box component="span" sx={{ ml: 'auto', display: 'flex', alignItems: 'center', color: '#94a3b8', flexShrink: 0 }}>
              {isExpanded ? <ArrowDropDownIcon fontSize="small" /> : <ArrowRightIcon fontSize="small" />}
            </Box>
          )}
        </>
      )}
    </StyledListItemButton>
  );

  return (
    <>
      {isCollapsed ? (
        <Tooltip title={text} placement="right" arrow slotProps={{ tooltip: { sx: { bgcolor: '#0f172a', fontSize: '0.8rem', py: 0.75, px: 1.5, fontWeight: 500 } } }}>
          <Box sx={{ width: '100%' }}>
            {itemContent}
          </Box>
        </Tooltip>
      ) : (
        itemContent
      )}

      {isCollapsed && hasChildren && subItems && subItems.length > 0 && (
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          slotProps={{
            paper: {
              elevation: 4,
              sx: {
                ml: 1,
                minWidth: 190,
                borderRadius: '12px',
                py: 0.5,
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1, bgcolor: '#f8fafc' }}>
            <Typography variant="caption" fontWeight={700} color="#64748b" letterSpacing={0.3}>
              {text}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          {subItems.map((sub, idx) => (
            <MuiMenuItem
              key={idx}
              component={sub.external ? 'a' : Link}
              href={sub.to}
              target={sub.external ? '_blank' : undefined}
              rel={sub.external ? 'noopener noreferrer' : undefined}
              onClick={handleCloseMenu}
              selected={sub.isSelected}
              sx={{
                py: 1,
                px: 2,
                fontSize: '0.84rem',
                fontWeight: sub.isSelected ? 600 : 400,
                color: sub.isSelected ? '#2563eb' : '#334155',
                bgcolor: sub.isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                '&:hover': {
                  bgcolor: sub.isSelected ? 'rgba(37, 99, 235, 0.12)' : '#f1f5f9',
                },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{sub.text}</span>
              {typeof sub.badgeContent === 'number' && sub.badgeContent > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    minWidth: 18,
                    height: 18,
                    px: 0.5,
                    borderRadius: 999,
                    bgcolor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sub.badgeContent}
                </Box>
              )}
            </MuiMenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default MenuItem;
