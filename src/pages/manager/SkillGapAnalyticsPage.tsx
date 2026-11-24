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
import { useNavigate } from 'react-router-dom';
import { ManagerWorkspaceLayout } from '../../layouts/ManagerWorkspaceLayout';
import { KpiCard } from '../../components/common/KpiCard';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { managerApi } from '../../api/managerApi';
import { authApi } from '../../api/authApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { SkillGapAnalyticsDto } from '../../types/manager.types';
import type { DepartmentOption, JobRoleOption } from '../../types/common.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function SkillGapAnalyticsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<SkillGapAnalyticsDto | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [roles, setRoles] = useState<JobRoleOption[]>([]);
  const [departmentId, setDepartmentId] = useState('All');
  const [jobRoleId, setJobRoleId] = useState('All');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [res, deps, rls] = await Promise.all([
        managerApi.getSkillGapAnalytics({
          departmentId: departmentId === 'All' ? undefined : departmentId,
          jobRoleId: jobRoleId === 'All' ? undefined : jobRoleId,
        }),
        authApi.getDepartments(),
        authApi.getJobRoles(),
      ]);
      setData(res);
      setDepartments(deps);
      setRoles(rls);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, [departmentId, jobRoleId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async () => {
    try {
      const blob = await managerApi.exportSkillGapAnalysis({
        departmentId: departmentId === 'All' ? undefined : departmentId,
        jobRoleId: jobRoleId === 'All' ? undefined : jobRoleId,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skill-gap-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const maxPriority = Math.max(1, ...(data?.prioritySkills || []).map((s) => s.employeesBelowCount));

  return (
    <ManagerWorkspaceLayout breadcrumb="Manager workspace">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            Skill Gap Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Compare assessed skills with role requirements and prioritize development.
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
            title="Assessed employees"
            value={`${data?.assessedEmployeesCount ?? 0} of ${data?.totalEmployeesCount ?? 0}`}
            subtitle={`${Math.max(0, (data?.totalEmployeesCount ?? 0) - (data?.assessedEmployeesCount ?? 0))} employees not yet assessed`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            variant="ice"
            title="Employees with skill gaps"
            value={data?.employeesWithGapsCount ?? 0}
            subtitle={`Of ${data?.assessedEmployeesCount ?? 0} assessed employees`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            variant="ice"
            title="Meeting role requirements"
            value={data?.meetingRequirementsCount ?? 0}
            subtitle="No identified skill gaps"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField select fullWidth size="small" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <MenuItem value="All">Department: All</MenuItem>
            {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField select fullWidth size="small" value={jobRoleId} onChange={(e) => setJobRoleId(e.target.value)}>
            <MenuItem value="All">Job role: All roles</MenuItem>
            {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.title}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={{ px: 2, py: 1, borderRadius: '8px', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Assessment: Latest
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Button fullWidth variant="outlined" onClick={handleExport} sx={{ bgcolor: 'background.paper', height: 40 }}>
            Export analysis
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Priority skills</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
              Employees below the required skill level
            </Typography>

            <Stack spacing={2.25}>
              {(data?.prioritySkills || []).map((ps) => (
                <Stack key={ps.skillName} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Typography variant="body2" sx={{ width: 135, flexShrink: 0, fontWeight: 600 }}>
                    {ps.skillName}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(ps.employeesBelowCount / maxPriority) * 100}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: figmaTokens.mint,
                        '& .MuiLinearProgress-bar': { bgcolor: figmaTokens.emerald, borderRadius: 6 },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" className="tabular-nums" sx={{ width: 28, textAlign: 'right', fontWeight: 700 }}>
                    {ps.employeesBelowCount}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Counts overlap: an employee can have gaps in multiple skills. · Methodology: {data?.analysisMethodology || 'ExplainableRuleBased'}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Recommended actions
            </Typography>
            <Stack spacing={2} sx={{ mb: 2.5 }}>
              {(data?.recommendedActions || []).map((act, idx) => (
                <Box key={act.title}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {idx + 1}. {act.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {act.description}
                  </Typography>
                </Box>
              ))}
              {(data?.clusterInsights || []).map((cl) => (
                <Box key={cl.clusterLabel}>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                    {cl.clusterLabel} ({cl.employeeCount} employees)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Focus: {cl.focusSkills.join(', ')}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Button variant="outlined" onClick={() => navigate('/manager/learning-plans')}>
              Review learning plans
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 700 }}>Employee skill gaps</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Levels use a 1–5 scale
      </Typography>
      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: figmaTokens.iceBlue }}>
              <TableCell>Employee</TableCell>
              <TableCell>Skill</TableCell>
              <TableCell>Current level</TableCell>
              <TableCell>Required level</TableCell>
              <TableCell>Gap</TableCell>
              <TableCell>Recommended action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.employeeSkillGaps || []).map((row, idx) => (
              <TableRow key={`${row.employeeId}-${row.skillName}-${idx}`}>
                <TableCell sx={{ fontWeight: 600 }}>{row.employeeName}</TableCell>
                <TableCell>{row.skillName}</TableCell>
                <TableCell className="tabular-nums">{row.currentLevel ? `${row.currentLevel} / 5` : '—'}</TableCell>
                <TableCell className="tabular-nums">{row.requiredLevel ? `${row.requiredLevel} / 5` : '—'}</TableCell>
                <TableCell>{row.gapLabel}</TableCell>
                <TableCell>{row.recommendedAction}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </ManagerWorkspaceLayout>
  );
}
