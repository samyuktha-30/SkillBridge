import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export function ProgressLineChart({
  data,
  height = 240,
}: {
  data: { label: string; score: number }[];
  height?: number;
}) {
  if (!data.length) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No progress history recorded yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: -12, bottom: 4 }}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(val) => [`${val}%`, 'Progress']} />
          <Line
            type="monotone"
            dataKey="score"
            stroke={figmaTokens.navy}
            strokeWidth={2.5}
            dot={{ r: 4, fill: figmaTokens.emerald, stroke: '#FFFFFF', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: figmaTokens.emerald }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
