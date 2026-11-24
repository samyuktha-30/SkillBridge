import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  LinearProgress,
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
import { KpiCard } from '../../components/common/KpiCard';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { managerApi } from '../../api/managerApi';
import { authApi } from '../../api/authApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { ManagerEmployeePlanRowDto, TrainingMonitoringDto } from '../../types/manager.types';
import type { DepartmentOption } from '../../types/common.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function TrainingMonitoringPage() {
  const [data, setData] = useState<TrainingMonitoringDto | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('All');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState<ManagerEmployeePlanRowDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [res, deps] = await Promise.all([
        managerApi.getTrainingMonitoring({
          search: search || undefined,
          departmentId: departmentId === 'All' ? undefined : departmentId,
          status: status === 'All' ? undefined : status,
        }),
        authApi.getDepartments(),
      ]);
      setData(res);
      setDepartments(deps);
      if (res.rows.length && !selected) setSelected(res.rows[0]);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, [departmentId, search, selected, status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemind = async (employeeId: string) => {
    try {
      const res = await managerApi.sendTrainingReminder(employeeId);
      setSuccess(res.message);
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
            Training &amp; Progress Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor assigned training, track completion, and follow up with your team.
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <BrandIllustration variant="mini-analytics" width={92} />
        </Box>
      </Stack>

      <Grid container spacing={2.25} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            variant="ice"
            title="Assigned plans"
            value={data?.assignedPlansCount ?? 0}
            subtitle={`Across ${data?.departmentsCount ?? 0} departments`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            variant="mint"
            title="Completed plans"
            value={`${data?.completedPlansCount ?? 0} of ${data?.assignedPlansCount ?? 0}`}
            subtitle={`${data && data.assignedPlansCount > 0 ? Math.round((data.completedPlansCount / data.assignedPlansCount) * 100) : 0}% of assigned plans`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            variant="mint"
            title="Needs attention"
            value={data?.needsAttentionCount ?? 0}
            subtitle="Training has not started"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2.5, alignItems: 'flex-end' }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Search employees
          </Typography>
          <TextField fullWidth size="small" placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 6, md: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Department
          </Typography>
          <TextField select fullWidth size="small" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <MenuItem value="All">All departments</MenuItem>
            {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 6, md: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Status
          </Typography>
          <TextField select fullWidth size="small" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="All">All statuses</MenuItem>
            <MenuItem value="InProgress">In progress</MenuItem>
            <MenuItem value="NotStarted">Not started</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button fullWidth variant="outlined" onClick={load} sx={{ bgcolor: 'background.paper' }}>
            Apply filters
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Employee training progress</Typography>
        <Typography variant="caption" color="text.secondary">
          Showing {data?.rows.length ?? 0} employees {selected ? `· ${selected.employeeName} selected` : ''}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', overflowX: 'auto', mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: figmaTokens.mint }}>
              <TableCell>Employee</TableCell>
              <TableCell>Learning plan</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Due date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.rows || []).map((row) => {
              const isSelected = selected?.employeeId === row.employeeId;
              return (
                <TableRow
                  key={row.employeeId}
                  onClick={() => setSelected(row)}
                  sx={{ cursor: 'pointer', backgroundColor: isSelected ? figmaTokens.mint : 'inherit' }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{row.employeeName}</TableCell>
                  <TableCell>{row.planTitle}</TableCell>
                  <TableCell className="tabular-nums">{row.totalCourses > 0 ? `${row.completedCourses} of ${row.totalCourses}` : '—'}</TableCell>
                  <TableCell className="tabular-nums">{row.totalCourses > 0 ? `${row.progressPercent}%` : '—'}</TableCell>
                  <TableCell>{row.dueDateLabel || '—'}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    {row.status === 'NotStarted' ? (
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemind(row.employeeId);
                        }}
                        sx={{ textDecoration: 'underline', p: 0, minWidth: 'auto' }}
                      >
                        Remind
                      </Button>
                    ) : (
                      <Button size="small" sx={{ textDecoration: 'underline', p: 0, minWidth: 'auto' }}>
                        {row.status === 'AssessFirst' ? 'Review' : 'View'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            {selected ? (
              <>
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
                  {selected.employeeName} · {selected.planTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  {selected.completedCourses} of {selected.totalCourses} courses completed · Due {selected.dueDateLabel || 'TBD'}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={selected.progressPercent}
                  sx={{
                    height: 8,
                    borderRadius: 99,
                    backgroundColor: figmaTokens.mint,
                    mb: 2,
                    '& .MuiLinearProgress-bar': { bgcolor: figmaTokens.emerald, borderRadius: 99 },
                  }}
                />
                <Stack spacing={0.75}>
                  {selected.courses.map((c) => (
                    <Typography key={c.moduleId} variant="body2" color="text.secondary">
                      {c.title} — <strong>{c.status}</strong>
                    </Typography>
                  ))}
                </Stack>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">Select an employee row above.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
              Manager follow-up
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {data?.followUpSummary || 'Send reminders to employees who have not started their assigned plans.'}
            </Typography>
            <Button
              variant="outlined"
              disabled={!selected}
              onClick={() => selected && handleRemind(selected.employeeId)}
              sx={{ mb: 1.5 }}
            >
              Send reminder
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              Next review: {data?.nextReviewDateLabel || 'Monthly cycle'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </ManagerWorkspaceLayout>
  );
}
