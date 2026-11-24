
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { ManagerWorkspaceLayout } from '../../layouts/ManagerWorkspaceLayout';
import { KpiCard } from '../../components/common/KpiCard';
import { managerApi } from '../../api/managerApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type {
  EmployeeAccessDto,
  EmployeeAccessListDto,
} from '../../types/manager.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

type ApprovalAction = {
  employee: EmployeeAccessDto;
  approve: boolean;
};

export function EmployeeAccessManagementPage() {
  const [data, setData] = useState<EmployeeAccessListDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] =
    useState<ApprovalAction | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEmployees = useCallback(async () => {
    setError(null);

    try {
      const response = await managerApi.getEmployeeApprovals();
      setData(response);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleApprovalAction = async () => {
    if (!selectedAction) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await managerApi.updateEmployeeApproval(
        selectedAction.employee.employeeId,
        selectedAction.approve
      );

      setSuccess(response.message);
      setSelectedAction(null);
      await loadEmployees();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Active':
        return <Chip label="Approved" color="success" size="small" />;

      case 'PendingApproval':
        return <Chip label="Pending" color="warning" size="small" />;

      case 'Rejected':
        return <Chip label="Rejected / Revoked" color="error" size="small" />;

      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getActionButton = (employee: EmployeeAccessDto) => {
    if (employee.approvalStatus === 'PendingApproval') {
      return (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() =>
              setSelectedAction({ employee, approve: true })
            }
          >
            Accept
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() =>
              setSelectedAction({ employee, approve: false })
            }
          >
            Reject
          </Button>
        </Stack>
      );
    }

    if (employee.approvalStatus === 'Active') {
      return (
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() =>
            setSelectedAction({ employee, approve: false })
          }
        >
          Revoke Access
        </Button>
      );
    }

    if (employee.approvalStatus === 'Rejected') {
      return (
        <Button
          size="small"
          variant="outlined"
          color="success"
          onClick={() =>
            setSelectedAction({ employee, approve: true })
          }
        >
          Restore Access
        </Button>
      );
    }

    return null;
  };

  return (
    <ManagerWorkspaceLayout breadcrumb="Manager workspace">
      <Stack
  direction={{ xs: 'column', sm: 'row' }}
  spacing={2}
  sx={{
    mb: 3,
    justifyContent: 'space-between',
    alignItems: { xs: 'flex-start', sm: 'center' },
  }}
>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.1rem' },
              mb: 0.5,
            }}
          >
            Employee Access Management
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Review employee registrations and manage account access.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={loadEmployees}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <KpiCard
          title="Total Employees"
          value={data?.totalEmployees ?? 0}
          subtitle="Registered employee accounts"
        />

        <KpiCard
          title="Pending Approvals"
          value={data?.pendingCount ?? 0}
          subtitle="Awaiting manager review"
        />

        <KpiCard
          title="Approved Employees"
          value={data?.activeCount ?? 0}
          subtitle="Accounts with active access"
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          overflowX: 'auto',
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
  Employee Accounts
</Typography>

          <Typography variant="body2" color="text.secondary">
            Approve new registrations, reject requests, or revoke existing access.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: figmaTokens.iceBlue }}>
                <TableCell>Employee</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(data?.employees ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No employee accounts found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data!.employees.map((employee) => (
                  <TableRow key={employee.employeeId} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {employee.fullName}
                    </TableCell>

                    <TableCell>{employee.email}</TableCell>

                    <TableCell>{employee.departmentName}</TableCell>

                    <TableCell>
                      {getStatusChip(employee.approvalStatus)}
                    </TableCell>

                    <TableCell>
                      {getActionButton(employee)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog
        open={Boolean(selectedAction)}
        onClose={() => !saving && setSelectedAction(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {selectedAction?.approve
            ? 'Approve Employee Account?'
            : selectedAction?.employee.approvalStatus === 'Active'
              ? 'Revoke Employee Access?'
              : 'Reject Employee Registration?'}
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {selectedAction?.approve
              ? `Are you sure you want to approve ${selectedAction.employee.fullName}'s account? They will be allowed to access the employee workspace.`
              : `Are you sure you want to remove access for ${selectedAction?.employee.fullName}? They will not be able to access the employee workspace.`}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setSelectedAction(null)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color={selectedAction?.approve ? 'success' : 'error'}
            onClick={handleApprovalAction}
            disabled={saving}
          >
            {saving
              ? 'Processing...'
              : selectedAction?.approve
                ? 'Confirm Approval'
                : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </ManagerWorkspaceLayout>
  );
}
