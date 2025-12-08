// src/pages/dashboard/DashboardPage.tsx
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Grid,   // ⭐ Correct MUI v7 Grid import
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import InventoryIcon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import { useAuthStore } from "@/store/auth.store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const stats = [
    {
      label: "Total Consumers",
      value: "5,120",
      icon: <PersonIcon />,
      color: "primary.main",
    },
    {
      label: "Pending KYC",
      value: "37",
      icon: <PendingActionsIcon />,
      color: "warning.main",
    },
    {
      label: "Inventory Items",
      value: "12",
      icon: <InventoryIcon />,
      color: "secondary.main",
    },
    {
      label: "Today's Deliveries",
      value: "89",
      icon: <LocalShippingIcon />,
      color: "success.main",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Title */}
      <Typography variant="h4" fontWeight={700} mb={3}>
        Welcome back, {user?.employee_id ?? "User"}! 👋
      </Typography>

      {/* ===============================
          STAT CARDS — Strict v7 Grid API
      =============================== */}
      <Grid container spacing={3} mb={4}>
        {stats.map((s, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                cursor: "pointer",
                transition: "0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: s.color, color: "white" }}>
                    {s.icon}
                  </Avatar>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {s.label}
                    </Typography>

                    <Typography variant="h5" fontWeight={700}>
                      {s.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ===============================
          CHARTS — Strict v7 Grid API
      =============================== */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2} fontWeight={700}>
                Consumer Growth
              </Typography>
              <Box sx={{ height: 300, bgcolor: "#f0f0f0", borderRadius: 2 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2} fontWeight={700}>
                Cylinder Distribution
              </Typography>
              <Box sx={{ height: 300, bgcolor: "#f0f0f0", borderRadius: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===============================
          RECENT ACTIVITY — Strict v7 Grid API
      =============================== */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Recent Activity
          </Typography>
          <Box sx={{ height: 200, bgcolor: "#f0f0f0", borderRadius: 2 }} />
        </CardContent>
      </Card>
    </Box>
  );
}
