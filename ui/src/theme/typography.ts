// src/theme/typography.ts
import type { ThemeOptions } from "@mui/material/styles";

/**
 * Use ThemeOptions['typography'] typing so it matches MUI v7 exactly.
 * We export a strongly-typed object to be merged into createTheme().
 */
const typography: NonNullable<ThemeOptions["typography"]> = {
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",

  h1: { fontWeight: 700, lineHeight: 1.2 },
  h2: { fontWeight: 700, lineHeight: 1.25 },
  h3: { fontWeight: 700, lineHeight: 1.3 },
  h4: { fontWeight: 600, lineHeight: 1.3 },
  h5: { fontWeight: 600, lineHeight: 1.25 },
  h6: { fontWeight: 600, lineHeight: 1.2 },

  body1: { fontWeight: 400, lineHeight: 1.6 },
  body2: { fontWeight: 400, lineHeight: 1.5 },

  button: { fontWeight: 700, textTransform: "none" },
};

export default typography;
