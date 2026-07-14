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
    subtle: 'rgba(140, 174, 226, 0.18)',
  },
} as const

export const colorThemes = {
  daytime: {
    background: {
      default: '#120E09',
      app: '#100D08',
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
      subtle: 'rgba(180, 148, 102, 0.22)',
    },
    surface: {
      base: '#352918',
      section: '#24180B',
    },
    avatar: {
      bg: '#1A1209',
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
      default: '#070B1B',
      app: '#070B1B',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#93A3BD',
      tertiary: '#EDF5FF',
      link: '#DCEAFF',
      accent: '#EDF5FF',
    },
    accent: {
      primary: '#36A3FF',
      secondary: '#00D3F3',
      purple: '#C27AFF',
    },
    stat: sharedColors.stat,
    border: {
      subtle: 'rgba(140, 174, 226, 0.18)',
    },
    surface: {
      base: '#17213D',
      section: '#10172D',
    },
    avatar: {
      bg: '#020618',
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
