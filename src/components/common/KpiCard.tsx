import React from 'react';
import { Box, LinearProgress, Paper, Typography } from '@mui/material';
import { figmaTokens } from '../../theme/skillBridgeTheme';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'white' | 'mint' | 'ice' | 'lavender';
  progressPercent?: number;
  deltaLabel?: string;
}

const variantStyles: Record<NonNullable<KpiCardProps['variant']>, { bg: string; border: string; iconBg: string }> = {
  white: { bg: '#FFFFFF', border: figmaTokens.border, iconBg: '#F8FAFC' },
  mint: { bg: figmaTokens.mint, border: figmaTokens.mintBorder, iconBg: '#FFFFFF' },
  ice: { bg: figmaTokens.iceBlue, border: figmaTokens.iceBorder, iconBg: '#FFFFFF' },
  lavender: { bg: figmaTokens.lavender, border: figmaTokens.lavenderBorder, iconBg: '#FFFFFF' },
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'white',
  progressPercent,
  deltaLabel,
}: KpiCardProps) {
  const style = variantStyles[variant];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: style.border,
        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.background.paper : style.bg),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.25,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.75 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography
              variant="h4"
              className="tabular-nums"
              sx={{ fontSize: '1.65rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.15 }}
            >
              {value}
            </Typography>
            {deltaLabel && (
              <Typography variant="caption" className="tabular-nums" sx={{ color: figmaTokens.emerald, fontWeight: 700 }}>
                {deltaLabel}
              </Typography>
            )}
          </Box>
        </Box>
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : style.iconBg),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      {subtitle && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {subtitle}
        </Typography>
      )}

      {typeof progressPercent === 'number' && (
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, progressPercent))}
          sx={{
            height: 6,
            borderRadius: 99,
            backgroundColor: 'rgba(15, 39, 68, 0.08)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 99,
              backgroundColor: figmaTokens.emerald,
            },
          }}
        />
      )}
    </Paper>
  );
}
