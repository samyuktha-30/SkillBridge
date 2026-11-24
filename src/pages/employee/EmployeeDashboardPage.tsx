import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { EmployeeWorkspaceLayout } from '../../layouts/EmployeeWorkspaceLayout';
import { KpiCard } from '../../components/common/KpiCard';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { SkillRadarChart } from '../../components/charts/SkillRadarChart';
import { employeeApi } from '../../api/employeeApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { EmployeeDashboardDto } from '../../types/employee.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<EmployeeDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recIndex, setRecIndex] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeApi.getDashboard();
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

  const currentRec = data?.recommendedResources?.[recIndex];

  return (
    <EmployeeWorkspaceLayout topLabel="EMPLOYEE DASHBOARD">
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={load}>
              Retry
            </Button>
          }
          sx={{ mb: 2.5 }}
        >
          {error}
        </Alert>
      )}

      {/* Welcome Banner Row */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: 'flex-start', lg: 'center' } }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.15rem' }, mb: 0.5 }}>
            Welcome back, {data?.firstName || 'Learner'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your progress, bridge skill gaps and grow your career.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: "center" }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <BrandIllustration variant="mini-analytics" width={120} />
          </Box>
          <Paper
            elevation={0}
            onClick={() => navigate('/employee/skills')}
            sx={{
              px: 2.5,
              py: 1.5,
              borderRadius: '12px',
              backgroundColor: figmaTokens.iceBlue,
              border: `1px solid ${figmaTokens.iceBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              cursor: 'pointer',
            }}
          >
            <WorkOutlinedIcon sx={{ color: figmaTokens.navy }} />
            <Box>
              <Typography variant="caption" color={figmaTokens.slate} sx={{ display: "block" }}>
                Target Role
              </Typography>
              <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
                {data?.targetRoleTitle || 'Select Target Role'}
              </Typography>
            </Box>
            <Box sx={{ borderLeft: '1px solid #B6CFE8', pl: 2 }}>
              <Typography variant="caption" color={figmaTokens.slate} sx={{ display: "block" }}>
                Placement Batch
              </Typography>
              <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
                {data?.batchLabel || 'Active Cohort'}
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Stack>

      {/* 4 KPI Cards */}
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
                title="Assessment Status"
                value={data?.assessmentStatusLabel || 'Pending'}
                subtitle={data?.lastAssessedLabel || 'Take your baseline test'}
                icon={<AssignmentTurnedInOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                variant="mint"
                title="Skill Gaps"
                value={`${data?.skillGapsCount ?? 0} Skills`}
                subtitle={(data?.skillGapsCount ?? 0) > 0 ? 'Need Improvement' : 'All targets met'}
                icon={<TrackChangesOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                variant="ice"
                title="Learning Plan"
                value={`${data?.learningPlanPercent ?? 0}%`}
                progressPercent={data?.learningPlanPercent ?? 0}
                icon={<SchoolOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                variant="mint"
                title="Overall Progress"
                value={`${data?.overallProgressPercent ?? 0}%`}
                progressPercent={data?.overallProgressPercent ?? 0}
                icon={<TrendingUpOutlinedIcon />}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Middle Row: Skill Overview Radar + Learning Roadmap */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" sx={{ mb: 1.5, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Your Skill Overview
              </Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/employee/skills')}>
                View Details
              </Button>
            </Stack>
            <SkillRadarChart data={data?.radarSkills || []} height={265} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Your Learning Roadmap
              </Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/employee/learning-plan')}>
                View Plan
              </Button>
            </Stack>

            {!data?.roadmapSteps?.length ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No active learning roadmap yet. Complete an assessment or generate an AI learning plan.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/employee/learning-plan')}>
                  Go to AI Learning Plan
                </Button>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {data.roadmapSteps.slice(0, 4).map((step) => {
                  const isActive = step.status === 'InProgress';
                  const isDone = step.status === 'Completed';
                  return (
                    <Box
                      key={step.moduleId}
                      sx={{
                        p: 1.5,
                        borderRadius: '10px',
                        backgroundColor: isActive ? figmaTokens.mint : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Stack direction="row" spacing={1.75} sx={{ minWidth: 0, alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            backgroundColor: isDone || isActive ? '#FFFFFF' : figmaTokens.mint,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isDone || isActive ? figmaTokens.emerald : 'text.secondary',
                            flexShrink: 0,
                          }}
                        >
                          {isDone ? (
                            <CheckCircleOutlinedIcon fontSize="small" />
                          ) : isActive ? (
                            <MenuBookOutlinedIcon fontSize="small" />
                          ) : (
                            <LockOutlinedIcon fontSize="small" />
                          )}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                            {step.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {isDone
                              ? 'Completed'
                              : isActive
                              ? step.dueDateLabel || `${step.estimatedHours} hrs`
                              : 'Unlocks after previous module'}
                          </Typography>
                        </Box>
                      </Stack>

                      {isActive && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate('/employee/learning-plan')}
                        >
                          Continue
                        </Button>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Row: Recommended for You + Upcoming Activities + Keep Learning CTA */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Recommended for You
              </Typography>
              {(data?.recommendedResources?.length ?? 0) > 1 && (
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setRecIndex((i) => (i - 1 + (data?.recommendedResources.length || 1)) % (data?.recommendedResources.length || 1))
                    }
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setRecIndex((i) => (i + 1) % (data?.recommendedResources.length || 1))}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Stack>

            {currentRec ? (
              <Box>
                <Stack direction="row" spacing={1.75} sx={{ mb: 1.5, alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 68,
                      height: 58,
                      borderRadius: '10px',
                      backgroundColor: figmaTokens.lavender,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color: figmaTokens.navy,
                      flexShrink: 0,
                    }}
                  >
                    {currentRec.skillName}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                      {currentRec.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {currentRec.durationLabel} · {currentRec.difficulty}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  {currentRec.description}
                </Typography>
                <Button variant="contained" size="small" onClick={() => navigate('/employee/resources')}>
                  Start Learning
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Take an assessment to unlock targeted recommendations.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Upcoming Activities
              </Typography>
              <CalendarTodayOutlinedIcon fontSize="small" color="action" />
            </Stack>

            {!data?.upcomingActivities?.length ? (
              <Typography variant="body2" color="text.secondary">
                No upcoming deadlines scheduled.
              </Typography>
            ) : (
              <Stack spacing={1.75}>
                {data.upcomingActivities.map((act) => (
                  <Stack key={act.id} direction="row" onClick={() => navigate(act.actionRoute || '/employee/assessments')} sx={{ cursor: 'pointer', justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                        {act.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {act.dueLabel}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.4,
                        borderRadius: '6px',
                        backgroundColor: figmaTokens.mint,
                        color: figmaTokens.navy,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {act.daysLeftLabel}
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '14px',
              backgroundColor: figmaTokens.lavender,
              border: `1px solid ${figmaTokens.lavenderBorder}`,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" color={figmaTokens.navy} sx={{ mb: 0.75, fontWeight: 700 }}>
                Keep Learning!
              </Typography>
              <Typography variant="body2" color={figmaTokens.slate} sx={{ mb: 2 }}>
                You&apos;re on the right path to build a stronger career.
              </Typography>
              <Button
                variant="contained"
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/employee/progress')}
              >
                View Progress
              </Button>
            </Box>
            <BrandIllustration variant="graduation-cap" width={92} />
          </Paper>
        </Grid>
      </Grid>
    </EmployeeWorkspaceLayout>
  );
}
