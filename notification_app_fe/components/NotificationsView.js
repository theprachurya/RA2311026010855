"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import NotificationCard from './NotificationCard';
import { normalizeNotifications, sortByPriority } from '../lib/notifications';
import { readViewedIds, writeViewedIds } from '../lib/viewed-notifications';

const NOTIFICATION_TYPES = ['All', 'Placement', 'Result', 'Event'];

export default function NotificationsView({ mode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    setViewedIds(readViewedIds());
  }, []);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      setLoading(true);
      setError('');

      try {
        const query = new URLSearchParams();

        if (mode === 'priority') {
          query.set('limit', String(limit));
          query.set('page', String(page));

          if (selectedType !== 'All') {
            query.set('notification_type', selectedType);
          }
        } else {
          query.set('limit', '10');
          query.set('page', String(page));

          if (selectedType !== 'All') {
            query.set('notification_type', selectedType);
          }
        }

        const response = await fetch(`/api/notifications?${query.toString()}`, {
          cache: 'no-store'
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || 'Failed to load notifications');
        }

        const normalized = normalizeNotifications(payload);
        if (!active) {
          return;
        }

        setItems(normalized);
      } catch (loadError) {
        if (active) {
          setError(loadError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [mode, limit, page, selectedType]);

  const filteredItems = useMemo(() => {
    const filtered = selectedType === 'All' ? items : items.filter((item) => item.Type === selectedType);

    if (mode === 'priority') {
      return sortByPriority(filtered).slice(0, limit);
    }

    return filtered;
  }, [items, selectedType, mode, limit]);

  const priorityItems = useMemo(() => sortByPriority(filteredItems), [filteredItems]);

  function toggleViewed(id) {
    const next = new Set(viewedIds);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setViewedIds(next);
    writeViewedIds(next);
  }

  function markAllViewed() {
    const ids = new Set(filteredItems.map((item) => item.ID));
    setViewedIds(ids);
    writeViewedIds(ids);
  }

  const displayItems = mode === 'priority' ? priorityItems : filteredItems;
  const viewedCount = displayItems.filter((item) => viewedIds.has(item.ID)).length;
  const newCount = displayItems.length - viewedCount;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h2" gutterBottom>
          {mode === 'priority' ? 'Priority Inbox' : 'All Notifications'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
          {mode === 'priority'
            ? 'Focus on the highest-value unread notifications first. Adjust the top-n limit and type filter to narrow the feed.'
            : 'Browse the complete notification feed and distinguish new items from already viewed ones.'}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 340px) minmax(0, 1fr)' },
          gap: 2,
          alignItems: 'start'
        }}
      >
        <Box>
          <Card elevation={0} sx={{ border: '1px solid rgba(15, 76, 92, 0.12)' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Summary
              </Typography>
              <Typography variant="h4">{displayItems.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Visible notifications
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="contained" onClick={markAllViewed} disabled={displayItems.length === 0}>
                  Mark visible as viewed
                </Button>
                <Button component={Link} href={mode === 'priority' ? '/notifications' : '/priority'} variant="outlined">
                  {mode === 'priority' ? 'Open all notifications' : 'Open priority inbox'}
                </Button>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="h6">{newCount}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    New
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6">{viewedCount}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Viewed
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card elevation={0} sx={{ border: '1px solid rgba(15, 76, 92, 0.12)' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Notification type"
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value)}
                    fullWidth
                  >
                    {NOTIFICATION_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>

                  {mode === 'priority' ? (
                    <TextField
                      label="Top n"
                      type="number"
                      value={limit}
                      onChange={(event) => setLimit(Math.max(1, Number(event.target.value) || 1))}
                      inputProps={{ min: 1, max: 50 }}
                      fullWidth
                    />
                  ) : (
                    <TextField
                      label="Page"
                      type="number"
                      value={page}
                      onChange={(event) => setPage(Math.max(1, Number(event.target.value) || 1))}
                      inputProps={{ min: 1, max: 20 }}
                      fullWidth
                    />
                  )}
                </Stack>

                {loading ? (
                  <Stack alignItems="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </Stack>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : displayItems.length === 0 ? (
                  <Alert severity="info">No notifications matched the selected filters.</Alert>
                ) : (
                  <Stack spacing={2}>
                    {displayItems.map((notification, index) => (
                      <NotificationCard
                        key={notification.ID}
                        notification={notification}
                        viewed={viewedIds.has(notification.ID)}
                        onToggleViewed={toggleViewed}
                        priorityRank={mode === 'priority' ? index + 1 : undefined}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Stack>
  );
}
