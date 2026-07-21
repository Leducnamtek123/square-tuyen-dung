'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface NavItem {
  id: string;
  type?: 'section' | 'item';
  label: string;
  icon?: React.ElementType;
  to?: string;
  children?: NavItem[];
}

interface MuiShellNavListProps {
  items: NavItem[];
  expandedItems: Record<string, boolean>;
  onToggleGroup: (id: string) => void;
  currentPathname: string;
  isChild?: boolean;
}

const MuiShellNavList = ({
  items,
  expandedItems,
  onToggleGroup,
  currentPathname,
  isChild = false,
}: MuiShellNavListProps) =>
  items.map((item) => {
    if (item.type === 'section') {
      return (
        <ListItem key={item.id} disablePadding>
          <ListItemButton onClick={() => onToggleGroup(item.id)}>
            {item.icon ? (
              <ListItemIcon>
                <item.icon fontSize="small" />
              </ListItemIcon>
            ) : null}
            <ListItemText primary={item.label} slotProps={{ primary: { variant: 'body2', fontWeight: 600 } }} />
            {expandedItems[item.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </ListItemButton>
        </ListItem>
      );
    }

    if (item.children && item.children.length) {
      return (
        <Box key={item.id}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onToggleGroup(item.id)}>
              {item.icon ? (
                <ListItemIcon>
                  <item.icon fontSize="small" />
                </ListItemIcon>
              ) : null}
              <ListItemText primary={item.label} slotProps={{ primary: { variant: 'body2' } }} />
              {expandedItems[item.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expandedItems[item.id]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <MuiShellNavList
                items={item.children}
                expandedItems={expandedItems}
                onToggleGroup={onToggleGroup}
                currentPathname={currentPathname}
                isChild
              />
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItem key={item.id} disablePadding>
        <ListItemButton
          component={item.to ? Link : 'div'}
          href={item.to || ''}
          selected={Boolean(item.to && currentPathname === item.to)}
          sx={{ pl: isChild ? 4 : 2 }}
        >
          {item.icon && !isChild ? (
            <ListItemIcon>
              <item.icon fontSize="small" />
            </ListItemIcon>
          ) : null}
          <ListItemText primary={item.label} slotProps={{ primary: { variant: 'body2' } }} />
        </ListItemButton>
      </ListItem>
    );
  });

export default MuiShellNavList;
