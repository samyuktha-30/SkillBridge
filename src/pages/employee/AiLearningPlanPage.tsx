import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import { useNavigate } from 'react-router-dom';
import { EmployeeWorkspaceLayout } from '../../layouts/EmployeeWorkspaceLayout';
import { KpiCard } from '../../components/common/KpiCard';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { employeeApi } from '../../api/employeeApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { LearningPlanOverviewDto } from '../../types/employee.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function AiLearningPlanPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<LearningPlanOverviewDto | null>(null);
  const [viewMode, setViewMode] = useState<'roadmap' | 'list'>('roadmap');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeApi.getLearningPlan();
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

  const handleGenerateAiPlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await employeeApi.generateLearningPlan();
      setData(res);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleModuleAction = async (moduleId: string, nextStatus: 'InProgress' | 'Completed') => {
    try {
      const res = await employeeApi.updateModuleStatus(moduleId, nextStatus);
      setData(res);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <EmployeeWorkspaceLayout topLabel="AI LEARNING PLAN">
      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: 'flex-start', md: 'center' } }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            AI Learning Plan
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your personalized learning roadmap to bridge skill gaps and achieve your career goals.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeOutlinedIcon />}
            disabled={generating}
            onClick={handleGenerateAiPlan}
          >
            {generating ? 'Generating with Gemini...' : 'Generate AI Plan'}
          </Button>
          <Paper
            elevation={0}
            onClick={() => navigate('/employee/skills')}
            sx={{
              px: 2.25,
              py: 1.25,
              borderRadius: '12px',
              backgroundColor: figmaTokens.iceBlue,
              border: `1px solid ${figmaTokens.iceBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
            }}
          >
            <TrackChangesOutlinedIcon sx={{ color: figmaTokens.navy }} />
            <Box>
              <Typography variant="caption" color={figmaTokens.slate} sx={{ display: "block" }}>
                Target Role
              </Typography>
              <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
                {data?.targetRoleTitle || 'Software Developer'}
              </Typography>
            </Box>
          </Paper>
        </Stack>
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
                title="Plan Progress"
                value={`${data?.planProgressPercent ?? 0}%`}
                subtitle={data?.statusLabel || 'On track'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                variant="mint"
                title="Topics to Complete"
                value={`${data?.completedModulesCount ?? 0} / ${data?.totalModulesCount ?? 0}`}
                progressPercent={data?.planProgressPercent ?? 0}
                icon={<MenuBookOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                variant="mint"
                title="Timeline"
                value={data?.timelineLabel || '2 Weeks'}
                subtitle="Left"
                icon={<AccessTimeOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                variant="mint"
                title="Goal"
                value={data?.goalLabel || 'Role Ready'}
                subtitle="Target Benchmark"
                icon={<EmojiEventsOutlinedIcon />}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" sx={{ mb: 2.5, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Your Learning Roadmap
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant={viewMode === 'roadmap' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('roadmap')}
                >
                  Roadmap
                </Button>
                <Button
                  size="small"
                  variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('list')}
                >
                  List View
                </Button>
              </Stack>
            </Stack>

            {!data?.steps?.length ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click &quot;Generate AI Plan&quot; to create a Gemini-powered roadmap tailored to your SQL Server skill gaps.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {data.steps.map((step) => {
                  const isActive = step.status === 'InProgress';
                  const isDone = step.status === 'Completed';
                  return (
                    <Paper
                      key={step.moduleId}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isActive ? figmaTokens.navy : 'divider',
                        backgroundColor: isActive ? figmaTokens.iceBlue : 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                      }}
                    >
                      <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 220, alignItems: "center" }}>
                        {viewMode === 'roadmap' && (
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              backgroundColor: isDone ? figmaTokens.emerald : isActive ? figmaTokens.emerald : figmaTokens.lavender,
                              color: isDone || isActive ? '#FFFFFF' : figmaTokens.navy,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              flexShrink: 0,
                            }}
                          >
                            {isDone ? <CheckCircleIcon fontSize="small" /> : step.orderIndex}
                          </Box>
                        )}
                        <Box
                          sx={{
                            px: 1.25,
                            py: 0.4,
                            borderRadius: '6px',
                            backgroundColor: isDone ? figmaTokens.mint : '#FFFFFF',
                            border: '1px solid',
                            borderColor: 'divider',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            minWidth: 84,
                            textAlign: 'center',
                          }}
                        >
                          {isDone ? 'Completed' : isActive ? 'In Progress' : 'Upcoming'}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {step.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {step.description}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        <Typography variant="caption" color="text.secondary" className="tabular-nums">
                          {step.estimatedHours} hrs
                        </Typography>
                        {isDone ? (
                          <Button variant="contained" size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/employee/resources')}>
                            Review
                          </Button>
                        ) : isActive ? (
                          <Button
                            variant="contained"
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => handleModuleAction(step.moduleId, 'Completed')}
                          >
                            Complete
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleModuleAction(step.moduleId, 'InProgress')}
                          >
                            Start
                          </Button>
                        )}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Recommended Resources
              </Typography>
              <Stack spacing={1.5}>
                {(data?.recommendedResources || []).slice(0, 3).map((res) => (
                  <Paper
                    key={res.id}
                    elevation={0}
                    onClick={() => navigate('/employee/resources')}
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 46,
                          height: 40,
                          borderRadius: '8px',
                          backgroundColor: figmaTokens.lavender,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MenuBookOutlinedIcon fontSize="small" sx={{ color: figmaTokens.emerald }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {res.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {res.resourceType} · {res.durationLabel}
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowForwardIcon fontSize="small" color="action" />
                  </Paper>
                ))}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.75,
                borderRadius: '14px',
                backgroundColor: figmaTokens.lavender,
                border: `1px solid ${figmaTokens.lavenderBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle1" color={figmaTokens.navy} sx={{ mb: 0.5, fontWeight: 700 }}>
                  Ask Your Learning Assistant
                </Typography>
                <Typography variant="caption" color={figmaTokens.slate} sx={{ display: 'block', mb: 2 }}>
                  Get help with concepts, doubts and study tips.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/employee/ai-assistant')}
                >
                  Chat Now
                </Button>
              </Box>
              <BrandIllustration variant="ai-bot" width={72} />
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </EmployeeWorkspaceLayout>
  );
}
