import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { EmployeeWorkspaceLayout } from '../../layouts/EmployeeWorkspaceLayout';
import { KpiCard } from '../../components/common/KpiCard';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { ProgressLineChart } from '../../components/charts/ProgressLineChart';
import { employeeApi } from '../../api/employeeApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { EmployeeProgressDto } from '../../types/employee.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function ProgressPage() {
  const [range, setRange] = useState<'1M' | '3M' | '6M' | '1Y'>('1M');
  const [data, setData] = useState<EmployeeProgressDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await employeeApi.getProgress(range);
      setData(res);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <EmployeeWorkspaceLayout topLabel="MY PROGRESS">
      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: 'flex-start', md: 'center' } }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            My Progress
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your learning journey and see how you&apos;re growing.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.25,
            borderRadius: '12px',
            backgroundColor: figmaTokens.mint,
            border: `1px solid ${figmaTokens.mintBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <BrandIllustration variant="mini-analytics" width={68} />
          <Box>
            <Typography variant="subtitle1" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
              Keep going!
            </Typography>
            <Typography variant="body2" color={figmaTokens.slate}>
              You&apos;re making great progress.
            </Typography>
          </Box>
        </Paper>
      </Stack>

      <Grid container spacing={2.25} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            variant="mint"
            title="Overall Progress"
            value={`${data?.overallProgressPercent ?? 0}%`}
            progressPercent={data?.overallProgressPercent ?? 0}
            icon={<TrendingUpOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            variant="mint"
            title="Assessments Completed"
            value={`${data?.assessmentsCompleted ?? 0} / ${data?.totalAssessments ?? 0}`}
            progressPercent={
              data && data.totalAssessments > 0 ? (data.assessmentsCompleted / data.totalAssessments) * 100 : 0
            }
            icon={<AssignmentTurnedInOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            variant="mint"
            title="Skills Improved"
            value={data?.skillsImprovedCount ?? 0}
            progressPercent={Math.min(100, (data?.skillsImprovedCount ?? 0) * 20)}
            icon={<TrackChangesOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            variant="mint"
            title="Learning Hours"
            value={`${data?.learningHours ?? 0} hrs`}
            progressPercent={Math.min(100, (data?.learningHours ?? 0) * 4)}
            icon={<AccessTimeOutlinedIcon />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Progress Overview
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ p: 0.4, borderRadius: '99px', bgcolor: figmaTokens.mint }}>
                {(['1M', '3M', '6M', '1Y'] as const).map((r) => (
                  <Button
                    key={r}
                    size="small"
                    onClick={() => setRange(r)}
                    sx={{
                      minWidth: 40,
                      borderRadius: '99px',
                      py: 0.3,
                      px: 1.25,
                      bgcolor: range === r ? figmaTokens.emerald : 'transparent',
                      color: range === r ? '#FFFFFF' : figmaTokens.navy,
                      '&:hover': { bgcolor: range === r ? figmaTokens.emeraldHover : 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    {r}
                  </Button>
                ))}
              </Stack>
            </Stack>
            <ProgressLineChart data={data?.series || []} height={240} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700 }}>
              Skill-wise Performance
            </Typography>
            <Stack spacing={2.25}>
              {(data?.skillPerformance || []).map((sp) => (
                <Stack key={sp.skillName} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Typography variant="body2" sx={{ width: 130, flexShrink: 0, fontWeight: 600 }}>
                    {sp.skillName}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={sp.percent}
                      sx={{
                        height: 8,
                        borderRadius: 99,
                        backgroundColor: figmaTokens.lavender,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 99,
                          backgroundColor: figmaTokens.emerald,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" className="tabular-nums" sx={{ width: 42, textAlign: 'right', fontWeight: 700 }}>
                    {sp.percent}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700 }}>
              Your Achievements
            </Typography>
            <Grid container spacing={2}>
              {(data?.achievements || []).map((ach) => (
                <Grid key={ach.id} size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center', opacity: ach.unlocked ? 1 : 0.45 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 1,
                        borderRadius: '14px',
                        backgroundColor: figmaTokens.mint,
                        border: `1px solid ${figmaTokens.mintBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: figmaTokens.navy,
                      }}
                    >
                      {ach.unlocked ? <EmojiEventsOutlinedIcon /> : <CheckCircleOutlinedIcon />}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
                      {ach.title}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Recent Activity
            </Typography>
            <Stack spacing={1.75}>
              {(data?.recentActivities || []).map((act) => (
                <Stack key={act.id} direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: figmaTokens.emerald, flexShrink: 0 }} />
                    <Typography variant="body2">{act.summary}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                    {act.relativeTimeLabel}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </EmployeeWorkspaceLayout>
  );
}
