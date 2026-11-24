import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNavigate } from 'react-router-dom';
import { EmployeeWorkspaceLayout } from '../../layouts/EmployeeWorkspaceLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { employeeApi } from '../../api/employeeApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { NotificationItemDto } from '../../types/employee.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

const filterTabs = [
  { label: 'All', icon: <AppsOutlinedIcon fontSize="small" /> },
  { label: 'Assessment', icon: <AssignmentOutlinedIcon fontSize="small" /> },
  { label: 'Learning', icon: <MenuBookOutlinedIcon fontSize="small" /> },
  { label: 'System', icon: <SettingsOutlinedIcon fontSize="small" /> },
  { label: 'Reminder', icon: <AccessTimeOutlinedIcon fontSize="small" /> },
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NotificationItemDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await employeeApi.getNotifications({
        category: category === 'All' ? undefined : category,
        page,
        pageSize: 7,
      });
      setItems(res.items);
      setTotalPages(Math.max(1, res.totalPages));
      if (res.items.length && !res.items.some((i) => i.id === selectedId)) {
        setSelectedId(res.items[0].id);
      }
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, [category, page, selectedId]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = items.find((i) => i.id === selectedId) || items[0] || null;

  const handleSelect = async (item: NotificationItemDto) => {
    setSelectedId(item.id);
    if (!item.isRead) {
      try {
        await employeeApi.markNotificationRead(item.id);
        setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, isRead: true } : x)));
      } catch {
        // silent
      }
    }
  };

  return (
    <EmployeeWorkspaceLayout topLabel="NOTIFICATIONS">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Mint Header Band matching Figma */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '14px',
          backgroundColor: figmaTokens.mint,
          border: `1px solid ${figmaTokens.mintBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5, color: figmaTokens.navy }}>
            Notifications
          </Typography>
          <Typography variant="body1" color={figmaTokens.slate}>
            Stay updated with your assessments, learning plan and important updates.
          </Typography>
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '14px',
            backgroundColor: figmaTokens.lavender,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 32, color: figmaTokens.navy }} />
        </Box>
      </Paper>

      <Stack direction="row" spacing={1.25} useFlexGap sx={{ mb: 2.5, flexWrap: "wrap" }}>
        {filterTabs.map((tab) => {
          const active = category === tab.label;
          return (
            <Button
              key={tab.label}
              size="small"
              startIcon={tab.icon}
              variant={active ? 'contained' : 'outlined'}
              onClick={() => {
                setCategory(tab.label);
                setPage(1);
              }}
              sx={{
                borderRadius: '99px',
                backgroundColor: active ? figmaTokens.emerald : 'background.paper',
                color: active ? '#FFFFFF' : 'text.primary',
                borderColor: 'divider',
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            {!items.length ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications in this category.
                </Typography>
              </Box>
            ) : (
              items.map((item) => {
                const active = selected?.id === item.id;
                return (
                  <Box
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: active ? figmaTokens.lavender : 'background.paper',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1.75} sx={{ alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          backgroundColor: active ? figmaTokens.mint : figmaTokens.lavender,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: figmaTokens.navy,
                          flexShrink: 0,
                        }}
                      >
                        <AssignmentOutlinedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.message}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0, alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        {item.relativeTimeLabel}
                      </Typography>
                      {!item.isRead && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: figmaTokens.emerald }} />
                      )}
                    </Stack>
                  </Box>
                );
              })
            )}
          </Paper>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
            {selected ? (
              <Box>
                <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: figmaTokens.mint,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AssignmentOutlinedIcon fontSize="small" color="action" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {selected.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selected.relativeTimeLabel} · {selected.createdAtLabel}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.4,
                      borderRadius: '99px',
                      bgcolor: figmaTokens.iceBlue,
                      color: figmaTokens.navy,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {selected.category}
                  </Box>
                </Stack>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    backgroundColor: figmaTokens.mint,
                    border: `1px solid ${figmaTokens.mintBorder}`,
                    mb: 3,
                  }}
                >
                  <Typography variant="body2" color={figmaTokens.navy}>
                    {selected.message}
                  </Typography>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <BrandIllustration variant="notification-calendar" width={175} />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowOutlinedIcon />}
                  onClick={() => navigate(selected.actionRoute || '/employee/assessments')}
                >
                  {selected.actionLabel || 'Go to Assessment'}
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Select a notification to view details.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </EmployeeWorkspaceLayout>
  );
}
