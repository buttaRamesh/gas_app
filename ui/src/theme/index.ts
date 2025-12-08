// src/theme/index.ts
import { createTheme } from "@mui/material/styles";
import { alpha } from "@mui/material";

import palette from "./palette";
import typography from "./typography";
import components from "./components";

// ----------------------
// Custom theme tokens
// ----------------------
const drawerWidth = 240;
const topBarHeight = 64;

// We safely cast palette.primary as any 
// because TypeScript cannot infer custom palette structure from external files.
const p: any = palette.primary;
const s: any = palette.secondary;

// ----------------------
// Gradients
// ----------------------
const gradients = {
  blue: `linear-gradient(90deg, ${p.main} 0%, ${p.light} 100%)`,
  yellow: `linear-gradient(90deg, ${s.main} 0%, ${s.light} 100%)`,
  blueToYellow: `linear-gradient(90deg, ${p.main} 0%, ${s.main} 100%)`,
  blueSubtle: `linear-gradient(90deg, ${alpha(p.main, 0.08)} 0%, ${alpha(p.light, 0.02)} 100%)`,
  yellowSubtle: `linear-gradient(90deg, ${alpha(s.main, 0.12)} 0%, ${alpha(s.light, 0.02)} 100%)`,
};

// ----------------------
// Custom fields
// ----------------------
declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      drawerWidth: number;
      topBarHeight: number;
      gradients: typeof gradients;
    };
  }

  interface ThemeOptions {
    custom?: {
      drawerWidth?: number;
      topBarHeight?: number;
      gradients?: typeof gradients;
    };
  }
}

// ----------------------
// Final Theme
// ----------------------
const theme = createTheme({
  palette,
  typography,
  components,
  shape: { borderRadius: 4 },

  custom: {
    drawerWidth,
    topBarHeight,
    gradients,
  },
});

export default theme;
