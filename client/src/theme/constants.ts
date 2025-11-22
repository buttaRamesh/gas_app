/**
 * Centralized theme constants
 * Used for consistent styling across the application
 */

/**
 * Gradient definitions
 */
export const gradients = {
  /** Primary gradient used in buttons, headers, etc. */
  primary: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(220 90% 62%))',

  /** Primary gradient hover state */
  primaryHover: 'linear-gradient(135deg, hsl(262 90% 68%), hsl(220 95% 72%))',

  /** Card gradient */
  card: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsla(var(--card-gradient-end), 0.05) 100%)',

  /** Pink gradient for special cards */
  pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',

  /** Purple gradient (legacy) */
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

  /** Purple gradient hover state */
  purpleHover: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',

  /** Blue gradient */
  blue: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',

  /** Amber gradient */
  amber: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',

  /** Warm gradient (pink to yellow) */
  warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',

  /** Cyan gradient */
  cyan: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
} as const;

/**
 * Shadow definitions
 */
export const shadows = {
  /** Primary shadow for buttons and dialogs */
  primary: '0 4px 14px rgba(102, 126, 234, 0.4)',

  /** Primary shadow hover state */
  primaryHover: '0 6px 20px rgba(102, 126, 234, 0.5)',

  /** Primary shadow for dialogs */
  dialog: '0 20px 60px rgba(102, 126, 234, 0.3)',

  /** Card shadow */
  card: '0 4px 12px rgba(212, 175, 55, 0.2)',
} as const;

/**
 * Color palette extensions
 */
export const colors = {
  /** Icon color mappings for StatCard */
  iconColors: {
    primary: 'primary.light',
    secondary: 'secondary.light',
    info: 'info.light',
    success: 'success.light',
    warning: 'warning.light',
    error: 'error.light',
  },

  /** Variant type colors */
  variantTypes: {
    DOMESTIC: 'primary',
    COMMERCIAL: 'success',
    INDUSTRIAL: 'warning',
    OTHER: 'default',
  } as const,

  /** Chart colors for data visualization */
  chart: {
    success: '#0d9488',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#0891b2',
    primary: '#475569',
  } as const,

  /** Status-based semantic colors for MUI components */
  status: {
    success: {
      main: '#0d9488',
      light: '#2dd4bf',
      dark: '#0a7269',
    },
    error: {
      main: '#dc3545',
      light: '#e4606d',
      dark: '#bd2130',
    },
    warning: {
      main: '#ffc107',
      light: '#ffcd38',
      dark: '#e0a800',
    },
    info: {
      main: '#0891b2',
      light: '#22d3ee',
      dark: '#06748c',
    },
  } as const,

  /** Priority-based colors for roles, tasks, etc. */
  priority: {
    critical: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#991B1B',
    },
    high: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    medium: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    low: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
  } as const,

  /** Gradient backgrounds for special cards */
  cardGradients: {
    gold: {
      background: 'linear-gradient(145deg, #ffffff 0%, #fef3c7 100%)',
      border: '#fbbf24',
      borderHover: '#f59e0b',
    },
  } as const,

  /** Role-based badge colors */
  roles: {
    admin: '#DC2626',
    manager: '#D97706',
    staff: '#2563EB',
    delivery: '#059669',
    viewer: '#6366F1',
    default: '#6B7280',
  } as const,

  /** Dashboard-specific brand colors */
  dashboard: {
    brown: {
      dark: '#78350f',
      main: '#92400e',
      light: '#fbbf24',
      lighter: '#f59e0b',
    },
    text: {
      muted: '#78716c',
    },
    background: {
      light: '#fafaf9',
    },
  } as const,
} as const;

/**
 * Border radius values
 */
export const borderRadius = {
  small: 1,
  medium: 2,
  large: 3,
  card: 3,
  button: 2,
} as const;

/**
 * Spacing values (multipliers of base spacing unit)
 */
export const spacing = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 6,
  xxl: 8,
} as const;

/**
 * Transition durations
 */
export const transitions = {
  fast: '0.15s',
  normal: '0.2s',
  slow: '0.3s',
  verySlow: '0.5s',
} as const;

/**
 * Typography weights
 */
export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;
