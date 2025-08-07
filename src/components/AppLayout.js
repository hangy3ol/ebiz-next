'use client';

import { Menu as MenuIcon, ChevronRight } from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Box,
  Divider,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

import ThemeToggleButton from '@/components/ThemeToggleButton';
import UserMenu from '@/features/auth/components/UserMenu';

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(true);

  const theme = useTheme();
  const transition = theme.transitions.create(['grid-template-columns'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  });

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: open
          ? { xs: '200px 1fr', md: '240px 1fr', lg: '280px 1fr' }
          : '0px 1fr',
        gridTemplateRows: 'auto 1fr',
        height: '100vh',
        transition,
      }}
    >
      {/* Drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          gridRow: '1 / 3',
          gridColumn: '1 / 2',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          '& .MuiDrawer-paper': {
            width: open ? { xs: 200, md: 240, lg: 280 } : 0,
            overflowX: 'hidden',
            transition,
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <IconButton onClick={() => setOpen(false)}>
            <ChevronRight />
          </IconButton>
        </Toolbar>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography>사이드바</Typography>
        </Box>
      </Drawer>

      {/* AppBar */}
      <AppBar
        position="relative"
        sx={{
          gridRow: '1 / 2',
          gridColumn: '2 / 3',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!open && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap>
              EBIZ
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <UserMenu />
            <ThemeToggleButton />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          gridRow: '2 / 3',
          gridColumn: '2 / 3',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
