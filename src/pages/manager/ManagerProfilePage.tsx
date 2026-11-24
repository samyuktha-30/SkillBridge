import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ManagerWorkspaceLayout } from '../../layouts/ManagerWorkspaceLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { managerApi } from '../../api/managerApi';
import { employeeApi } from '../../api/employeeApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { ManagerProfileDto } from '../../types/manager.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function ManagerProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ManagerProfileDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await managerApi.getProfile();
      setProfile(res);
      setFullName(res.fullName);
      setPhoneNumber(res.phoneNumber || '');
      setLocation(res.location || '');
      setJobTitle(res.jobTitle);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    try {
      await employeeApi.updateProfile({ fullName, phoneNumber, location, jobTitle });
      setEditOpen(false);
      await load();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <ManagerWorkspaceLayout breadcrumb="Manager workspace">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your personal information and management responsibilities.
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <BrandIllustration variant="hero-learner" width={112} />
        </Box>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{profile?.fullName || 'Manager'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {profile?.jobTitle || 'Engineering Manager'} · {profile?.departmentName || 'Engineering'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage employee development across {profile?.managedDepartmentsLabel || 'assigned departments'}.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setEditOpen(true)}
            sx={{ bgcolor: figmaTokens.mint, color: figmaTokens.navy, '&:hover': { bgcolor: figmaTokens.mintBorder } }}
          >
            Edit profile
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700 }}>Personal information</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Full name" value={profile?.fullName || ''} slotProps={{ input: { readOnly: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Email address" value={profile?.email || ''} slotProps={{ input: { readOnly: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Phone number" value={profile?.phoneNumber || '—'} slotProps={{ input: { readOnly: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Location" value={profile?.location || '—'} slotProps={{ input: { readOnly: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Job title" value={profile?.jobTitle || ''} slotProps={{ input: { readOnly: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Employee ID" value={profile?.employeeCode || ''} slotProps={{ input: { readOnly: true } }} />
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Role and department changes are managed by your administrator.
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Management scope</Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Managed employees</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{profile?.managedEmployeesCount ?? 0}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Departments</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{profile?.managedDepartmentsLabel || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Assessment coverage</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {profile?.assessedEmployeesCount ?? 0} of {profile?.managedEmployeesCount ?? 0} employees
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Employees with skill gaps</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{profile?.employeesWithGapsCount ?? 0}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Development responsibilities</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Review assessments, assign learning plans, and monitor team progress.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Review cadence: {profile?.reviewCadence || 'Monthly'} · Next review: {profile?.nextReviewDateLabel || 'Upcoming'}
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/manager/dashboard')}>
              View team dashboard
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Account access</Typography>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
              {profile?.accessStatus || 'Manager access · Active'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Control sign-in and notification preferences.
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/manager/settings')}>
              Open settings
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Manager Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth />
            <TextField label="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} fullWidth />
            <TextField label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} fullWidth />
            <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </ManagerWorkspaceLayout>
  );
}
