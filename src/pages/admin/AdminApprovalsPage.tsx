import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { ManagerInvitationDto, ManagerRequestDto } from '../../types/auth.types';
import type { DepartmentOption } from '../../types/common.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function AdminApprovalsPage() {
  const [requests, setRequests] = useState<ManagerRequestDto[]>([]);
  const [invitations, setInvitations] = useState<ManagerInvitationDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDeptId, setInviteDeptId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [reqs, invs, deps] = await Promise.all([
        adminApi.getPendingManagerRequests(),
        adminApi.getInvitations(),
        authApi.getDepartments(),
      ]);
      setRequests(reqs);
      setInvitations(invs);
      setDepartments(deps);
      if (deps.length && !inviteDeptId) setInviteDeptId(deps[0].id);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, [inviteDeptId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      const created = await adminApi.createInvitation({
        email: inviteEmail.trim(),
        departmentId: inviteDeptId || undefined,
        expiresInDays: 7,
      });
      setInviteEmail('');
      setSuccess(`Invitation code issued: ${created.invitationCode}`);
      await load();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <ManagerWorkspaceLayout breadcrumb="Admin / Manager Governance">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
          Manager Invitations &amp; Approvals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Issue cryptographic invitation codes or approve pending Manager / HR registrations.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Issue Manager Invitation
        </Typography>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              type="email"
              label="Manager Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Department"
              value={inviteDeptId}
              onChange={(e) => setInviteDeptId(e.target.value)}
            >
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Button fullWidth variant="contained" onClick={handleCreateInvite}>
              Generate Invite Code
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
        Pending Manager Approval Requests
      </Typography>
      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', mb: 3, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: figmaTokens.iceBlue }}>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!requests.length ? (
              <TableRow>
                <TableCell colSpan={5}>No pending manager registration requests.</TableCell>
              </TableRow>
            ) : (
              requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{r.fullName}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.companyName || '—'}</TableCell>
                  <TableCell>{new Date(r.createdAtUtc).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={async () => {
                          await adminApi.approveManagerRequest(r.id);
                          setSuccess(`Approved ${r.fullName}`);
                          await load();
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={async () => {
                          await adminApi.rejectManagerRequest(r.id);
                          setSuccess(`Rejected ${r.fullName}`);
                          await load();
                        }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
        Issued Invitations
      </Typography>
      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: figmaTokens.mint }}>
              <TableCell>Email</TableCell>
              <TableCell>Invite Code</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invitations.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.email}</TableCell>
                <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                  {inv.invitationCode}
                </TableCell>
                <TableCell>{new Date(inv.expiresAtUtc).toLocaleDateString()}</TableCell>
                <TableCell>{inv.isUsed ? 'Accepted' : inv.isRevoked ? 'Revoked' : 'Active'}</TableCell>
                <TableCell align="right">
                  {!inv.isUsed && !inv.isRevoked && (
                    <Button
                      size="small"
                      color="error"
                      onClick={async () => {
                        await adminApi.revokeInvitation(inv.id);
                        await load();
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </ManagerWorkspaceLayout>
  );
}
