import React from "react";
import ReactDOM from "react-dom/client";

// ------------------------------
//  FONTS (Inter)
//  Import BEFORE theme
// ------------------------------
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
// If you want variable font instead, replace above lines with:
// import "@fontsource/inter/variable.css";

// ------------------------------
//  GLOBAL CSS RESET
// ------------------------------
import { ThemeProvider, CssBaseline } from "@mui/material";

// ------------------------------
//  YOUR THEME
// ------------------------------
import theme from "@/theme"; 
// Ensure theme/index.ts exports `default theme`

// ------------------------------
//  GLOBAL SNACKBAR PROVIDER
// ------------------------------
import { SnackbarProvider } from "@/contexts/SnackbarContext";

// ------------------------------
//  ROUTER
// ------------------------------
import { BrowserRouter } from "react-router-dom";

// ------------------------------
//  ROOT APP
// ------------------------------
import App from "./App";

// ------------------------------
//  RENDER ROOT
// ------------------------------
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* Apply MUI global resets (modern, consistent UI) */}
      <CssBaseline />

      <SnackbarProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SnackbarProvider>

    </ThemeProvider>
  </React.StrictMode>
);
