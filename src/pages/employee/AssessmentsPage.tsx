import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { EmployeeWorkspaceLayout } from '../../layouts/EmployeeWorkspaceLayout';
import { KpiCard } from '../../components/common/KpiCard';
import { employeeApi } from '../../api/employeeApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type {
  AssessmentResultDto,
  AssessmentSessionDto,
  AssessmentsOverviewDto,
} from '../../types/employee.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function AssessmentsPage() {
  const [data, setData] = useState<AssessmentsOverviewDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending' | 'Upcoming'>('All');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<AssessmentSessionDto | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState<AssessmentResultDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeApi.getAssessments({
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: search || undefined,
        category: categoryFilter === 'All' ? undefined : categoryFilter,
      });
      setData(res);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStart = async (assessmentId: string) => {
    setError(null);
    try {
      const s = await employeeApi.startAssessment(assessmentId);
      setSession(s);
      setAnswers({});
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleViewResults = async (attemptId: string) => {
    setError(null);
    try {
      const res = await employeeApi.getAssessmentResult(attemptId);
      setResultModal(res);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleSubmitAttempt = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      const payload = {
        attemptId: session.attemptId,
        answers: session.questions.map((q) => ({
          questionId: q.questionId,
          selectedOptionIndex: answers[q.questionId] ?? 0,
        })),
      };
      const result = await employeeApi.submitAssessment(session.assessmentId, payload);
      setSession(null);
      setResultModal(result);
      await load();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const categories = Array.from(new Set((data?.assessments || []).map((a) => a.category))).filter(Boolean);

  return (
    <EmployeeWorkspaceLayout
      searchPlaceholder="Search assessments..."
      searchValue={search}
      onSearchChange={setSearch}
    >
      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: 'flex-start', md: 'center' } }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            My Assessments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Take assessments, track your performance and identify skill gaps.
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
          <SchoolOutlinedIcon sx={{ color: figmaTokens.navy }} />
          <Box>
            <Typography variant="caption" color={figmaTokens.slate} sx={{ display: "block" }}>
              Your Next Assessment
            </Typography>
            <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
              {data?.nextAssessmentTitle || 'All assigned assessments completed'}
            </Typography>
          </Box>
          {data?.nextAssessmentDueLabel && (
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <CalendarTodayOutlinedIcon fontSize="small" sx={{ color: figmaTokens.slate }} />
              <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 600 }}>
                {data.nextAssessmentDueLabel}
              </Typography>
            </Stack>
          )}
        </Paper>
      </Stack>

      <Grid container spacing={2.25} sx={{ mb: 3 }}>
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={96} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard title="Total Assessments" value={data?.totalCount ?? 0} icon={<AssignmentOutlinedIcon />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard title="Completed" value={data?.completedCount ?? 0} variant="mint" icon={<AssignmentOutlinedIcon />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard title="Pending" value={data?.pendingCount ?? 0} icon={<AssignmentOutlinedIcon />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard title="Upcoming" value={data?.upcomingCount ?? 0} icon={<AssignmentOutlinedIcon />} />
            </Grid>
          </>
        )}
      </Grid>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2.5, justifyContent: "space-between", alignItems: { xs: 'stretch', md: 'center' } }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {[
            { key: 'All' as const, label: `All (${data?.totalCount ?? 0})` },
            { key: 'Completed' as const, label: `Completed (${data?.completedCount ?? 0})` },
            { key: 'Pending' as const, label: `Pending (${data?.pendingCount ?? 0})` },
            { key: 'Upcoming' as const, label: `Upcoming (${data?.upcomingCount ?? 0})` },
          ].map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <Button
                key={tab.key}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter(tab.key)}
                sx={{
                  borderRadius: '99px',
                  backgroundColor: active ? figmaTokens.emerald : figmaTokens.mint,
                  color: active ? '#FFFFFF' : figmaTokens.navy,
                  borderColor: figmaTokens.mintBorder,
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <TextField size="small" placeholder="Search assessments..." value={search} onChange={(e) => setSearch(e.target.value)} slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            } }} />
          <TextField
            select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="All">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Stack spacing={1.75}>
        {(data?.assessments || []).map((item) => {
          const isCompleted = item.status === 'Completed';
          const isPending = item.status === 'Pending' || item.status === 'InProgress';
          return (
            <Paper
              key={item.assessmentId}
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: '14px',
                border: '1px solid',
                borderColor: 'divider',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2.2fr 1fr 1fr 0.9fr 1fr' },
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    backgroundColor: figmaTokens.iceBlue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: figmaTokens.navy,
                    flexShrink: 0,
                  }}
                >
                  <AssignmentOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.subtitle}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CalendarTodayOutlinedIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {item.dateCaption}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.dateLabel}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <AccessTimeOutlinedIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {item.durationOrScoreCaption}
                  </Typography>
                  <Typography variant="body2" className="tabular-nums" sx={{ fontWeight: 600 }}>
                    {item.durationOrScoreLabel}
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.75,
                    py: 0.45,
                    borderRadius: '99px',
                    backgroundColor: isCompleted ? figmaTokens.mint : figmaTokens.iceBlue,
                    color: figmaTokens.navy,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  {item.status}
                </Box>
              </Box>

              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                {isCompleted && item.attemptId ? (
                  <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => handleViewResults(item.attemptId!)}>
                    View Results
                  </Button>
                ) : isPending ? (
                  <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => handleStart(item.assessmentId)}>
                    Start Assessment
                  </Button>
                ) : (
                  <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => handleStart(item.assessmentId)}>
                    View Details
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>

      {/* Live Assessment Runner Modal */}
      <Dialog open={Boolean(session)} onClose={() => setSession(null)} fullWidth maxWidth="md">
        <DialogTitle>
          {session?.title} ({session?.durationMinutes} mins)
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {session?.questions.map((q, idx) => (
              <Box key={q.questionId}>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                  Question {idx + 1} · {q.skillName}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  {q.prompt}
                </Typography>
                <RadioGroup
                  value={answers[q.questionId] ?? ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.questionId]: Number(e.target.value) }))}
                >
                  {q.options.map((opt, optIdx) => (
                    <FormControlLabel
                      key={optIdx}
                      value={optIdx}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSession(null)}>Cancel</Button>
          <Button variant="contained" disabled={submitting} onClick={handleSubmitAttempt}>
            {submitting ? 'Grading...' : 'Submit Assessment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assessment Results Modal */}
      <Dialog open={Boolean(resultModal)} onClose={() => setResultModal(null)} fullWidth maxWidth="sm">
        <DialogTitle>Assessment Results — {resultModal?.title}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h4" className="tabular-nums" sx={{ mb: 1, color: figmaTokens.emerald }}>
            {resultModal?.scorePercent}% ({resultModal?.passed ? 'Passed' : 'Needs Review'})
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {resultModal?.skillBreakdown.map((item) => (
              <Paper key={item.skillName} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 700 }}>{item.skillName}</Typography>
                  <Typography className="tabular-nums">
                    {item.correctCount}/{item.totalQuestions} correct · Level {item.updatedLevel}/5 (Target {item.requiredLevel}/5)
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setResultModal(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </EmployeeWorkspaceLayout>
  );
}
