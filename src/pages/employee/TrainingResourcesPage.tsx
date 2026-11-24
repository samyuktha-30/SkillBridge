import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import SignalCellularAltOutlinedIcon from '@mui/icons-material/SignalCellularAltOutlined';
import { useNavigate } from 'react-router-dom';
import { EmployeeWorkspaceLayout } from '../../layouts/EmployeeWorkspaceLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { employeeApi } from '../../api/employeeApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { ResourceCardDto } from '../../types/employee.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

const categoryPills = [
  { label: 'All', icon: null },
  { label: 'Programming', icon: <CodeIcon fontSize="small" /> },
  { label: 'Data Science', icon: <BarChartOutlinedIcon fontSize="small" /> },
  { label: 'Machine Learning', icon: <PsychologyOutlinedIcon fontSize="small" /> },
  { label: 'Web Development', icon: <LanguageOutlinedIcon fontSize="small" /> },
  { label: 'Soft Skills', icon: <GroupsOutlinedIcon fontSize="small" /> },
  { label: 'Other', icon: <AppsOutlinedIcon fontSize="small" /> },
];

export function TrainingResourcesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [resourceType, setResourceType] = useState('All');
  const [learningGoal, setLearningGoal] = useState('Reach Target Role Proficiency');
  const [featured, setFeatured] = useState<ResourceCardDto[]>([]);
  const [recommended, setRecommended] = useState<ResourceCardDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await employeeApi.getResources({
        search: search || undefined,
        category: category === 'All' ? undefined : category,
        resourceType: resourceType === 'All' ? undefined : resourceType,
      });
      setLearningGoal(res.learningGoalLabel);
      setFeatured(res.featured);
      setRecommended(res.recommended);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, [search, category, resourceType]);

  useEffect(() => {
    load();
  }, [load]);

  const ctaLabel = (type: ResourceCardDto['resourceType']) => {
    switch (type) {
      case 'Video':
        return 'Watch Now';
      case 'Article':
        return 'Read Article';
      case 'Practice':
        return 'Start Practice';
      default:
        return 'Start Learning';
    }
  };

  return (
    <EmployeeWorkspaceLayout
      searchPlaceholder="Search resources..."
      searchValue={search}
      onSearchChange={setSearch}
    >
      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: 'flex-start', md: 'center' } }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
            Training Resources
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore curated learning materials to build your skills and close skill gaps.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.25,
            borderRadius: '12px',
            backgroundColor: figmaTokens.iceBlue,
            border: `1px solid ${figmaTokens.iceBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <Box>
            <Typography variant="caption" color={figmaTokens.slate} sx={{ display: "block" }}>
              Your Learning Goal
            </Typography>
            <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
              {learningGoal}
            </Typography>
          </Box>
          <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/employee/learning-plan')}>
            View Plan
          </Button>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <BrandIllustration variant="graduation-cap" width={64} />
          </Box>
        </Paper>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Search for courses, videos, or topics..." value={search} onChange={(e) => setSearch(e.target.value)} slotProps={{ input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          } }} />
        <TextField select size="small" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 170 }}>
          {categoryPills.map((c) => (
            <MenuItem key={c.label} value={c.label}>
              {c.label === 'All' ? 'All Categories' : c.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField select size="small" value={resourceType} onChange={(e) => setResourceType(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="All">All Types</MenuItem>
          <MenuItem value="Course">Course</MenuItem>
          <MenuItem value="Video">Video</MenuItem>
          <MenuItem value="Article">Article</MenuItem>
          <MenuItem value="Practice">Practice</MenuItem>
        </TextField>
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 3, flexWrap: "wrap" }}>
        {categoryPills.map((pill) => {
          const active = category === pill.label;
          return (
            <Button
              key={pill.label}
              size="small"
              variant="outlined"
              startIcon={pill.icon}
              onClick={() => setCategory(pill.label)}
              sx={{
                borderRadius: '99px',
                backgroundColor: active ? figmaTokens.iceBlue : 'background.paper',
                borderColor: active ? figmaTokens.navy : 'divider',
                color: 'text.primary',
              }}
            >
              {pill.label}
            </Button>
          );
        })}
      </Stack>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Featured Resources
      </Typography>
      <Grid container spacing={2.25} sx={{ mb: 4 }}>
        {featured.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: '14px',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box
                  sx={{
                    height: 112,
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    mb: 2,
                  }}
                >
                  <BrandIllustration
                    variant={item.resourceType === 'Article' ? 'ai-bot' : 'auth-laptop'}
                    width={108}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      px: 1.25,
                      py: 0.25,
                      borderRadius: '99px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid',
                      borderColor: 'divider',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                  >
                    {item.resourceType}
                  </Box>
                </Box>
                <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
              </Box>

              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {item.durationLabel}
                  </Typography>
                  <SignalCellularAltOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {item.difficulty}
                  </Typography>
                </Stack>
                <Button
                  component="a"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                >
                  {ctaLabel(item.resourceType)}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Recommended for You
      </Typography>
      <Grid container spacing={2}>
        {recommended.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper
              component="a"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { borderColor: figmaTokens.emerald },
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 44,
                    height: 40,
                    borderRadius: '8px',
                    backgroundColor: figmaTokens.lavender,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: figmaTokens.navy,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                  }}
                >
                  {item.skillName.slice(0, 4)}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.resourceType} · {item.durationLabel}
                  </Typography>
                </Box>
              </Stack>
              <ArrowForwardIcon fontSize="small" color="action" />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </EmployeeWorkspaceLayout>
  );
}
