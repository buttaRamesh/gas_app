// src/layouts/TopBar.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";

const drawerWidth = 240;     // fixed sidebar width
const topBarHeight = 64;     // your standard top bar height

export default function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);

  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: topBarHeight,
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",

        // DO NOT overlap sidebar
        left: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`,

        display: "flex",
        justifyContent: "center",
      }}
    >
      <Toolbar
        sx={{
          minHeight: topBarHeight,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left side brand title in appbar */}
        <Typography variant="h6" fontWeight={700}>
          Lalitha Gas Agency
        </Typography>

        {/* Push items to right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* ============================
             USER MENU (icon + employee ID)
           ============================ */}
        <Button
          onClick={handleMenuOpen}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            textTransform: "none",
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 24 }} />
          <Typography variant="body1" fontWeight={600}>
            {user?.employee_id || "User"}
          </Typography>
        </Button>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 180,
            },
          }}
        >
          <MenuItem disabled>{user?.employee_id}</MenuItem>
          <MenuItem onClick={handleMenuClose}>Settings</MenuItem>

          <MenuItem
            onClick={() => {
              logout();
              window.location.href = "/?login=true";
            }}
          >
            Logout
          </MenuItem>
        </Menu>

      </Toolbar>
    </AppBar>
  );
}
