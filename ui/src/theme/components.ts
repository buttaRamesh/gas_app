// src/theme/components.ts
import type { Components, Theme } from "@mui/material";

const borderRadius = 4;

const components: Components<Theme> = {
  // ================================
  // GLOBAL BASELINE
  // ================================
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      body: {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        backgroundColor: "#f5f7fa",
      },

      // ================================
      // CUSTOM PREMIUM SCROLLBAR (GLOBAL)
      // ================================
      // Applied to ALL scrollable elements in the app
      // Color Scheme: Primary Blue throughout (elegant & consistent)
      "*": {
        // Firefox scrollbar
        scrollbarWidth: "thin",
        scrollbarColor: "transparent transparent",
        transition: "scrollbar-color 0.3s ease",

        "&:hover": {
          scrollbarColor: `${theme.palette.primary.light}66 ${theme.palette.primary.light}15`,
        },
      },

      // Webkit scrollbar (Chrome, Edge, Safari)
      "*::-webkit-scrollbar": {
        width: "10px",
        height: "10px",
      },

      "*::-webkit-scrollbar-track": {
        background: `${theme.palette.primary.light}08`,
        borderRadius: "10px",
        margin: "2px",
      },

      // Scrollbar thumb (default - hidden)
      "*::-webkit-scrollbar-thumb": {
        backgroundColor: "transparent",
        borderRadius: "10px",
        border: "2px solid transparent",
        backgroundClip: "padding-box",
        transition: "background-color 0.3s ease, border 0.3s ease",
      },

      // Scrollbar appears on container hover - Light Blue
      "*:hover::-webkit-scrollbar-thumb": {
        backgroundColor: `${theme.palette.primary.light}50`,
      },

      // Scrollbar thumb hover - Medium Blue
      "*::-webkit-scrollbar-thumb:hover": {
        backgroundColor: `${theme.palette.primary.light}80`,
        border: `2px solid ${theme.palette.primary.light}30`,
      },

      // Active/Dragging state - Dark Blue
      "*::-webkit-scrollbar-thumb:active": {
        backgroundColor: theme.palette.primary.main,
        border: `2px solid ${theme.palette.primary.dark}`,
      },
    }),
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
 
  // ================================
// TEXT FIELDS (OUTLINED + SEARCH OVERRIDE)
// ================================
MuiOutlinedInput: {
  styleOverrides: {
    root: ({ theme }) => ({
      // --------------------------------------------------
      // DEFAULT OUTLINED INPUT (FOR ALL NORMAL FORMS)
      // --------------------------------------------------
      borderRadius,
      backgroundColor: "#ffffff",
      transition:
        "border-color 0.18s ease, border-width 0.18s ease, background-color 0.18s ease",

      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#003366",
        borderWidth: "1.5px",
      },

      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#1a5a8a",
      },

      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#43A047",
        borderWidth: "2px",
      },

      "&.Mui-error .MuiOutlinedInput-notchedOutline": {
        borderColor: "#e53935",
        borderWidth: "2px",
      },

      // --------------------------------------------------
      // UNDERLINE SEARCH INPUT (ONLY WHEN class="underline-search")
      // --------------------------------------------------
      "&.underline-search": {
        background: "transparent",
        borderRadius: 0,
        paddingLeft: 0,
        paddingRight: 0,

        "& .MuiOutlinedInput-notchedOutline": {
          border: "none !important",
        },

        "&:hover .MuiOutlinedInput-notchedOutline": {
          border: "none !important",
        },

        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          border: "none !important",
        },

        // default underline
        "&:before": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          borderBottom: "1px solid rgba(255,255,255,0.6)",
        },

        // hover underline
        "&:hover:before": {
          borderBottomColor: "rgba(255,255,255,0.85)",
        },

        // focus underline
        "&.Mui-focused:after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          borderBottom: `2px solid ${theme.palette.secondary.main}`,
        },

        "& .MuiInputBase-input": {
          color: "#fff",
        },

        "& .MuiInputBase-input::placeholder": {
          color: "rgba(255,255,255,0.7)",
        },
      },
    }),
  },
},



  // // ================================
  // // TEXT FIELDS (OUTLINED)
  // // ================================
  // MuiOutlinedInput: {
  //   styleOverrides: {
  //     root: {
  //       borderRadius,
  //       backgroundColor: "#ffffff",
  //       transition:
  //         "border-color 0.18s ease, border-width 0.18s ease, background-color 0.18s ease",

  //       // ---- DEFAULT ----
  //       "& .MuiOutlinedInput-notchedOutline": {
  //         borderColor: "#003366", // Blue border
  //         borderWidth: "1.5px",
  //       },

  //       // ---- HOVER ----
  //       "&:hover .MuiOutlinedInput-notchedOutline": {
  //         borderColor: "#1a5a8a", // lighter blue
  //       },

  //       // ---- FOCUSED ----
  //       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
  //         borderColor: "#43A047", // brighter green
  //         borderWidth: "2px",
  //       },

  //       // ---- ERROR ----
  //       "&.Mui-error .MuiOutlinedInput-notchedOutline": {
  //         borderColor: "#e53935", // brighter red
  //         borderWidth: "2px",
  //       },
  //     },
  //   },
  // },

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

  MuiInputAdornment: {
    styleOverrides: {
      root: {
        color: "white",
        opacity: 0.9,
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
