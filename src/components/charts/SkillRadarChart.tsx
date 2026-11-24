import React from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Box, Stack, Typography } from '@mui/material';
import type { SkillOverviewPoint } from '../../types/employee.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function SkillRadarChart({ data, height = 270 }: { data: SkillOverviewPoint[]; height?: number }) {
  if (!data.length) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Complete a skill assessment to view your radar comparison.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="74%" data={data}>
            <PolarGrid stroke="#CBD5E1" />
            <PolarAngleAxis dataKey="skillName" tick={{ fill: '#0F2744', fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} axisLine={false} />
            <Radar
              name="Required Level"
              dataKey="requiredLevel"
              stroke="#64748B"
              fill="#94A3B8"
              fillOpacity={0.22}
              strokeWidth={1.75}
            />
            <Radar
              name="Your Skills"
              dataKey="currentLevel"
              stroke={figmaTokens.emerald}
              fill={figmaTokens.emerald}
              fillOpacity={0.32}
              strokeWidth={2.2}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
      <Stack direction="row" spacing={3} sx={{ mt: 0.5, justifyContent: "center" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: figmaTokens.emerald }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Your Skills
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#94A3B8' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Required Level
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
