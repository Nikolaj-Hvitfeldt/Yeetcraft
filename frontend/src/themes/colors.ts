export type ThemeName = 'daytime' | 'midnight'

export const sharedColors = {
  stat: {
    total: '#53EAFD',
    deaths: '#DAB2FF',
    yeets: '#FEE685',
  },
  accent: {
    purple: '#C27AFF',
  },
  brand: {
    gold: '#FFB900',
  },
  overlay: {
    dark: 'rgba(0, 0, 0, 0.3)',
  },
} as const

export const colorThemes = {
  daytime: {
    background: {
      default: '#0F0A04',
      app: '#0F0A04',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A89478',
      tertiary: '#EDE0C8',
      link: '#E8C88A',
      accent: '#FEF3C6',
    },
    accent: {
      primary: '#FFB900',
      secondary: '#FE9A00',
      purple: '#C27AFF',
    },
    stat: sharedColors.stat,
    border: {
      subtle: 'rgba(212, 160, 64, 0.25)',
      emphasis: 'rgba(212, 160, 64, 0.45)',
    },
    surface: {
      base: '#2D1C0A',
      section: '#1C1208',
      secondary: '#1C1208',
      // Reserved for future Record Run button styling.
      action: '#1A1300',
    },
    avatar: {
      bg: '#1C1208',
    },
    overlay: sharedColors.overlay,
    brand: {
      gold: sharedColors.brand.gold,
      titleGradient:
        'linear-gradient(180deg, #ffd700 0%, #ffb400 40%, #e66414 70%, #b4280a 100%)',
      titleFilter:
        'drop-shadow(0 8px 22px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 24px rgba(255, 140, 0, 0.7)) drop-shadow(0 0 52px rgba(204, 102, 0, 0.5)) drop-shadow(0 0 90px rgba(255, 92, 0, 0.35))',
    },
  },
  midnight: {
    background: {
      default: '#0A0614',
      app: '#0A0614',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A89BBF',
      tertiary: '#EDE9FE',
      link: '#C4B5FD',
      accent: '#EDE9FE',
    },
    accent: {
      primary: '#9333EA',
      secondary: '#A855F7',
      purple: '#C27AFF',
    },
    stat: sharedColors.stat,
    border: {
      subtle: 'rgba(168, 85, 247, 0.22)',
      emphasis: 'rgba(168, 85, 247, 0.35)',
    },
    surface: {
      base: '#201338',
      section: '#180E2D',
      secondary: '#160C2B',
      // Reserved for future Record Run button styling.
      action: '#120A20',
    },
    avatar: {
      bg: '#0D0618',
    },
    overlay: sharedColors.overlay,
    brand: {
      gold: sharedColors.brand.gold,
      titleGradient:
        'linear-gradient(180deg, #b4d2ff 0%, #8caae6 40%, #a078d2 62%, #6b21a8 82%, #3b0764 100%)',
      titleFilter:
        'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 28px rgba(139, 92, 246, 0.7)) drop-shadow(0 0 52px rgba(168, 85, 247, 0.6)) drop-shadow(0 0 96px rgba(192, 132, 252, 0.4))',
    },
  },
} as const
