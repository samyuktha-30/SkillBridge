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
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { EmployeeWorkspaceLayout } from '../../layouts/EmployeeWorkspaceLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { employeeApi } from '../../api/employeeApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import { useAuth } from '../../auth/AuthContext';
import type { ActiveSessionDto, UserSettingsDto } from '../../types/employee.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function EmployeeSettingsPage() {
  const navigate = useNavigate();
  const { user, setThemeMode, updateCurrentUser, logout } = useAuth();
  const [settings, setSettings] = useState<UserSettingsDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');

  const [pwdOpen, setPwdOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessions, setSessions] = useState<ActiveSessionDto[]>([]);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const s = await employeeApi.getSettings();
      setSettings(s);
      setFullName(s.fullName);
      setPhoneNumber(s.phoneNumber || '');
      setLocation(s.location || '');
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleSetting = async (patch: Partial<UserSettingsDto>) => {
    if (!settings) return;
    const optimistic = { ...settings, ...patch };
    setSettings(optimistic);
    if (patch.theme) {
      setThemeMode(patch.theme.toLowerCase() as 'light' | 'dark');
    }
    try {
      const saved = await employeeApi.updateSettings(patch);
      setSettings(saved);
      setSuccess('Preferences updated.');
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updated = await employeeApi.updateProfile({ fullName, phoneNumber, location });
      setSettings(updated);
      if (user) {
        updateCurrentUser({ ...user, fullName: updated.fullName, phoneNumber, location });
      }
      setEditProfileOpen(false);
      setSuccess('Profile updated.');
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleChangePassword = async () => {
    try {
      const res = await employeeApi.changePassword({ currentPassword, newPassword });
      setPwdOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setSuccess(res.message);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleOpenSessions = async () => {
    setSessionsOpen(true);
    try {
      const list = await employeeApi.getActiveSessions();
      setSessions(list);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleDownloadData = async () => {
    try {
      const blob = await employeeApi.exportMyData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillbridge-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await employeeApi.deleteAccount();
      await logout();
      navigate('/');
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <EmployeeWorkspaceLayout topLabel="SETTINGS">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account preferences, notifications, privacy and security.
          </Typography>
        </Box>
        <BrandIllustration variant="security-shield" width={64} />
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="overline" color="text.primary" sx={{ fontWeight: 700 }}>
              ACCOUNT SETTINGS
            </Typography>
            <Stack divider={<Divider />} spacing={1.5} sx={{ mt: 2, mb: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Full Name</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{settings?.fullName || user?.fullName}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Email Address</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{settings?.email || user?.email}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{settings?.employeeCode || user?.employeeCode}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{settings?.departmentName || user?.departmentName || 'Engineering'}</Typography>
              </Stack>
            </Stack>
            <Button variant="contained" size="small" startIcon={<EditOutlinedIcon />} onClick={() => setEditProfileOpen(true)}>
              Edit Profile
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="overline" color="text.primary" sx={{ fontWeight: 700 }}>
              NOTIFICATION PREFERENCES
            </Typography>
            <Stack divider={<Divider />} spacing={1} sx={{ mt: 1.5 }}>
              {[
                { key: 'assessmentReminders' as const, label: 'Assessment Reminders' },
                { key: 'learningPlanUpdates' as const, label: 'Learning Plan Updates' },
                { key: 'trainingDeadlineAlerts' as const, label: 'Training Deadline Alerts' },
                { key: 'systemAnnouncements' as const, label: 'System Announcements' },
                { key: 'emailNotifications' as const, label: 'Email Notifications' },
              ].map((item) => (
                <Stack key={item.key} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2">{item.label}</Typography>
                  <Switch
                    checked={Boolean(settings?.[item.key])}
                    onChange={(e) => handleToggleSetting({ [item.key]: e.target.checked })}
                    color="primary"
                  />
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="overline" color="text.primary" sx={{ fontWeight: 700 }}>
              PRIVACY &amp; SECURITY
            </Typography>
            <Stack divider={<Divider />} spacing={1.5} sx={{ mt: 2, mb: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Change Password</Typography>
                <Button size="small" endIcon={<ChevronRightIcon />} onClick={() => setPwdOpen(true)}>
                  Update
                </Button>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Two-Factor Authentication</Typography>
                <Switch
                  checked={Boolean(settings?.twoFactorEnabled)}
                  onChange={(e) => handleToggleSetting({ twoFactorEnabled: e.target.checked })}
                  color="primary"
                />
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Active Sessions</Typography>
                <Button size="small" endIcon={<ChevronRightIcon />} onClick={handleOpenSessions}>
                  View sessions
                </Button>
              </Stack>
            </Stack>
            <Button variant="contained" size="small" startIcon={<LockOutlinedIcon />} onClick={handleOpenSessions}>
              Manage Account Security
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="overline" color="text.primary" sx={{ fontWeight: 700 }}>
              APPEARANCE &amp; PREFERENCES
            </Typography>
            <Stack divider={<Divider />} spacing={2} sx={{ mt: 2 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Theme</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant={settings?.theme !== 'Dark' ? 'contained' : 'outlined'}
                    onClick={() => handleToggleSetting({ theme: 'Light' })}
                    sx={{
                      bgcolor: settings?.theme !== 'Dark' ? figmaTokens.mint : 'transparent',
                      color: figmaTokens.navy,
                    }}
                  >
                    Light
                  </Button>
                  <Button
                    size="small"
                    variant={settings?.theme === 'Dark' ? 'contained' : 'outlined'}
                    onClick={() => handleToggleSetting({ theme: 'Dark' })}
                  >
                    Dark
                  </Button>
                </Stack>
              </Stack>

              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Language</Typography>
                <TextField
                  select
                  size="small"
                  value={settings?.language || 'English'}
                  onChange={(e) => handleToggleSetting({ language: e.target.value })}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="English (UK)">English (UK)</MenuItem>
                </TextField>
              </Stack>

              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">Time Zone</Typography>
                <TextField
                  select
                  size="small"
                  value={settings?.timeZone || 'IST (UTC +5:30)'}
                  onChange={(e) => handleToggleSetting({ timeZone: e.target.value })}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="IST (UTC +5:30)">IST (UTC +5:30)</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="PST (UTC -8:00)">PST (UTC -8:00)</MenuItem>
                </TextField>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="overline" color="text.primary" sx={{ display: 'block', mb: 2, fontWeight: 700 }}>
          ACCOUNT MANAGEMENT
        </Typography>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Download My Data</Typography>
                <Typography variant="caption" color="text.secondary">
                  Get a copy of your profile and learning activity.
                </Typography>
              </Box>
              <Button variant="contained" size="small" startIcon={<DownloadOutlinedIcon />} onClick={handleDownloadData}>
                Download
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Delete Account</Typography>
                <Typography variant="caption" color="text.secondary">
                  Permanently remove your account and data.
                </Typography>
              </Box>
              <Button variant="outlined" color="error" size="small" onClick={() => setDeleteOpen(true)}>
                Delete Account
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth />
            <TextField label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} fullWidth />
            <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwdOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePassword}>Update Password</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={sessionsOpen} onClose={() => setSessionsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Active Refresh Token Sessions</DialogTitle>
        <DialogContent dividers>
          {!sessions.length ? (
            <Typography variant="body2" color="text.secondary">No active sessions found.</Typography>
          ) : (
            <Stack spacing={1.5}>
              {sessions.map((s) => (
                <Paper key={s.id} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Session {s.id.slice(0, 8)} {s.isCurrent ? '(Current)' : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(s.createdAtUtc).toLocaleString()} · Expires: {new Date(s.expiresAtUtc).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will permanently delete your SkillBridge AI account and revoke all active sessions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteAccount}>Delete Permanently</Button>
        </DialogActions>
      </Dialog>
    </EmployeeWorkspaceLayout>
  );
}
