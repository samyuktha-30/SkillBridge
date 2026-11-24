import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import { useNavigate } from 'react-router-dom';
import { AuthSplitLayout } from '../../layouts/AuthSplitLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { authApi } from '../../api/authApi';
import { extractApiErrorMessage } from '../../api/axiosClient';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setSuccessMsg(res.message);
      if (res.resetTokenPreview) {
        setToken(res.resetTokenPreview);
      }
      setStep('reset');
    } catch (err) {
      setErrorMsg(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!token.trim() || newPassword.length < 8) {
      setErrorMsg('Provide the reset token and a new password of at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authApi.resetPassword({
        email: email.trim(),
        token: token.trim(),
        newPassword,
      });
      setSuccessMsg(res.message);
    } catch (err) {
      setErrorMsg(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      topRightAction={
        <Button
          variant="text"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate('/login')}
          sx={{ color: 'text.primary', fontWeight: 600 }}
        >
          Back to Login
        </Button>
      }
      leftContent={
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2, color: 'text.primary' }}>
            Forgot Your
            <br />
            Password?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 360, lineHeight: 1.65 }}>
            No worries! We&apos;ll help you reset it and get back on track.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <BrandIllustration variant="reset-shield" width={260} />
          </Box>
        </Box>
      }
      rightContent={
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            textAlign: 'center',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <BrandIllustration variant="security-shield" width={68} />
          </Box>

          <Typography variant="h4" sx={{ mb: 1 }}>
            Reset Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {step === 'request'
              ? "Enter your registered email address and we'll send you a password reset link."
              : 'Enter the reset token issued for your account and choose a new password.'}
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
              {errorMsg}
            </Alert>
          )}
          {successMsg && (
            <Alert severity="success" sx={{ mb: 2, textAlign: 'left' }}>
              {successMsg}
            </Alert>
          )}

          {step === 'request' ? (
            <Box component="form" onSubmit={handleRequestLink}>
              <Stack spacing={2}>
                <TextField fullWidth type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} slotProps={{ input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  } }} />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={submitting}
                  startIcon={<SendOutlinedIcon />}
                  sx={{ py: 1.35 }}
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Divider>
                  <Typography variant="caption" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                <Button
                  type="button"
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ borderColor: 'divider', color: 'text.primary', fontWeight: 700 }}
                >
                  <Box component="span" sx={{ mr: 1.25, fontWeight: 800 }}>
                    G
                  </Box>
                  Continue with Google
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleResetPassword}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Reset Token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={submitting}
                  startIcon={<LockResetOutlinedIcon />}
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </Button>
              </Stack>
            </Box>
          )}

          <Button
            variant="text"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => navigate('/login')}
            sx={{ mt: 2.5, color: 'text.primary' }}
          >
            Back to Login
          </Button>
        </Paper>
      }
    />
  );
}
