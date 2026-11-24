import { createTheme } from '@mui/material/styles';

export const figmaTokens = {
  canvas: '#FCF8EE',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  navy: '#0F2744',
  slate: '#475569',
  muted: '#64748B',
  emerald: '#32936F',
  emeraldHover: '#277A5C',
  mint: '#E3F3EA',
  mintBorder: '#C7E6D5',
  iceBlue: '#DDEAF8',
  iceBorder: '#C5DCF3',
  lavender: '#ECE9F8',
  lavenderBorder: '#DBD5F4',
  danger: '#DC2626',
  warning: '#D97706',
};

export function createSkillBridgeTheme(mode: 'light' | 'dark' = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: figmaTokens.emerald,
        dark: figmaTokens.emeraldHover,
        light: figmaTokens.mint,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: figmaTokens.navy,
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? '#0B1524' : figmaTokens.canvas,
        paper: isDark ? '#122033' : figmaTokens.surface,
      },
      text: {
        primary: isDark ? '#F1F5F9' : figmaTokens.navy,
        secondary: isDark ? '#94A3B8' : figmaTokens.slate,
      },
      divider: isDark ? '#24344D' : figmaTokens.border,
    },
    typography: {
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      h1: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.015em',
      },
      h4: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 600,
      },
      h6: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 600,
      },
      button: {
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            borderRadius: 8,
            boxShadow: 'none',
            padding: '8px 16px',
            whiteSpace: 'nowrap',
            '&:hover': {
              boxShadow: 'none',
            },
            ...(ownerState.variant === 'contained' && ownerState.color === 'primary'
              ? {
                  backgroundColor: figmaTokens.emerald,
                  '&:hover': {
                    backgroundColor: figmaTokens.emeraldHover,
                  },
                }
              : {}),
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderColor: isDark ? '#24344D' : figmaTokens.border,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#0F1C2E' : '#FFFFFF',
            borderRadius: 8,
            '& fieldset': {
              borderColor: isDark ? '#24344D' : figmaTokens.border,
            },
            '&:hover fieldset': {
              borderColor: figmaTokens.emerald,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            color: isDark ? '#E2E8F0' : figmaTokens.navy,
            borderBottomColor: isDark ? '#24344D' : figmaTokens.border,
          },
          body: {
            borderBottomColor: isDark ? '#1E2D42' : '#EEF2F6',
          },
        },
      },
    },
  });
}
