import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LoginIcon from '@mui/icons-material/Login';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthSplitLayout } from '../../layouts/AuthSplitLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { authApi } from '../../api/authApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import { useAuth } from '../../auth/AuthContext';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'manager' ? 'Manager' : 'Employee';
  const [selectedRole, setSelectedRole] = useState<'Employee' | 'Manager'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showPendingApproval, setShowPendingApproval] = useState(false);

  const navigate = useNavigate();
  const { loginWithResponse } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      const auth = await authApi.login({
        email: email.trim(),
        password,
        expectedRole: selectedRole,
        rememberMe,
      });
      if (!auth?.user?.role) {
        throw new Error(
          'Authentication server returned an invalid response. Make sure the .NET 10 API is running on port 5000 (or configure VITE_API_BASE_URL).'
        );
      }
      loginWithResponse(auth, rememberMe);
      if (auth.user.role === 'Employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/manager/dashboard');
      }
    } catch (err) {
  const message = extractApiErrorMessage(err);

  if (
    selectedRole === 'Employee' &&
    message.toLowerCase().includes('awaiting manager approval')
  ) {
    setShowPendingApproval(true);
  } else {
    setErrorMsg(message);
  }
} finally {
      setSubmitting(false);
    }
  };

  const handleGoogleInfo = () => {
    setInfoMsg(
      'Google OAuth sign-in requires configuring Google Client ID credentials in your local ASP.NET Core Identity provider.'
    );
  };
   
  if (showPendingApproval) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper sx={{ maxWidth: 460, width: '100%', p: 4, textAlign: 'center' }}>
        <SchoolOutlinedIcon
          sx={{ fontSize: 56, color: figmaTokens.navy, mb: 2 }}
        />

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Approval Pending
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Your account is awaiting manager approval. You can access your
          dashboard once your account is approved.
        </Typography>

        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            setShowPendingApproval(false);
            setPassword('');
            setErrorMsg(null);
          }}
        >
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
}

  return (
    <AuthSplitLayout
      leftContent={
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 1.5, color: 'text.primary' }}>
            Welcome Back!
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
            Continue your learning journey
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.65 }}>
            Assess. Learn. Improve.
            <br />
            Bridge the skill gap and build a stronger career.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 4 }}>
            <BrandIllustration variant="auth-laptop" width={310} />
          </Box>

          <Stack
            direction="row"
            spacing={3}
            divider={<Divider orientation="vertical" flexItem />}
            sx={{ pt: 1 }}
          >
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <TrackChangesOutlinedIcon sx={{ color: figmaTokens.navy, mb: 0.75 }} />
              <Typography variant="caption" color="text.primary" sx={{ display: "block", fontWeight: 600 }}>
                Identify
                <br />
                Skill Gaps
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <MenuBookOutlinedIcon sx={{ color: figmaTokens.navy, mb: 0.75 }} />
              <Typography variant="caption" color="text.primary" sx={{ display: "block", fontWeight: 600 }}>
                Get Personalized
                <br />
                Learning Plans
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <RocketLaunchOutlinedIcon sx={{ color: figmaTokens.navy, mb: 0.75 }} />
              <Typography variant="caption" color="text.primary" sx={{ display: "block", fontWeight: 600 }}>
                Accelerate
                <br />
                Your Growth
              </Typography>
            </Box>
          </Stack>
        </Box>
      }
      rightContent={
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h4" sx={{ mb: 0.75, textAlign: "center" }}>
            Login to SkillBridge AI
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
            Access your personalized dashboard
          </Typography>

          {/* Role selector cards matching Employee & Manager Figma screens */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
            {[
              {
                key: 'Employee' as const,
                title: 'Employee',
                subtitle: '(Student / Candidate)',
                icon: <SchoolOutlinedIcon />,
              },
              {
                key: 'Manager' as const,
                title: 'Manager / HR',
                subtitle: '(Company Admin)',
                icon: <GroupsOutlinedIcon />,
              },
            ].map((role) => {
              const active = selectedRole === role.key;
              return (
                <Paper
                  key={role.key}
                  elevation={0}
                  onClick={() => setSelectedRole(role.key)}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: active ? figmaTokens.navy : 'divider',
                    backgroundColor: active ? figmaTokens.iceBlue : 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box sx={{ color: figmaTokens.navy, display: 'flex' }}>{role.icon}</Box>
                  <Box>
                    <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
                      {role.title}
                    </Typography>
                    <Typography variant="caption" color={figmaTokens.slate} sx={{ display: 'block', lineHeight: 1.2 }}>
                      {role.subtitle}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Stack>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}
          {infoMsg && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {infoMsg}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField fullWidth type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} slotProps={{ input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              } }} />

            <TextField fullWidth type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} slotProps={{ input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" aria-label="Toggle password visibility">
                      {showPassword ? <VisibilityOutlinedIcon fontSize="small" /> : <VisibilityOffOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              } }} />

            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <FormControlLabel
                control={<Checkbox size="small" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Button
                type="button"
                variant="text"
                size="small"
                onClick={() => navigate('/forgot-password')}
                sx={{ p: 0, minWidth: 'auto', textDecoration: 'underline', color: 'text.primary', fontWeight: 500 }}
              >
                Forgot Password?
              </Button>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={submitting}
              startIcon={<LoginIcon />}
              sx={{ py: 1.35 }}
            >
              {submitting ? 'Signing in...' : 'Login'}
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
              onClick={handleGoogleInfo}
              sx={{
                py: 1.25,
                backgroundColor: 'background.paper',
                borderColor: 'divider',
                color: 'text.primary',
                fontWeight: 700,
              }}
            >
              <Box component="span" sx={{ mr: 1.25, fontWeight: 800 }}>
                G
              </Box>
              Continue with Google
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ pt: 1, textAlign: "center" }}>
              Don&apos;t have an account?{' '}
              <Button
                type="button"
                variant="text"
                size="small"
                onClick={() => navigate(selectedRole === 'Manager' ? '/signup?role=manager' : '/signup')}
                sx={{ p: 0, minWidth: 'auto', fontWeight: 700, color: 'text.primary' }}
              >
                Sign Up
              </Button>
            </Typography>
          </Stack>
        </Box>
      }
    />
  );
}
