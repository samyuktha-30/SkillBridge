import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { employeeApi } from '../api/employeeApi';
import { BrandLogo } from '../components/common/BrandIllustration';
import { figmaTokens } from '../theme/skillBridgeTheme';

const DRAWER_WIDTH = 244;

const navItems = [
  { label: 'Dashboard', path: '/employee/dashboard', icon: <HomeOutlinedIcon fontSize="small" /> },
  { label: 'My Skills', path: '/employee/skills', icon: <BarChartOutlinedIcon fontSize="small" /> },
  { label: 'Assessments', path: '/employee/assessments', icon: <AssignmentOutlinedIcon fontSize="small" /> },
  { label: 'AI Learning Plan', path: '/employee/learning-plan', icon: <AutoAwesomeOutlinedIcon fontSize="small" /> },
  { label: 'Resources', path: '/employee/resources', icon: <MenuBookOutlinedIcon fontSize="small" /> },
  { label: 'My Progress', path: '/employee/progress', icon: <TrendingUpOutlinedIcon fontSize="small" /> },
  { label: 'AI Assistant', path: '/employee/ai-assistant', icon: <ChatBubbleOutlineOutlinedIcon fontSize="small" /> },
  { label: 'Notifications', path: '/employee/notifications', icon: <NotificationsNoneOutlinedIcon fontSize="small" />, hasCount: true },
];

export function EmployeeWorkspaceLayout({
  children,
  topLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}: {
  children: React.ReactNode;
  topLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    employeeApi
      .getNotifications({ page: 1, pageSize: 20 })
      .then((res) => {
        if (active) {
          setUnreadCount(res.items.filter((n) => !n.isRead).length);
        }
      })
      .catch(() => {
        // Silent fallback if backend not running
      });
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
        <Box sx={{ px: 1, py: 1.5, mb: 2 }}>
          <BrandLogo onClick={() => navigate('/employee/dashboard')} />
        </Box>

        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item) => {
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
                  py: 1,
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
                  slotProps={{ primary: { sx: {
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 500,
                  } } }}
                />
                {item.hasCount && unreadCount > 0 && (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.15,
                      borderRadius: '99px',
                      backgroundColor: figmaTokens.lavender,
                      color: figmaTokens.navy,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </Box>
                )}
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <ListItemButton
            onClick={() => {
              navigate('/employee/settings');
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: '10px',
              py: 1,
              px: 1.5,
              backgroundColor: location.pathname === '/employee/settings' ? figmaTokens.mint : 'transparent',
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile Settings" slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 500 } } }} />
          </ListItemButton>

          <ListItemButton onClick={handleLogout} sx={{ borderRadius: '10px', py: 1, px: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 500 } } }} />
          </ListItemButton>
        </List>
      </Box>

      <Box
        onClick={() => navigate('/employee/settings')}
        sx={{
          p: 1.25,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'rgba(15, 39, 68, 0.02)' },
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ minWidth: 0, alignItems: "center" }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: figmaTokens.iceBlue, color: figmaTokens.navy, fontSize: '0.8rem', fontWeight: 700 }}>
            {user?.avatarInitials || 'SB'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
              {user?.fullName || 'Employee'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role || 'Employee'}
            </Typography>
          </Box>
        </Stack>
        <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
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
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.default',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ flexGrow: 1, maxWidth: 420, alignItems: "center" }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>

            {searchPlaceholder && onSearchChange ? (
              <TextField size="small" fullWidth placeholder={searchPlaceholder} value={searchValue ?? ''} onChange={(e) => onSearchChange(e.target.value)} slotProps={{ input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                } }} />
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.06em', fontWeight: 700 }}>
                {topLabel || 'EMPLOYEE DASHBOARD'}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <IconButton
              onClick={() => navigate('/employee/notifications')}
              sx={{
                backgroundColor: figmaTokens.mint,
                width: 36,
                height: 36,
              }}
              aria-label="Notifications"
            >
              <Badge badgeContent={unreadCount || null} color="primary">
                <NotificationsNoneOutlinedIcon fontSize="small" sx={{ color: figmaTokens.navy }} />
              </Badge>
            </IconButton>

            <Stack direction="row" spacing={1} onClick={() => navigate('/employee/settings')} sx={{ cursor: 'pointer', alignItems: "center" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: figmaTokens.iceBlue, color: figmaTokens.navy, fontSize: '0.78rem', fontWeight: 700 }}>
                {user?.avatarInitials || 'SB'}
              </Avatar>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
                {user?.fullName || 'Employee'}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3.5 }, maxWidth: 1400, width: '100%', mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
