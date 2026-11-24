import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function TeamPerformanceBarChart({
  data,
  height = 220,
}: {
  data: { employeeName: string; scorePercent: number }[];
  height?: number;
}) {
  if (!data.length) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No employee assessment scores recorded yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 12, left: -12, bottom: 4 }} barSize={34}>
          <CartesianGrid stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="employeeName" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(val) => [`${val}%`, 'Assessment Score']} />
          <Bar dataKey="scorePercent" fill={figmaTokens.emerald} radius={[6, 6, 0, 0]}>
            <LabelList dataKey="scorePercent" position="top" formatter={(v) => `${v}%`} style={{ fill: figmaTokens.navy, fontSize: 12, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
