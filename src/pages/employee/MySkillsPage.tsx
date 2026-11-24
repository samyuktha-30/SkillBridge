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
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { EmployeeWorkspaceLayout } from '../../layouts/EmployeeWorkspaceLayout';
import { KpiCard } from '../../components/common/KpiCard';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { SkillRadarChart } from '../../components/charts/SkillRadarChart';
import { employeeApi } from '../../api/employeeApi';
import { authApi } from '../../api/authApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { EmployeeSkillsOverviewDto } from '../../types/employee.types';
import type { JobRoleOption } from '../../types/common.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function MySkillsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<EmployeeSkillsOverviewDto | null>(null);
  const [category, setCategory] = useState<'All' | 'Technical' | 'Soft'>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [jobRoles, setJobRoles] = useState<JobRoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeApi.getSkills(category);
      setData(res);
      setSelectedRoleId(res.targetRoleId || '');
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenRoleDialog = async () => {
    setRoleDialogOpen(true);
    try {
      const roles = await authApi.getJobRoles();
      setJobRoles(roles);
    } catch {
      // ignore if unreachable
    }
  };

  const handleSaveRole = async () => {
    if (!selectedRoleId) return;
    setSavingRole(true);
    try {
      await employeeApi.updateTargetRole(selectedRoleId);
      setRoleDialogOpen(false);
      await load();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSavingRole(false);
    }
  };

  const filteredSkills = (data?.skills || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <EmployeeWorkspaceLayout
      searchPlaceholder="Search skills, topics, or resources..."
      searchValue={search}
      onSearchChange={setSearch}
    >
      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: 'flex-start', md: 'center' } }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            My Skills
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your current skills and see where you need to improve.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.5,
            borderRadius: '12px',
            backgroundColor: figmaTokens.iceBlue,
            border: `1px solid ${figmaTokens.iceBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <TrackChangesOutlinedIcon sx={{ color: figmaTokens.navy }} />
          <Box>
            <Typography variant="caption" color={figmaTokens.slate} sx={{ display: "block" }}>
              Your Target Role
            </Typography>
            <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
              {data?.targetRoleTitle || 'Unassigned'}
            </Typography>
          </Box>
          <Button size="small" endIcon={<ArrowForwardIcon />} onClick={handleOpenRoleDialog}>
            Change
          </Button>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <BrandIllustration variant="mini-analytics" width={72} />
          </Box>
        </Paper>
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
                title="Overall Skill Score"
                value={`${data?.overallSkillScorePercent ?? 0}%`}
                deltaLabel={data?.scoreDeltaLabel}
                progressPercent={data?.overallSkillScorePercent ?? 0}
                icon={<BarChartOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title="Skills Met"
                value={`${data?.skillsMetCount ?? 0} / ${data?.totalSkillsCount ?? 0}`}
                progressPercent={
                  data && data.totalSkillsCount > 0 ? (data.skillsMetCount / data.totalSkillsCount) * 100 : 0
                }
                icon={<CheckCircleOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title="Skills with Gap"
                value={data?.skillsWithGapCount ?? 0}
                progressPercent={
                  data && data.totalSkillsCount > 0 ? (data.skillsWithGapCount / data.totalSkillsCount) * 100 : 0
                }
                icon={<ErrorOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title="Improvement Goal"
                value={`${data?.improvementGoalPercent ?? 90}%`}
                progressPercent={data?.improvementGoalPercent ?? 90}
                icon={<EmojiEventsOutlinedIcon />}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Skill Breakdown
              </Typography>
              <Stack direction="row" spacing={1}>
                {(['All', 'Technical', 'Soft'] as const).map((tab) => (
                  <Button
                    key={tab}
                    size="small"
                    variant={category === tab ? 'contained' : 'outlined'}
                    onClick={() => setCategory(tab)}
                    sx={{
                      borderRadius: '99px',
                      backgroundColor: category === tab ? figmaTokens.iceBlue : 'transparent',
                      color: figmaTokens.navy,
                      borderColor: 'divider',
                      '&:hover': { backgroundColor: figmaTokens.iceBlue },
                    }}
                  >
                    {tab === 'Soft' ? 'Soft Skills' : tab}
                  </Button>
                ))}
              </Stack>
            </Stack>

            {!filteredSkills.length ? (
              <Typography variant="body2" color="text.secondary">
                No skill scores found. Complete an assessment to populate your skill breakdown.
              </Typography>
            ) : (
              <Stack spacing={2.25}>
                {filteredSkills.map((skill) => (
                  <Stack key={skill.skillId} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 28,
                        borderRadius: '6px',
                        backgroundColor: figmaTokens.iceBlue,
                        color: figmaTokens.navy,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {skill.code}
                    </Box>
                    <Typography variant="body2" sx={{ width: 125, flexShrink: 0, fontWeight: 600 }}>
                      {skill.name}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(skill.currentLevel / 5) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 99,
                          backgroundColor: '#E2E8F0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 99,
                            backgroundColor: figmaTokens.emerald,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" className="tabular-nums" sx={{ width: 42, textAlign: 'right', fontWeight: 700 }}>
                      {skill.currentLevel} / 5
                    </Typography>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.35,
                        borderRadius: '99px',
                        backgroundColor: skill.status === 'Met' ? figmaTokens.mint : figmaTokens.iceBlue,
                        color: figmaTokens.navy,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        minWidth: 52,
                        textAlign: 'center',
                      }}
                    >
                      {skill.status}
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
              Skills Radar
            </Typography>
            <SkillRadarChart data={data?.radarSkills || []} height={265} />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Assessments
              </Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/employee/assessments')}>
                View All
              </Button>
            </Stack>

            {!data?.recentAssessments?.length ? (
              <Typography variant="body2" color="text.secondary">
                No completed assessments yet.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {data.recentAssessments.map((item) => (
                  <Paper
                    key={item.attemptId}
                    elevation={0}
                    sx={{
                      p: 1.75,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Completed on {item.completedOnLabel} · Score: {item.scorePercent}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.4,
                        borderRadius: '8px',
                        backgroundColor: item.passed ? figmaTokens.mint : figmaTokens.lavender,
                        color: figmaTokens.navy,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      {item.passed ? 'Passed' : 'Needs Review'}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
              <LightbulbOutlinedIcon fontSize="small" color="action" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Key Insights
              </Typography>
            </Stack>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                backgroundColor: figmaTokens.mint,
                border: `1px solid ${figmaTokens.mintBorder}`,
              }}
            >
              <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 500 }}>
                {data?.keyInsight || 'Complete your role skill assessment to receive explainable skill-gap insights.'}
              </Typography>
              {data?.methodologyNote && (
                <Typography variant="caption" color={figmaTokens.slate} sx={{ display: 'block', mt: 1 }}>
                  {data.methodologyNote}
                </Typography>
              )}
            </Paper>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Change Target Role</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Target Job Role"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            sx={{ mt: 1 }}
          >
            {jobRoles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.title} ({role.departmentName})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={savingRole || !selectedRoleId} onClick={handleSaveRole}>
            {savingRole ? 'Updating...' : 'Update Target Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </EmployeeWorkspaceLayout>
  );
}
