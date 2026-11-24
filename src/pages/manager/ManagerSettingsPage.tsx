import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ManagerWorkspaceLayout } from '../../layouts/ManagerWorkspaceLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { employeeApi } from '../../api/employeeApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import { useAuth } from '../../auth/AuthContext';
import type { ActiveSessionDto, UserSettingsDto } from '../../types/employee.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function ManagerSettingsPage() {
  const { setThemeMode } = useAuth();
  const [settings, setSettings] = useState<UserSettingsDto | null>(null);
  const [draft, setDraft] = useState<Partial<UserSettingsDto>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessions, setSessions] = useState<ActiveSessionDto[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const s = await employeeApi.getSettings();
      setSettings(s);
      setDraft(s);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleBool = (field: keyof UserSettingsDto) => {
    setDraft((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveChanges = async () => {
    setError(null);
    try {
      const saved = await employeeApi.updateSettings(draft);
      setSettings(saved);
      setDraft(saved);
      if (saved.theme) {
        setThemeMode(saved.theme.toLowerCase() as 'light' | 'dark');
      }
      setSuccess('Manager settings saved.');
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleCancel = () => {
    if (settings) setDraft(settings);
  };

  const handleDownloadData = async () => {
    try {
      const blob = await employeeApi.exportMyData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manager-account-data.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <ManagerWorkspaceLayout breadcrumb="Manager workspace">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account preferences, notifications, privacy, and security.
          </Typography>
        </Box>
        <BrandIllustration variant="security-shield" width={64} />
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Account settings</Typography>
            <Stack divider={<Divider />} spacing={1.5}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Full name</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{settings?.fullName}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Email address</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{settings?.email}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{settings?.employeeCode}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{settings?.departmentName}</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Notification preferences</Typography>
            <Stack divider={<Divider />} spacing={1.25}>
              {[
                { key: 'assessmentReminders' as const, label: 'Assessment results' },
                { key: 'learningPlanUpdates' as const, label: 'Learning plan updates' },
                { key: 'trainingDeadlineAlerts' as const, label: 'Training deadline alerts' },
                { key: 'monthlyReportDelivery' as const, label: 'Monthly report delivery' },
                { key: 'systemAnnouncements' as const, label: 'System announcements' },
              ].map((item) => {
                const isOn = Boolean(draft[item.key]);
                return (
                  <Stack key={item.key} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => toggleBool(item.key)}
                      sx={{
                        minWidth: 52,
                        py: 0.25,
                        backgroundColor: isOn ? figmaTokens.iceBlue : 'transparent',
                        borderColor: 'divider',
                        color: 'text.primary',
                      }}
                    >
                      {isOn ? 'On' : 'Off'}
                    </Button>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Privacy &amp; security</Typography>
            <Stack divider={<Divider />} spacing={1.5}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Password</Typography>
                <Button size="small" variant="outlined" onClick={() => setPwdOpen(true)}>Change password</Button>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Two-factor authentication</Typography>
                <Button size="small" variant="outlined" onClick={() => toggleBool('twoFactorEnabled')}>
                  {draft.twoFactorEnabled ? 'On' : 'Off'}
                </Button>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Active sessions</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={async () => {
                    setSessionsOpen(true);
                    try {
                      setSessions(await employeeApi.getActiveSessions());
                    } catch {}
                  }}
                >
                  View sessions
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Workspace preferences</Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Theme</Typography>
                <TextField
                  select
                  size="small"
                  value={draft.theme || 'Light'}
                  onChange={(e) => setDraft((p) => ({ ...p, theme: e.target.value as 'Light' | 'Dark' }))}
                  sx={{ minWidth: 190 }}
                >
                  <MenuItem value="Light">Light</MenuItem>
                  <MenuItem value="Dark">Dark</MenuItem>
                </TextField>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Language</Typography>
                <TextField
                  select
                  size="small"
                  value={draft.language || 'English'}
                  onChange={(e) => setDraft((p) => ({ ...p, language: e.target.value }))}
                  sx={{ minWidth: 190 }}
                >
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="English (UK)">English (UK)</MenuItem>
                </TextField>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Time zone</Typography>
                <TextField
                  select
                  size="small"
                  value={draft.timeZone || 'IST (UTC +5:30)'}
                  onChange={(e) => setDraft((p) => ({ ...p, timeZone: e.target.value }))}
                  sx={{ minWidth: 190 }}
                >
                  <MenuItem value="IST (UTC +5:30)">IST (UTC +5:30)</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                </TextField>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Default team view</Typography>
                <TextField
                  select
                  size="small"
                  value={draft.defaultTeamView || 'All departments'}
                  onChange={(e) => setDraft((p) => ({ ...p, defaultTeamView: e.target.value }))}
                  sx={{ minWidth: 190 }}
                >
                  <MenuItem value="All departments">All departments</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                </TextField>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', mb: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Account data</Typography>
            <Typography variant="body2" color="text.secondary">
              Download a copy of your personal information and account preferences.
            </Typography>
          </Box>
          <Button variant="outlined" onClick={handleDownloadData}>Download my data</Button>
        </Stack>
      </Paper>

      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Preferences apply to your manager account only.
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveChanges}
            sx={{ bgcolor: figmaTokens.mint, color: figmaTokens.navy, '&:hover': { bgcolor: figmaTokens.mintBorder } }}
          >
            Save changes
          </Button>
        </Stack>
      </Stack>

      <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField type="password" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} fullWidth />
            <TextField type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwdOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                await employeeApi.changePassword({ currentPassword, newPassword });
                setPwdOpen(false);
                setSuccess('Password changed.');
              } catch (err) {
                setError(extractApiErrorMessage(err));
              }
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={sessionsOpen} onClose={() => setSessionsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Active Sessions</DialogTitle>
        <DialogContent dividers>
          {sessions.map((s) => (
            <Typography key={s.id} variant="body2" sx={{ mb: 1 }}>
              {s.id.slice(0, 8)} · Created {new Date(s.createdAtUtc).toLocaleString()}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ManagerWorkspaceLayout>
  );
}
