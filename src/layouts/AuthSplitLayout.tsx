import React from 'react';
import { AppBar, Box, Container, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandIllustration';

export function AuthSplitLayout({
  topRightAction,
  leftContent,
  rightContent,
}: {
  topRightAction?: React.ReactNode;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 68, justifyContent: 'space-between' }}>
            <BrandLogo onClick={() => navigate('/')} />
            <Box>{topRightAction}</Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 4, md: 8 },
          alignItems: 'center',
          py: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ maxWidth: 520, mx: { xs: 'auto', md: 0 }, width: '100%' }}>{leftContent}</Box>
        <Box sx={{ maxWidth: 490, mx: 'auto', width: '100%' }}>{rightContent}</Box>
      </Container>
    </Box>
  );
}
