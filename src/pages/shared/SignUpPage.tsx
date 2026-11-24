import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Radio,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthSplitLayout } from '../../layouts/AuthSplitLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { authApi } from '../../api/authApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import { useAuth } from '../../auth/AuthContext';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function SignUpPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'manager' ? 'Manager' : 'Employee';
  const [selectedRole, setSelectedRole] = useState<'Employee' | 'Manager'>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [invitationCode, setInvitationCode] = useState(searchParams.get('invite') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const navigate = useNavigate();
  const { loginWithResponse } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPendingNotice(null);

    if (!fullName.trim() || !email.trim() || password.length < 8) {
      setErrorMsg('Please enter your full name, a valid email, and a password of at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedRole === 'Employee') {
  const result = await authApi.registerEmployee({
    fullName: fullName.trim(),
    email: email.trim(),
    password,
    companyName: companyName.trim() || undefined,
  });

  setPendingNotice(result.message);
}else {
        const result = await authApi.registerManager({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          companyName: companyName.trim() || undefined,
          invitationCode: invitationCode.trim() || undefined,
        });
        if (result.requiresAdminApproval || !result.auth) {
          setPendingNotice(result.message);
        } else {
          loginWithResponse(result.auth, true);
          navigate('/manager/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      topRightAction={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?
          </Typography>
          <Button
            variant="text"
            endIcon={<ArrowForwardIcon fontSize="small" />}
            onClick={() => navigate('/login')}
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            Sign In
          </Button>
        </Stack>
      }
      leftContent={
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2, color: 'text.primary' }}>
            Build Your Skills.
            <br />
            Grow Your Career.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.65 }}>
            Join SkillBridge AI and take the next step towards a more skilled and future-ready you.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 4 }}>
            <BrandIllustration variant="auth-laptop" width={310} />
          </Box>

          <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <TrackChangesOutlinedIcon sx={{ color: figmaTokens.navy, mb: 0.75 }} />
              <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>
                Identify
                <br />
                Skill Gaps
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <MenuBookOutlinedIcon sx={{ color: figmaTokens.navy, mb: 0.75 }} />
              <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>
                Get Personalized
                <br />
                Learning Plans
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <EmojiEventsOutlinedIcon sx={{ color: figmaTokens.navy, mb: 0.75 }} />
              <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>
                Track Your
                <br />
                Progress
              </Typography>
            </Box>
          </Stack>
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
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              Create Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Choose your role to get started
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
              {[
                {
                  key: 'Employee' as const,
                  title: 'Employee',
                  subtitle: '(Student / Candidate)',
                  icon: <SchoolOutlinedIcon fontSize="small" />,
                },
                {
                  key: 'Manager' as const,
                  title: 'Manager / HR',
                  subtitle: '(Company Admin)',
                  icon: <GroupsOutlinedIcon fontSize="small" />,
                },
              ].map((role) => {
                const active = selectedRole === role.key;
                return (
                  <Paper
                    key={role.key}
                    elevation={0}
                    onClick={() => {
                      setSelectedRole(role.key);
                      setErrorMsg(null);
                      setPendingNotice(null);
                    }}
                    sx={{
                      flex: 1,
                      p: 1.25,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: active ? figmaTokens.navy : 'divider',
                      backgroundColor: active ? figmaTokens.iceBlue : 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Box sx={{ color: figmaTokens.navy, display: 'flex' }}>{role.icon}</Box>
                      <Box>
                        <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
                          {role.title}
                        </Typography>
                        <Typography variant="caption" color={figmaTokens.slate} sx={{ display: 'block', lineHeight: 1.15 }}>
                          {role.subtitle}
                        </Typography>
                      </Box>
                    </Stack>
                    <Radio checked={active} size="small" sx={{ p: 0 }} />
                  </Paper>
                );
              })}
            </Stack>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}
            {pendingNotice && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {pendingNotice}
              </Alert>
            )}

            <Stack spacing={1.75}>
              <TextField fullWidth placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} slotProps={{ input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                } }} />

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
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <VisibilityOutlinedIcon fontSize="small" /> : <VisibilityOffOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                } }} />

              <TextField fullWidth placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} slotProps={{ input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <ApartmentOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="text.secondary">
                        (Optional)
                      </Typography>
                    </InputAdornment>
                  ),
                } }} />

              {selectedRole === 'Manager' && (
                <TextField fullWidth placeholder="Manager Invitation Code (Optional)" helperText="Enter an administrator invite code for instant access, or submit for Admin approval." value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} slotProps={{ input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  } }} />
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={submitting}
                endIcon={<ArrowForwardIcon />}
                sx={{ py: 1.35, mt: 0.5 }}
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Divider>
                <Typography variant="caption" color="text.secondary">
                  or
                </Typography>
              </Divider>

              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={() =>
                  setErrorMsg(
                    'Google OAuth signup requires configuring Google Client ID credentials in your local ASP.NET Core Identity provider.'
                  )
                }
                sx={{
                  py: 1.2,
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

              <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5, textAlign: "center" }}>
                By creating an account, you agree to our{' '}
                <MuiLink href="#terms" underline="always" color="text.primary">
                  Terms of Service
                </MuiLink>{' '}
                and{' '}
                <MuiLink href="#privacy" underline="always" color="text.primary">
                  Privacy Policy
                </MuiLink>
                .
              </Typography>
            </Stack>
          </Box>
        </Paper>
      }
    />
  );
}
