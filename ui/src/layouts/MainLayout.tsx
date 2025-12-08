import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Outlet } from "react-router-dom";

// const drawerWidth = 240;
const topBarHeight = 64;

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />

      {/* AppBar placed AFTER sidebar */}
      <TopBar />

      {/* Only content scrolls */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // ml: `${drawerWidth}px`,           // push content after sidebar
          mt: `${topBarHeight}px`,          // push content below AppBar
          height: `calc(100vh - ${topBarHeight}px)`,
          overflowY: "auto",
          bgcolor: "background.default",
          p: 2,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
