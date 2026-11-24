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
  Switch,
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
import type { ManagerReportsDto } from '../../types/manager.types';
import type { DepartmentOption } from '../../types/common.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function ManagerReportsPage() {
  const [data, setData] = useState<ManagerReportsDto | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [reportType, setReportType] = useState('Skill gap summary');
  const [departmentId, setDepartmentId] = useState('All');
  const [dateRangeLabel, setDateRangeLabel] = useState('1–30 Nov 2026');
  const [format, setFormat] = useState<'PDF' | 'CSV'>('CSV');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [cronExpr, setCronExpr] = useState('0 9 1 * *');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [scheduleActive, setScheduleActive] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [res, deps] = await Promise.all([managerApi.getReports(), authApi.getDepartments()]);
      setData(res);
      setDepartments(deps);
      if (res.schedule) {
        setCronExpr(res.schedule.frequencyCron);
        setRecipientEmail(res.schedule.recipientEmail);
        setScheduleActive(res.schedule.isActive);
      }
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async (overrideType?: string) => {
    setGenerating(true);
    setError(null);
    try {
      await managerApi.generateReport({
        reportType: overrideType || reportType,
        departmentId: departmentId === 'All' ? undefined : departmentId,
        dateRangeLabel,
        format,
      });
      setSuccess('Report generated and archived in SQL Server.');
      await load();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id: string, title: string, fmt: 'PDF' | 'CSV') => {
    try {
      const blob = await managerApi.downloadReport(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.${fmt.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  const handleSaveSchedule = async () => {
    try {
      await managerApi.saveReportSchedule({
        reportType,
        frequencyCron: cronExpr,
        recipientEmail,
        isActive: scheduleActive,
      });
      setScheduleOpen(false);
      setSuccess('Hangfire scheduled reporting job updated.');
      await load();
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
            Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate and download reports on your team&apos;s skills and learning progress.
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <BrandIllustration variant="mini-analytics" width={92} />
        </Box>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          Generate a report
        </Typography>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 3.5 }}>
            <TextField select fullWidth size="small" label="Report type" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <MenuItem value="Skill gap summary">Skill gap summary</MenuItem>
              <MenuItem value="Assessment summary">Assessment summary</MenuItem>
              <MenuItem value="Training progress">Training progress</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField select fullWidth size="small" label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <MenuItem value="All">All departments</MenuItem>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 8, md: 2.5 }}>
            <TextField fullWidth size="small" label="Date range" value={dateRangeLabel} onChange={(e) => setDateRangeLabel(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 4, md: 1.2 }}>
            <TextField select fullWidth size="small" label="Format" value={format} onChange={(e) => setFormat(e.target.value as 'PDF' | 'CSV')}>
              <MenuItem value="CSV">CSV</MenuItem>
              <MenuItem value="PDF">PDF</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 1.8 }}>
            <Button
              fullWidth
              variant="contained"
              disabled={generating}
              onClick={() => handleGenerate()}
              sx={{ bgcolor: figmaTokens.mint, color: figmaTokens.navy, '&:hover': { bgcolor: figmaTokens.mintBorder } }}
            >
              {generating ? 'Working...' : 'Generate report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2.25} sx={{ mb: 3 }}>
        {[
          {
            title: 'Assessment summary',
            desc: 'Assessment coverage, scores, and employee results.',
            meta: `${data?.totalEmployeesCount ?? 0} employees · ${data?.assessedEmployeesCount ?? 0} assessed`,
          },
          {
            title: 'Skill gap summary',
            desc: 'Role readiness, skill shortfalls, and priority areas.',
            meta: `${data?.employeesWithGapsCount ?? 0} employees with gaps`,
          },
          {
            title: 'Training progress',
            desc: 'Assigned plans, completion status, and due dates.',
            meta: `${data?.assignedPlansCount ?? 0} assigned plans · ${data?.completedPlansCount ?? 0} completed`,
          },
        ].map((tpl) => (
          <Grid key={tpl.title} size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{tpl.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{tpl.desc}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>{tpl.meta}</Typography>
              <Button variant="outlined" size="small" onClick={() => { setReportType(tpl.title); handleGenerate(tpl.title); }}>
                Use template
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent reports</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Reports generated for your management scope
      </Typography>
      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', overflowX: 'auto', mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: figmaTokens.mint }}>
              <TableCell>Report name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Generated on</TableCell>
              <TableCell>Created by</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.recentReports || []).map((r) => (
              <TableRow key={r.id}>
                <TableCell sx={{ fontWeight: 600 }}>{r.title}</TableCell>
                <TableCell>{r.departmentName}</TableCell>
                <TableCell>{r.generatedOnLabel}</TableCell>
                <TableCell>{r.createdByName}</TableCell>
                <TableCell>{r.format}</TableCell>
                <TableCell>
                  <Button size="small" sx={{ p: 0, minWidth: 'auto' }} onClick={() => handleDownload(r.id, r.title, r.format)}>
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Scheduled reporting</Typography>
            <Typography variant="body2" color="text.secondary">
              {data?.schedule?.isActive
                ? `${data.schedule.reportType} · Cron: ${data.schedule.frequencyCron} · Delivered to ${data.schedule.recipientEmail}`
                : 'Configure automated Hangfire recurring team report delivery.'}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => setScheduleOpen(true)}>
            Manage schedule
          </Button>
        </Stack>
      </Paper>

      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Manage Hangfire Report Schedule</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Cron Schedule" value={cronExpr} onChange={(e) => setCronExpr(e.target.value)} helperText="e.g. 0 9 1 * * (1st of month at 09:00 UTC)" fullWidth />
            <TextField label="Recipient Email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} fullWidth />
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Schedule Active</Typography>
              <Switch checked={scheduleActive} onChange={(e) => setScheduleActive(e.target.checked)} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSchedule}>Save Schedule</Button>
        </DialogActions>
      </Dialog>
    </ManagerWorkspaceLayout>
  );
}
