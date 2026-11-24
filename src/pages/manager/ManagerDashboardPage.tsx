import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import { useNavigate } from 'react-router-dom';
import { ManagerWorkspaceLayout } from '../../layouts/ManagerWorkspaceLayout';
import { KpiCard } from '../../components/common/KpiCard';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { TeamPerformanceBarChart } from '../../components/charts/TeamPerformanceBarChart';
import { managerApi } from '../../api/managerApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { ManagerDashboardDto } from '../../types/manager.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function ManagerDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ManagerDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await managerApi.getDashboard();
      setData(res);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalEmp = data?.trainingProgress.totalEmployees || 0;
  const pct = (count: number) => (totalEmp > 0 ? ((count / totalEmp) * 100).toFixed(1) : '0.0');

  return (
    <ManagerWorkspaceLayout breadcrumb="Workspace / Overview">
      {error && (
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}
          sx={{ mb: 2.5 }}
        >
          {error}
        </Alert>
      )}

      <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.15rem' }, mb: 0.5 }}>
            Manager Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor employee skills, track training progress and manage team development.
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <BrandIllustration variant="mini-analytics" width={108} />
        </Box>
      </Stack>

      <Grid container spacing={2.25} sx={{ mb: 3 }}>
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={116} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                variant="mint"
                title="Total Employees"
                value={data?.totalEmployees ?? 0}
                subtitle="Across all departments"
                icon={<PeopleOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                variant="mint"
                title="Active Employees"
                value={data?.activeEmployees ?? 0}
                subtitle="Currently active"
                icon={<PersonOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                variant="mint"
                title="Assessments Completed"
                value={data?.assessmentsCompleted ?? 0}
                subtitle="Completed assessments"
                icon={<AssignmentTurnedInOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                variant="ice"
                title="Employees Requiring Training"
                value={data?.employeesRequiringTraining ?? 0}
                subtitle="Priority skill development"
                icon={<SchoolOutlinedIcon />}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Skill Gap Overview
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Average team proficiency by skill · Target proficiency {data?.targetProficiencyPercent ?? 80}%
            </Typography>

            <Stack spacing={2}>
              {(data?.skillGapOverview || []).map((row) => (
                <Stack key={row.skillName} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Typography variant="body2" sx={{ width: 115, flexShrink: 0, fontWeight: 600 }}>
                    {row.skillName}
                  </Typography>
                  <Box sx={{ flexGrow: 1, position: 'relative' }}>
                    <LinearProgress
                      variant="determinate"
                      value={row.currentPercent}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: figmaTokens.mint,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          backgroundColor: figmaTokens.emerald,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" className="tabular-nums" sx={{ width: 42, textAlign: 'right', fontWeight: 700 }}>
                    {row.currentPercent}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Employee Performance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Latest employee assessment scores
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.4,
                  borderRadius: '8px',
                  bgcolor: figmaTokens.iceBlue,
                  color: figmaTokens.navy,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                {data?.employeePerformance.length ?? 0} employees
              </Box>
            </Stack>
            <TeamPerformanceBarChart data={data?.employeePerformance || []} height={225} />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Employees Needing Attention
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data?.employeesNeedingAttention.length ?? 0} requiring training
              </Typography>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Skill Gap</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.employeesNeedingAttention || []).map((emp) => (
                  <TableRow key={emp.employeeId}>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: figmaTokens.mint, color: figmaTokens.navy, fontSize: '0.72rem', fontWeight: 700 }}>
                          {emp.initials}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{emp.employeeName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{emp.departmentName}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'inline-block', px: 1.25, py: 0.25, borderRadius: '6px', bgcolor: figmaTokens.iceBlue, fontSize: '0.75rem', fontWeight: 600 }}>
                        {emp.primaryGapSkill}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <LinearProgress
                          variant="determinate"
                          value={emp.progressPercent}
                          sx={{ width: 54, height: 6, borderRadius: 99, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: figmaTokens.emerald } }}
                        />
                        <Typography variant="caption" className="tabular-nums">{emp.progressPercent}%</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="contained" size="small" onClick={() => navigate('/manager/skill-gap-analytics')}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Training Progress
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
              Training status across {totalEmp} employees
            </Typography>
            <Stack spacing={2.5}>
              {[
                { label: 'Not Started', count: data?.trainingProgress.notStartedCount ?? 0 },
                { label: 'In Progress', count: data?.trainingProgress.inProgressCount ?? 0 },
                { label: 'Completed', count: data?.trainingProgress.completedCount ?? 0 },
              ].map((row) => (
                <Box key={row.label}>
                  <Stack direction="row" sx={{ mb: 0.75, justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.label}</Typography>
                    <Typography variant="body2" className="tabular-nums" color="text.secondary">
                      {row.count} / {totalEmp} <strong>{pct(row.count)}%</strong>
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Number(pct(row.count))}
                    sx={{
                      height: 8,
                      borderRadius: 99,
                      backgroundColor: figmaTokens.mint,
                      '& .MuiLinearProgress-bar': { bgcolor: figmaTokens.emerald, borderRadius: 99 },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Activities</Typography>
          <Typography variant="caption" color="text.secondary">Latest team updates</Typography>
        </Stack>
        <Grid container spacing={2.5}>
          {(data?.recentActivities || []).map((act) => (
            <Grid key={act.id} size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    bgcolor: figmaTokens.mint,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: figmaTokens.navy,
                    flexShrink: 0,
                  }}
                >
                  {act.category === 'Training' ? <CheckCircleOutlinedIcon fontSize="small" /> : <BarChartOutlinedIcon fontSize="small" />}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{act.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{act.subtitle}</Typography>
                  <Typography variant="caption" color="text.secondary">{act.timeLabel}</Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </ManagerWorkspaceLayout>
  );
}
