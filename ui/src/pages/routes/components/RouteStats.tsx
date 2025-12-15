import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import {
  Route as RouteIcon,
  CheckCircle,
  Cancel,
  People,
  Assignment,
  TrendingUp,
} from "@mui/icons-material";
import type { RouteStats as RouteStatsType } from "../types";

interface RouteStatsProps {
  stats: RouteStatsType | null;
  loading?: boolean;
}

export function RouteStats({ stats, loading }: RouteStatsProps) {
  if (loading || !stats) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ borderRadius: 2, background: "linear-gradient(135deg, #003366 0%, #1a5a8a 100%)", color: "white" }}>
            <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <RouteIcon sx={{ fontSize: 24, opacity: 0.9 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700}>{stats.total_routes}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Total Routes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ borderRadius: 2, background: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)", color: "white" }}>
            <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle sx={{ fontSize: 24, opacity: 0.9 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700}>{stats.assigned_routes}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Assigned</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ borderRadius: 2, background: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)", color: "white" }}>
            <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Cancel sx={{ fontSize: 24, opacity: 0.9 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700}>{stats.unassigned_routes}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Unassigned</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ borderRadius: 2, background: "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)", color: "white" }}>
            <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <People sx={{ fontSize: 24, opacity: 0.9 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700}>{stats.total_consumers.toLocaleString()}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Consumers</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ borderRadius: 2, background: "linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)", color: "white" }}>
            <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Assignment sx={{ fontSize: 24, opacity: 0.9 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700}>{stats.assigned_consumers.toLocaleString()}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Assigned</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ borderRadius: 2, background: "linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)", color: "white" }}>
            <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUp sx={{ fontSize: 24, opacity: 0.9 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700}>{Math.round(stats.average_consumers_per_route)}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Avg/Route</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
