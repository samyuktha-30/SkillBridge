import React from 'react';
import { Box, Button, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { figmaTokens } from '../../theme/skillBridgeTheme';

const bottomHighlights = [
  {
    icon: <TrackChangesOutlinedIcon sx={{ color: figmaTokens.navy }} />,
    bg: figmaTokens.iceBlue,
    title: 'Identify Skill Gaps',
    desc: 'Analyze performance against job role requirements',
  },
  {
    icon: <AutoAwesomeOutlinedIcon sx={{ color: '#6D28D9' }} />,
    bg: figmaTokens.lavender,
    title: 'Get AI-Powered Plans',
    desc: 'Receive personalized learning paths',
  },
  {
    icon: <TrendingUpOutlinedIcon sx={{ color: figmaTokens.emerald }} />,
    bg: figmaTokens.mint,
    title: 'Track Progress',
    desc: 'Monitor improvement with real-time insights',
  },
  {
    icon: <GroupsOutlinedIcon sx={{ color: figmaTokens.emerald }} />,
    bg: figmaTokens.mint,
    title: 'Build Job-Ready Talent',
    desc: 'Empower employees and strengthen your workforce',
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PublicLayout>
      {/* Hero section — exact Figma proportion */}
      <Box id="home" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 5, md: 7 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  borderRadius: '99px',
                  backgroundColor: figmaTokens.lavender,
                  mb: 3,
                }}
              >
                <AutoAwesomeOutlinedIcon sx={{ fontSize: 16, color: '#6D28D9' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: figmaTokens.navy, fontSize: '0.82rem' }}>
                  Smarter Skills. A Stronger Workforce.
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.25rem', sm: '2.85rem', md: '3.25rem' },
                  lineHeight: 1.12,
                  color: 'text.primary',
                  mb: 2,
                }}
              >
                SkillBridge AI
                <br />
                Smart Skill-Gap &amp;
                <br />
                Training Planner
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.25 }}>
                Assess. Identify. Train. Empower.
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 460, mb: 3.5, lineHeight: 1.65 }}>
                Bridge the gap between your current skills and company expectations with AI-powered personalized learning plans.
              </Typography>

              <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/signup')}
                  sx={{ px: 3, py: 1.25 }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => scrollTo('about')}
                  sx={{
                    px: 3,
                    py: 1.25,
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    color: 'text.primary',
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <BrandIllustration variant="hero-learner" width={460} />
            </Grid>
          </Grid>

          {/* 4-column bottom feature strip */}
          <Grid
            container
            spacing={3}
            sx={{
              mt: { xs: 5, md: 8 },
              pt: 4,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {bottomHighlights.map((item) => (
              <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '10px',
                      backgroundColor: item.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" color="text.primary" sx={{ mb: 0.4, fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About / Features / How It Works / Benefits sections */}
      <Box id="about" sx={{ py: 7, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" sx={{ color: figmaTokens.emerald, fontWeight: 700, letterSpacing: '0.08em' }}>
                ABOUT SKILLBRIDGE AI
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, mb: 2, fontSize: { xs: '1.75rem', md: '2.1rem' } }}>
                Data-driven workforce readiness without guesswork
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                SkillBridge AI combines standardized role competency frameworks, explainable skill-gap computation, and Gemini-powered learning roadmaps so employees know exactly what to learn next and managers can track team readiness in real time.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={2} id="features">
                {[
                  { title: 'Role-Based Assessments', desc: 'Evaluate technical and soft skills against target role levels (1–5 scale).' },
                  { title: 'AI Learning Roadmaps', desc: 'Gemini generates sequenced, gap-focused modules tailored to your assessment.' },
                  { title: '5-Mode AI Assistant', desc: 'Ask questions, debug code, review mistakes, and practice exercises.' },
                  { title: 'Manager Analytics & Reports', desc: 'Monitor cohorts, candidates, training compliance, and export PDF/CSV reports.' },
                ].map((feat) => (
                  <Grid key={feat.title} size={{ xs: 12, sm: 6 }}>
                    <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '12px', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ mb: 0.75, fontWeight: 700 }}>
                        {feat.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feat.desc}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="how-it-works" sx={{ py: 7 }}>
        <Container maxWidth="xl">
          <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontSize: { xs: '1.75rem', md: '2.1rem' } }}>
            How It Works
          </Typography>
          <Grid container spacing={3}>
            {[
              { step: '01', title: 'Complete Skill Assessment', text: 'Employees benchmark current proficiency across target job competencies.' },
              { step: '02', title: 'Explainable Gap Calculation', text: 'Our .NET gap engine compares each skill against role benchmarks and highlights priorities.' },
              { step: '03', title: 'Train & Track Progress', text: 'Follow personalized Gemini learning plans while managers monitor readiness and cohorts.' },
            ].map((item) => (
              <Grid key={item.step} size={{ xs: 12, md: 4 }}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px', height: '100%' }}>
                  <Typography variant="h5" sx={{ color: figmaTokens.emerald, fontWeight: 800, mb: 1 }}>
                    {item.step}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {item.text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box id="benefits" sx={{ py: 6, borderTop: '1px solid', borderColor: 'divider', backgroundColor: figmaTokens.mint }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ justifyContent: "space-between", alignItems: { xs: 'flex-start', md: 'center' } }}>
            <Box>
              <Typography variant="h4" sx={{ color: figmaTokens.navy, mb: 0.75 }}>
                Ready to bridge your organization’s skill gaps?
              </Typography>
              <Typography variant="body1" sx={{ color: figmaTokens.slate }}>
                Sign up as an Employee or join with a Manager invitation to launch your workspace.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary" onClick={() => navigate('/signup')}>
                Create Employee Account
              </Button>
              <Button variant="outlined" onClick={() => navigate('/login?role=manager')} sx={{ bgcolor: '#FFFFFF' }}>
                Manager Login
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </PublicLayout>
  );
}
