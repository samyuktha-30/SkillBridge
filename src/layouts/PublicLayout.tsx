import React from 'react';
import { AppBar, Box, Button, Container, Stack, Toolbar } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandIllustration';
import { figmaTokens } from '../theme/skillBridgeTheme';

const navLinks = [
  { label: 'Home', target: '#home' },
  { label: 'About', target: '#about' },
  { label: 'Features', target: '#features' },
  { label: 'How It Works', target: '#how-it-works' },
  { label: 'Benefits', target: '#benefits' },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const scrollToSection = (hash: string) => {
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 72, justifyContent: 'space-between', gap: 3 }}>
            <BrandLogo onClick={() => navigate('/')} />

            <Stack
              direction="row"
              spacing={3.5}
              sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}
            >
              {navLinks.map((item, idx) => (
                <Button
                  key={item.label}
                  onClick={() => scrollToSection(item.target)}
                  sx={{
                    color: idx === 0 ? figmaTokens.navy : 'text.secondary',
                    fontWeight: idx === 0 ? 700 : 500,
                    fontSize: '0.92rem',
                    borderRadius: 0,
                    px: 0.5,
                    borderBottom: idx === 0 ? `2px solid ${figmaTokens.navy}` : '2px solid transparent',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: figmaTokens.navy,
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/login')}
              sx={{ px: 2.5, py: 1 }}
            >
              Login
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
