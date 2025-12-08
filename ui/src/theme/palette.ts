// src/theme/palette.ts
import type { PaletteOptions } from "@mui/material/styles";

const palette: PaletteOptions = {
  primary: {
    main: "#003366",
    light: "#1a5a8a",
    dark: "#002244",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#FFCC00",
    light: "#FFD633",
    dark: "#CC9900",
    contrastText: "#003366",
  },
  success: {
    main: "#4CAF50",
    light: "#81C784",
    dark: "#388E3C",
  },
  error: {
    main: "#d32f2f",
    light: "#ef5350",
    dark: "#c62828",
  },
  warning: {
    main: "#FF9800",
    light: "#FFB74D",
    dark: "#F57C00",
  },
  info: {
    main: "#2196F3",
    light: "#64B5F6",
    dark: "#1976D2",
  },
  background: {
    default: "#f5f7fa",
    paper: "#ffffff",
  },
  text: {
    primary: "#1a1a2e",
    secondary: "#5c6b7a",
  },
};

export default palette;
