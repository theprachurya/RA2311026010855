"use client";

import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
  Box
} from '@mui/material';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CampaignIcon from '@mui/icons-material/Campaign';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { formatDate } from '../lib/notifications';

const iconMap = {
  Placement: <WorkOutlineIcon fontSize="small" />,
  Result: <ArticleOutlinedIcon fontSize="small" />,
  Event: <CampaignIcon fontSize="small" />
};

export default function NotificationCard({ notification, viewed, onToggleViewed, priorityRank }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: viewed ? 'rgba(15, 76, 92, 0.14)' : 'rgba(201, 123, 99, 0.35)',
        bgcolor: viewed ? 'background.paper' : 'rgba(255, 249, 241, 0.92)',
        overflow: 'hidden'
      }}
    >
      <CardActionArea onClick={() => onToggleViewed(notification.ID)}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  icon={iconMap[notification.Type] ?? <CampaignIcon fontSize="small" />}
                  label={notification.Type}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={viewed ? 'Viewed' : 'New'}
                  size="small"
                  color={viewed ? 'default' : 'secondary'}
                  icon={viewed ? <CheckCircleOutlineIcon fontSize="small" /> : <FiberNewIcon fontSize="small" />}
                />
                {typeof priorityRank === 'number' ? <Chip label={`#${priorityRank}`} size="small" /> : null}
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
                {notification.Message}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {formatDate(notification.Timestamp)}
              </Typography>
            </Stack>

            <Box sx={{ minWidth: 64, textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                ID
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {notification.ID.slice(0, 8)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
