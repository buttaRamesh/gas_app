// src/theme/components.ts
import type { Components, Theme } from "@mui/material";
import { alpha } from "@mui/material";

const borderRadius = 4;

const components: Components<Theme> = {
  // ================================
  // GLOBAL BASELINE
  // ================================
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        backgroundColor: "#f5f7fa",
      },
    },
  },

  // ================================
  // BUTTONS
  // ================================
  MuiButton: {
    defaultProps: {
      disableRipple: true,
    },
    styleOverrides: {
      root: {
        borderRadius,
        fontWeight: 600,
        textTransform: "none",
        paddingLeft: 16,
        paddingRight: 16,
        boxShadow: "none",
      },

      // Blue gradient button (Primary)
      containedPrimary: ({ theme }) => ({
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        color: theme.palette.primary.contrastText,
        "&:hover": {
          background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        },
      }),

      // Yellow → Blue gradient (Secondary = CTA)
      containedSecondary: ({ theme }) => ({
        background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
        color: theme.palette.secondary.contrastText,
        "&:hover": {
          background: `linear-gradient(90deg, ${theme.palette.secondary.light} 0%, ${theme.palette.primary.dark} 100%)`,
        },
      }),
    },
  },

  // ================================
  // TEXT FIELDS (OUTLINED)
  // ================================
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius,
        backgroundColor: "#ffffff",
        transition:
          "border-color 0.18s ease, border-width 0.18s ease, background-color 0.18s ease",

        // ---- DEFAULT ----
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#003366", // Blue border
          borderWidth: "1.5px",
        },

        // ---- HOVER ----
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#1a5a8a", // lighter blue
        },

        // ---- FOCUSED ----
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#43A047", // brighter green
          borderWidth: "2px",
        },

        // ---- ERROR ----
        "&.Mui-error .MuiOutlinedInput-notchedOutline": {
          borderColor: "#e53935", // brighter red
          borderWidth: "2px",
        },
      },
    },
  },

  // ================================
  // INPUT LABEL
  // ================================
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        backgroundColor: "#ffffff", // keeps label clean
        paddingRight: 4,
      },
    },
  },

  // ================================
  // PAPERS
  // ================================
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius,
      },
    },
  },

  // ================================
  // CARD
  // ================================
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius,
        boxShadow:
          "0px 4px 10px rgba(16,24,40,0.06), 0px 1px 2px rgba(16,24,40,0.04)",
      },
    },
  },

  // ================================
  // CHIP
  // ================================
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 600,
      },
    },
  },

  // ================================
  // DIALOGS
  // ================================
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: borderRadius * 2,
      },
    },
  },

  // ================================
  // SNACKBAR
  // ================================
  MuiSnackbarContent: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
};

export default components;
