"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  Stack,
  Chip
} from '@mui/material';

const navigationItems = [
  { href: '/notifications', label: 'All Notifications' },
  { href: '/priority', label: 'Priority Inbox' }
];

export default function AppShell({ children }) {
  const pathname = usePathname();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(247,247,245,0.88)', color: 'text.primary', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(15, 76, 92, 0.12)' }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Stack spacing={0.3}>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
              Campus Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Responsive inbox with priority and viewed-state tracking
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {navigationItems.map((item) => {
              const selected = pathname === item.href;

              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  variant={selected ? 'contained' : 'text'}
                  color={selected ? 'primary' : 'inherit'}
                  sx={{ borderRadius: 999, px: 2 }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
}
