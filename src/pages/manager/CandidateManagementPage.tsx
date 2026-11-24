import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
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
import { KpiCard } from '../../components/common/KpiCard';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { managerApi } from '../../api/managerApi';
import { authApi } from '../../api/authApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { CandidateDto, CandidatesOverviewDto } from '../../types/manager.types';
import type { DepartmentOption, JobRoleOption } from '../../types/common.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

const stages = ['Screening', 'Assessment', 'Interview', 'Offer', 'Hired'] as const;

export function CandidateManagementPage() {
  const [data, setData] = useState<CandidatesOverviewDto | null>(null);
  const [roles, setRoles] = useState<JobRoleOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [newDeptId, setNewDeptId] = useState('');
  const [newStage, setNewStage] = useState<string>('Screening');
  const [newFollowUp, setNewFollowUp] = useState('');

  const [reviewCandidate, setReviewCandidate] = useState<CandidateDto | null>(null);
  const [editStage, setEditStage] = useState('');
  const [editScore, setEditScore] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const loadLookups = useCallback(async () => {
    try {
      const [r, d] = await Promise.all([authApi.getJobRoles(), authApi.getDepartments()]);
      setRoles(r);
      setDepartments(d);
      if (r.length && !newRoleId) setNewRoleId(r[0].id);
      if (d.length && !newDeptId) setNewDeptId(d[0].id);
    } catch {
      // handled on main load
    }
  }, [newDeptId, newRoleId]);

  const loadCandidates = useCallback(async () => {
    setError(null);
    try {
      const res = await managerApi.getCandidates({
        search: search || undefined,
        jobRoleId: roleFilter === 'All' ? undefined : roleFilter,
        stage: stageFilter === 'All' ? undefined : stageFilter,
      });
      setData(res);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, [search, roleFilter, stageFilter]);

  useEffect(() => {
    loadLookups();
    loadCandidates();
  }, [loadLookups, loadCandidates]);

  const handleAddCandidate = async () => {
    try {
      await managerApi.createCandidate({
        fullName: newName,
        email: newEmail,
        jobRoleId: newRoleId,
        departmentId: newDeptId,
        stage: newStage,
        nextFollowUpDate: newFollowUp || undefined,
      });
      setAddOpen(false);
      setNewName('');
      setNewEmail('');
      await loadCandidates();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleUpdateCandidate = async () => {
    if (!reviewCandidate) return;
    try {
      await managerApi.updateCandidateStage(reviewCandidate.id, {
        stage: editStage,
        skillScorePercent: editScore ? Number(editScore) : undefined,
        notes: editNotes,
      });
      setReviewCandidate(null);
      await loadCandidates();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <ManagerWorkspaceLayout breadcrumb="Manager workspace">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: 'flex-start', sm: 'center' } }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            Candidate Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track applicants, review assessments, and manage hiring stages.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <BrandIllustration variant="mini-analytics" width={92} />
          </Box>
          <Button variant="contained" onClick={() => setAddOpen(true)}>
            Add candidate
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2.25} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Active candidates"
            value={data?.activeCandidatesCount ?? 0}
            subtitle={`Across ${data?.openRolesCount ?? 0} open roles`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Awaiting assessment"
            value={data?.awaitingAssessmentCount ?? 0}
            subtitle="Invitations sent · Results pending"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="In interview"
            value={data?.inInterviewCount ?? 0}
            subtitle="Skills assessments completed"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Offer stage"
            value={data?.offerStageCount ?? 0}
            subtitle="Awaiting candidate response"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2.5, alignItems: 'flex-end' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Search candidates
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Job role
          </Typography>
          <TextField select fullWidth size="small" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <MenuItem value="All">All roles</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.title}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Pipeline stage
          </Typography>
          <TextField select fullWidth size="small" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <MenuItem value="All">All stages</MenuItem>
            {stages.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button fullWidth variant="outlined" onClick={loadCandidates} sx={{ bgcolor: 'background.paper' }}>
            Apply filters
          </Button>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', overflowX: 'auto', mb: 1.5 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: figmaTokens.iceBlue }}>
              <TableCell>Candidate</TableCell>
              <TableCell>Job role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Skill score</TableCell>
              <TableCell>Next follow-up</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.candidates || []).map((c) => (
              <TableRow key={c.id}>
                <TableCell sx={{ fontWeight: 600 }}>{c.fullName}</TableCell>
                <TableCell>{c.jobRoleTitle}</TableCell>
                <TableCell>{c.departmentName}</TableCell>
                <TableCell>{c.stage}</TableCell>
                <TableCell className="tabular-nums">
                  {typeof c.skillScorePercent === 'number' ? `${c.skillScorePercent}%` : c.stage === 'Assessment' ? 'Pending' : '—'}
                </TableCell>
                <TableCell>{c.nextFollowUpDate || '—'}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    sx={{ textDecoration: 'underline', p: 0, minWidth: 'auto' }}
                    onClick={() => {
                      setReviewCandidate(c);
                      setEditStage(c.stage);
                      setEditScore(c.skillScorePercent ? String(c.skillScorePercent) : '');
                      setEditNotes(c.notes || '');
                    }}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          Showing {data?.candidates.length ?? 0} of {data?.activeCandidatesCount ?? 0} active candidates
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Skill scores reflect the latest completed role assessment.
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Next steps</Typography>
            <Typography variant="body2" color="text.secondary">
              {data?.nextStepSummary || 'Follow up on pending candidate assessments before scheduling interviews.'}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Hiring workflow</Typography>
            <Typography variant="body2" color="text.secondary">
              Screening → Assessment → Interview → Offer. Candidates remain separate from employees until an offer is accepted.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add Candidate</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} fullWidth />
            <TextField label="Email Address" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} fullWidth />
            <TextField select label="Job Role" value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)} fullWidth>
              {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.title}</MenuItem>)}
            </TextField>
            <TextField select label="Department" value={newDeptId} onChange={(e) => setNewDeptId(e.target.value)} fullWidth>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
            <TextField select label="Stage" value={newStage} onChange={(e) => setNewStage(e.target.value)} fullWidth>
              {stages.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField type="date" label="Next Follow-up" value={newFollowUp} onChange={(e) => setNewFollowUp(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCandidate}>Add Candidate</Button>
        </DialogActions>
      </Dialog>

      <Drawer anchor="right" open={Boolean(reviewCandidate)} onClose={() => setReviewCandidate(null)}>
        <Box sx={{ width: { xs: 320, sm: 400 }, p: 3 }}>
          <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>
            {reviewCandidate?.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {reviewCandidate?.email} · {reviewCandidate?.jobRoleTitle}
          </Typography>
          <Stack spacing={2.25}>
            <TextField select label="Pipeline Stage" value={editStage} onChange={(e) => setEditStage(e.target.value)} fullWidth>
              {stages.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField label="Skill Score (%)" type="number" value={editScore} onChange={(e) => setEditScore(e.target.value)} fullWidth />
            <TextField label="Interview Notes" multiline rows={4} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} fullWidth />
            <Button variant="contained" onClick={handleUpdateCandidate}>Save Candidate Update</Button>
          </Stack>
        </Box>
      </Drawer>
    </ManagerWorkspaceLayout>
  );
}
