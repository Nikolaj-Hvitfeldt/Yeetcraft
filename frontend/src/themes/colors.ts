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
  border: {
    subtle: 'rgba(212, 160, 64, 0.25)',
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
    },
    surface: {
      base: '#2D1C0A',
      section: '#1C1208',
      secondary: '#1C1208',
      action: '#1A1300',
    },
    avatar: {
      bg: '#1C1208',
    },
    overlay: {
      dark: 'rgba(0, 0, 0, 0.3)',
    },
    brand: {
      gold: '#FFB900',
    },
    icon: {
      goldBright: '#FFB86A',
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
    },
    surface: {
      base: '#201338',
      section: '#180E2D',
      secondary: '#160C2B',
      action: '#120A20',
    },
    avatar: {
      bg: '#0D0618',
    },
    overlay: {
      dark: 'rgba(0, 0, 0, 0.3)',
    },
    brand: {
      gold: '#FFB900',
    },
    icon: {
      goldBright: '#FFB86A',
    },
  },
} as const
