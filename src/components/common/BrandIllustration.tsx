import React from 'react';
import { Box, Typography } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

export function BrandLogo({ onClick }: { onClick?: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <SchoolOutlinedIcon sx={{ fontSize: 28, color: 'text.primary' }} />
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: '1.15rem',
          color: 'text.primary',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        SkillBridge AI
      </Typography>
    </Box>
  );
}

export type IllustrationVariant =
  | 'hero-learner'
  | 'auth-laptop'
  | 'reset-shield'
  | 'mini-analytics'
  | 'graduation-cap'
  | 'ai-bot'
  | 'notification-calendar'
  | 'security-shield';

export function BrandIllustration({
  variant,
  width = 240,
  height,
}: {
  variant: IllustrationVariant;
  width?: number;
  height?: number;
}) {
  switch (variant) {
    case 'hero-learner':
      return (
        <svg viewBox="0 0 420 270" width={width} height={height} fill="none" aria-label="SkillBridge AI learner illustration">
          <rect x="20" y="218" width="120" height="36" rx="6" fill="#DDEAF8" />
          <rect x="120" y="182" width="140" height="72" rx="8" fill="#ECE9F8" />
          <rect x="242" y="146" width="150" height="108" rx="10" fill="#E3F3EA" />
          <path d="M292 254V222C292 208 336 208 336 222V254" fill="#FCF8EE" />
          {/* Plant */}
          <path d="M56 218H80L76 236H60L56 218Z" fill="#0F2744" />
          <path d="M68 218V190" stroke="#0F2744" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="58" cy="194" rx="10" ry="5" transform="rotate(-25 58 194)" fill="#32936F" />
          <ellipse cx="78" cy="186" rx="10" ry="5" transform="rotate(25 78 186)" fill="#32936F" />
          {/* Checklist card */}
          <rect x="78" y="64" width="96" height="66" rx="10" fill="#FFFFFF" stroke="#0F2744" strokeWidth="2.2" />
          <circle cx="105" cy="94" r="14" fill="#32936F" />
          <path d="M99 94L103 98L111 89" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="128" y="86" width="30" height="5" rx="2.5" fill="#0F2744" />
          <rect x="128" y="98" width="22" height="5" rx="2.5" fill="#DDEAF8" />
          {/* Chart card */}
          <rect x="312" y="48" width="92" height="78" rx="10" fill="#FFFFFF" stroke="#0F2744" strokeWidth="2.2" />
          <rect x="332" y="102" width="10" height="14" rx="2" fill="#E3F3EA" />
          <rect x="350" y="92" width="10" height="24" rx="2" fill="#E3F3EA" />
          <rect x="368" y="80" width="10" height="36" rx="2" fill="#E3F3EA" />
          <path d="M328 84L348 72L362 78L382 60" stroke="#32936F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M372 60H382V70" stroke="#32936F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          {/* Person sitting with laptop */}
          <circle cx="222" cy="54" r="18" fill="#0F2744" />
          <circle cx="225" cy="57" r="12" fill="#FFFFFF" />
          <path d="M214 48C214 39 233 39 233 48" fill="#0F2744" />
          <path d="M204 78C204 72 238 72 242 96L222 126L198 122L204 78Z" fill="#32936F" />
          <path d="M204 122L242 132L236 184H220L224 146L198 140Z" fill="#0F2744" />
          <path d="M242 132L272 174L258 182L234 150" fill="#0F2744" />
          <path d="M246 100H298L288 126H240L246 100Z" fill="#DDEAF8" stroke="#0F2744" strokeWidth="2.2" />
          <path d="M236 126H290" stroke="#0F2744" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M286 30L291 41L302 46L291 51L286 62L281 51L270 46L281 41L286 30Z" fill="#32936F" />
        </svg>
      );

    case 'auth-laptop':
      return (
        <svg viewBox="0 0 340 210" width={width} height={height} fill="none" aria-label="SkillBridge AI learning illustration">
          <rect x="86" y="48" width="168" height="106" rx="10" fill="#0F2744" />
          <rect x="96" y="58" width="148" height="86" rx="6" fill="#DDEAF8" />
          <path d="M148 92L134 102L148 112" stroke="#0F2744" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M192 92L206 102L192 112" stroke="#0F2744" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M174 86L166 116" stroke="#0F2744" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M62 154H278L290 166H50L62 154Z" fill="#ECE9F8" stroke="#0F2744" strokeWidth="2" />
          {/* Open book */}
          <path d="M84 148C110 140 144 146 170 164C196 146 230 140 256 148L246 184C220 176 192 180 170 194C148 180 120 176 94 184L84 148Z" fill="#FFFFFF" stroke="#32936F" strokeWidth="3" />
          <path d="M170 164V194" stroke="#32936F" strokeWidth="2.5" />
          {/* Floating check cards */}
          <rect x="30" y="68" width="44" height="54" rx="8" fill="#E3F3EA" />
          <circle cx="52" cy="88" r="10" fill="#32936F" />
          <path d="M48 88L51 91L56 85" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <rect x="268" y="64" width="44" height="54" rx="8" fill="#E3F3EA" />
          <circle cx="290" cy="84" r="10" fill="#32936F" />
          <path d="M286 84L289 87L294 81" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          {/* Graduation cap */}
          <path d="M276 144L306 132L332 144L306 156L276 144Z" fill="#ECE9F8" stroke="#0F2744" strokeWidth="2" />
          <path d="M288 150V164C288 164 306 172 322 164V150" fill="#DDEAF8" stroke="#0F2744" strokeWidth="2" />
        </svg>
      );

    case 'reset-shield':
      return (
        <svg viewBox="0 0 260 190" width={width} height={height} fill="none" aria-label="Password reset security illustration">
          <path d="M130 24L188 46V94C188 134 162 162 130 174C98 162 72 134 72 94V46L130 24Z" fill="#E3F3EA" />
          <rect x="50" y="74" width="122" height="82" rx="10" fill="#DDEAF8" stroke="#0F2744" strokeWidth="2.4" />
          <rect x="68" y="54" width="86" height="52" rx="6" fill="#32936F" />
          <path d="M50 80L111 122L172 80" stroke="#0F2744" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M114 54L126 66L156 32" stroke="#0F2744" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="198" cy="110" r="22" fill="#ECE9F8" stroke="#0F2744" strokeWidth="2.2" />
          <circle cx="194" cy="106" r="7" fill="#FFFFFF" stroke="#0F2744" strokeWidth="2" />
          <path d="M208 122L232 146L222 154L214 146L208 152L198 138" fill="#ECE9F8" stroke="#0F2744" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
      );

    case 'mini-analytics':
      return (
        <svg viewBox="0 0 130 72" width={width} height={height} fill="none" aria-label="Analytics illustration">
          <rect x="14" y="48" width="102" height="10" rx="5" fill="#0F2744" />
          <rect x="26" y="14" width="78" height="36" rx="6" fill="#E3F3EA" stroke="#0F2744" strokeWidth="2" />
          <rect x="42" y="28" width="10" height="16" rx="2" fill="#32936F" />
          <rect x="60" y="20" width="10" height="24" rx="2" fill="#32936F" />
          <rect x="78" y="12" width="10" height="32" rx="2" fill="#32936F" />
          <circle cx="100" cy="24" r="9" fill="#DDEAF8" stroke="#0F2744" strokeWidth="1.8" />
          <path d="M96 24L99 27L104 21" stroke="#32936F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'graduation-cap':
      return (
        <svg viewBox="0 0 110 72" width={width} height={height} fill="none" aria-label="Learning milestone illustration">
          <path d="M12 30L55 12L98 30L55 48L12 30Z" fill="#DDEAF8" stroke="#0F2744" strokeWidth="2" />
          <path d="M30 38V54C30 54 55 64 80 54V38" fill="#ECE9F8" stroke="#0F2744" strokeWidth="2" />
          <path d="M90 34V56" stroke="#32936F" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="90" cy="58" r="4" fill="#32936F" />
        </svg>
      );

    case 'ai-bot':
      return (
        <svg viewBox="0 0 110 96" width={width} height={height} fill="none" aria-label="AI Learning Assistant illustration">
          <path d="M55 12V22" stroke="#0F2744" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="55" cy="10" r="4" fill="#32936F" />
          <rect x="26" y="22" width="58" height="44" rx="14" fill="#E3F3EA" stroke="#0F2744" strokeWidth="2.4" />
          <rect x="36" y="34" width="38" height="20" rx="8" fill="#FFFFFF" stroke="#0F2744" strokeWidth="1.8" />
          <circle cx="47" cy="44" r="3.5" fill="#0F2744" />
          <circle cx="63" cy="44" r="3.5" fill="#0F2744" />
          <path d="M24 68C38 62 50 66 55 76C60 66 72 62 86 68L82 86C68 80 60 82 55 88C50 82 42 80 28 86L24 68Z" fill="#DDEAF8" stroke="#32936F" strokeWidth="2.2" />
        </svg>
      );

    case 'notification-calendar':
      return (
        <svg viewBox="0 0 180 140" width={width} height={height} fill="none" aria-label="Assessment reminder illustration">
          <rect x="38" y="26" width="104" height="88" rx="12" fill="#E3F3EA" stroke="#0F2744" strokeWidth="2.4" />
          <rect x="38" y="26" width="104" height="24" rx="8" fill="#DDEAF8" stroke="#0F2744" strokeWidth="2.4" />
          <path d="M74 78L86 90L110 64" stroke="#0F2744" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="38" cy="96" r="24" fill="#E3F3EA" stroke="#0F2744" strokeWidth="2.4" />
          <path d="M38 84V98L48 104" stroke="#0F2744" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M138 66C126 66 118 76 118 90V104H158V90C158 76 150 66 138 66Z" fill="#ECE9F8" stroke="#0F2744" strokeWidth="2.2" />
          <circle cx="138" cy="108" r="5" fill="#FFFFFF" stroke="#0F2744" strokeWidth="2" />
        </svg>
      );

    case 'security-shield':
      return (
        <svg viewBox="0 0 80 80" width={width} height={height} fill="none" aria-label="Account security shield">
          <path d="M40 10L66 20V40C66 56 54 67 40 72C26 67 14 56 14 40V20L40 10Z" fill="#E3F3EA" stroke="#32936F" strokeWidth="2.4" />
          <path d="M30 40L37 47L51 33" stroke="#0F2744" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
