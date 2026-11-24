import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { employeeApi } from '../api/employeeApi';
import { BrandLogo } from '../components/common/BrandIllustration';
import { figmaTokens } from '../theme/skillBridgeTheme';

const DRAWER_WIDTH = 244;

const managerNavItems = [
  { label: 'Manager Dashboard', path: '/manager/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: 'Candidate Management', path: '/manager/candidates', icon: <PeopleOutlinedIcon fontSize="small" /> },
    {
    label: 'Employee Access Management',
    path: '/manager/employee-approvals',
    icon: <HowToRegOutlinedIcon fontSize="small" />,
  },
  { label: 'Learning Plan Management', path: '/manager/learning-plans', icon: <MenuBookOutlinedIcon fontSize="small" /> },
  { label: 'Training & Progress Monitoring', path: '/manager/training-monitoring', icon: <InsightsOutlinedIcon fontSize="small" /> },
  { label: 'Skill Gap Analytics', path: '/manager/skill-gap-analytics', icon: <AssessmentOutlinedIcon fontSize="small" /> },
  { label: 'Profile', path: '/manager/profile', icon: <PersonOutlineOutlinedIcon fontSize="small" /> },
  { label: 'Reports', path: '/manager/reports', icon: <SummarizeOutlinedIcon fontSize="small" /> },
];

export function ManagerWorkspaceLayout({
  children,
  breadcrumb = 'Manager workspace',
}: {
  children: React.ReactNode;
  breadcrumb?: string;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    employeeApi
      .getNotifications({ page: 1, pageSize: 10 })
      .then((res) => {
        if (active) setUnreadCount(res.items.filter((n) => !n.isRead).length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login?role=manager');
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'background.paper',
        p: 2,
      }}
    >
      <Box>
        <Box sx={{ px: 1, py: 1.25, mb: 1.5 }}>
          <BrandLogo onClick={() => navigate('/manager/dashboard')} />
        </Box>

        <Typography
          variant="caption"
          sx={{ px: 1.5, mb: 1, display: 'block', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em' }}
        >
          MANAGER WORKSPACE
        </Typography>

        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          {managerNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '10px',
                  py: 0.9,
                  px: 1.5,
                  backgroundColor: active ? figmaTokens.mint : 'transparent',
                  color: active ? 'text.primary' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: active ? figmaTokens.mint : 'rgba(15, 39, 68, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: active ? figmaTokens.emerald : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontSize: '0.88rem', fontWeight: active ? 600 : 500, lineHeight: 1.3 } } }}
                />
              </ListItemButton>
            );
          })}

          {user?.role === 'Admin' && (
            <ListItemButton
              onClick={() => {
                navigate('/admin/approvals');
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: '10px',
                py: 0.9,
                px: 1.5,
                backgroundColor: location.pathname === '/admin/approvals' ? figmaTokens.lavender : 'transparent',
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: figmaTokens.navy }}>
                <AdminPanelSettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Admin Approvals"
                slotProps={{ primary: { sx: { fontSize: '0.88rem', fontWeight: 600 } } }}
              />
            </ListItemButton>
          )}
        </List>

        <Divider sx={{ my: 2 }} />

        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <ListItemButton
            onClick={() => {
              navigate('/manager/settings');
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: '10px',
              py: 0.9,
              px: 1.5,
              backgroundColor: location.pathname === '/manager/settings' ? figmaTokens.mint : 'transparent',
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" slotProps={{ primary: { sx: { fontSize: '0.88rem', fontWeight: 500 } } }} />
          </ListItemButton>

          <ListItemButton onClick={handleLogout} sx={{ borderRadius: '10px', py: 0.9, px: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" slotProps={{ primary: { sx: { fontSize: '0.88rem', fontWeight: 500 } } }} />
          </ListItemButton>
        </List>
      </Box>

      <Box
        onClick={() => navigate('/manager/profile')}
        sx={{
          p: 1.5,
          borderRadius: '12px',
          backgroundColor: figmaTokens.lavender,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          cursor: 'pointer',
        }}
      >
        <Avatar sx={{ width: 34, height: 34, bgcolor: '#FFFFFF', color: figmaTokens.navy, fontSize: '0.8rem', fontWeight: 700 }}>
          {user?.avatarInitials || 'MG'}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color={figmaTokens.navy} noWrap sx={{ fontWeight: 700 }}>
            {user?.fullName || 'Manager'}
          </Typography>
          <Typography variant="caption" color={figmaTokens.slate} noWrap>
            {user?.jobTitle || user?.role || 'Engineering Manager'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          component="header"
          sx={{
            px: { xs: 2, md: 4 },
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.default',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {breadcrumb}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <IconButton
              onClick={() => navigate('/manager/training-monitoring')}
              sx={{ backgroundColor: figmaTokens.mint, width: 34, height: 34 }}
              aria-label="Team notifications"
            >
              <Badge badgeContent={unreadCount || null} color="primary">
                <NotificationsNoneOutlinedIcon fontSize="small" sx={{ color: figmaTokens.navy }} />
              </Badge>
            </IconButton>

            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.fullName || 'Manager'}
            </Typography>
          </Stack>
        </Box>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3.5 }, maxWidth: 1400, width: '100%', mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
