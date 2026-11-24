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
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ManagerWorkspaceLayout } from '../../layouts/ManagerWorkspaceLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { managerApi } from '../../api/managerApi';
import { authApi } from '../../api/authApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { LearningPlanManagementDto, ManagerEmployeePlanRowDto } from '../../types/manager.types';
import type { JobRoleOption } from '../../types/common.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function LearningPlanManagementPage() {
  const [data, setData] = useState<LearningPlanManagementDto | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-30');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRow, setSelectedRow] = useState<ManagerEmployeePlanRowDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [roles, setRoles] = useState<JobRoleOption[]>([]);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanRoleId, setNewPlanRoleId] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const [res, r] = await Promise.all([
        managerApi.getLearningPlanManagement({ status: statusFilter === 'All' ? undefined : statusFilter }),
        authApi.getJobRoles(),
      ]);
      setData(res);
      setRoles(r);
      if (r.length && !newPlanRoleId) setNewPlanRoleId(r[0].id);
      if (res.planTemplates.length && !selectedTemplateId) setSelectedTemplateId(res.planTemplates[0].id);
      if (res.assignedPlans.length && !selectedRow) setSelectedRow(res.assignedPlans[0]);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, [newPlanRoleId, selectedRow, selectedTemplateId, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssignPlan = async () => {
    if (!selectedEmployeeId || !selectedTemplateId) {
      setError('Select both an employee and a learning plan.');
      return;
    }
    try {
      await managerApi.assignLearningPlan({
        employeeId: selectedEmployeeId,
        learningPlanId: selectedTemplateId,
        dueDate,
      });
      setSuccess('Learning plan assigned and notification dispatched.');
      await load();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleSendReminder = async (employeeId: string) => {
    try {
      const res = await managerApi.sendTrainingReminder(employeeId);
      setSuccess(res.message);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleCreateTemplate = async () => {
    if (!newPlanTitle.trim() || !newPlanRoleId) return;
    try {
      await managerApi.createLearningPlanTemplate({
        title: newPlanTitle.trim(),
        targetRoleId: newPlanRoleId,
        estimatedWeeks: 4,
        modules: [],
      });
      setCreateOpen(false);
      setNewPlanTitle('');
      setSuccess('Learning plan template created.');
      await load();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <ManagerWorkspaceLayout breadcrumb="Manager workspace">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: 'flex-start', sm: 'center' } }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            Learning Plan Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Assign development plans and monitor employee course progress.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <BrandIllustration variant="auth-laptop" width={86} />
          </Box>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Create learning plan
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          Assign a learning plan
        </Typography>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Employee"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              {(data?.employees || []).map((e) => (
                <MenuItem key={e.id} value={e.id}>{e.fullName} ({e.departmentName})</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Learning plan"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              {(data?.planTemplates || []).map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <TextField fullWidth size="small" type="date" label="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={{ xs: 12, md: 1.5 }}>
            <Button fullWidth variant="contained" onClick={handleAssignPlan}>
              Assign plan
            </Button>
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
          Assigned employees receive an immediate notification. Existing course completion is retained.
        </Typography>
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mb: 1.5, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Employee learning plans</Typography>
          <Typography variant="caption" color="text.secondary">
            Showing {data?.assignedPlans.length ?? 0} employees {selectedRow ? `· ${selectedRow.employeeName} selected` : ''}
          </Typography>
        </Box>
        <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="All">Status: All</MenuItem>
          <MenuItem value="InProgress">In Progress</MenuItem>
          <MenuItem value="NotStarted">Not Started</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </TextField>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', overflowX: 'auto', mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: figmaTokens.mint }}>
              <TableCell>Employee</TableCell>
              <TableCell>Learning plan</TableCell>
              <TableCell>Courses completed</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Due date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.assignedPlans || []).map((row) => {
              const isSelected = selectedRow?.employeeId === row.employeeId;
              return (
                <TableRow
                  key={row.employeeId}
                  onClick={() => setSelectedRow(row)}
                  sx={{ cursor: 'pointer', backgroundColor: isSelected ? figmaTokens.mint : 'inherit' }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{row.employeeName}</TableCell>
                  <TableCell>{row.planTitle}</TableCell>
                  <TableCell className="tabular-nums">{row.totalCourses > 0 ? `${row.completedCourses} of ${row.totalCourses}` : '—'}</TableCell>
                  <TableCell className="tabular-nums">{row.totalCourses > 0 ? `${row.progressPercent}%` : '—'}</TableCell>
                  <TableCell>{row.dueDateLabel || '—'}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    <Button size="small" sx={{ textDecoration: 'underline', p: 0, minWidth: 'auto' }}>View</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {selectedRow && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                {selectedRow.employeeName} · {selectedRow.planTitle}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: figmaTokens.mint }}>
                    <TableCell>Course</TableCell>
                    <TableCell>Skill</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedRow.courses.map((c) => (
                    <TableRow key={c.moduleId}>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>{c.skillName}</TableCell>
                      <TableCell>{c.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>Plan details</Typography>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                {selectedRow.completedCourses} of {selectedRow.totalCourses} courses completed · {selectedRow.progressPercent}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {selectedRow.targetsSummary}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                {selectedRow.nextActionSummary}
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" size="small" onClick={() => setSelectedEmployeeId(selectedRow.employeeId)}>
                  Edit plan
                </Button>
                <Button variant="contained" size="small" onClick={() => handleSendReminder(selectedRow.employeeId)}>
                  Send reminder
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Create Learning Plan Template</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Plan Title" value={newPlanTitle} onChange={(e) => setNewPlanTitle(e.target.value)} fullWidth />
            <TextField select label="Target Role" value={newPlanRoleId} onChange={(e) => setNewPlanRoleId(e.target.value)} fullWidth>
              {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.title}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTemplate}>Create Plan</Button>
        </DialogActions>
      </Dialog>
    </ManagerWorkspaceLayout>
  );
}
