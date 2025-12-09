// MainLayout.tsx
import { Box, useTheme } from "@mui/material";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const theme = useTheme();
  const TOPBAR = theme.custom?.topBarHeight ?? 64;

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {/* FIXED TOPBAR */}
        <Box sx={{ height: TOPBAR, flexShrink: 0 }}>
          <TopBar />
        </Box>

        {/* CONTENT AREA - NO SCROLLING */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            p: 2,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
