import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import {
  LocalShipping,
  CheckCircle,
  Cancel,
  Route as RouteIcon,
} from "@mui/icons-material";
import type { DeliveryPersonStats as DeliveryPersonStatsType } from "../types";

interface DeliveryPersonStatsProps {
  stats: DeliveryPersonStatsType | null;
  loading?: boolean;
}

export function DeliveryPersonStats({ stats, loading }: DeliveryPersonStatsProps) {
  if (loading || !stats) {
    return null;
  }

  return (
    <Box sx={{ mb: 1.5 }}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ borderRadius: 2, background: "linear-gradient(135deg, #003366 0%, #1a5a8a 100%)", color: "white" }}>
            <CardContent sx={{ py: 0.75, px: 1.25, "&:last-child": { pb: 0.75 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <LocalShipping sx={{ fontSize: 20, opacity: 0.9 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} fontSize="1.1rem">{stats.total_delivery_persons}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Total Persons</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ borderRadius: 2, background: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)", color: "white" }}>
            <CardContent sx={{ py: 0.75, px: 1.25, "&:last-child": { pb: 0.75 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CheckCircle sx={{ fontSize: 20, opacity: 0.9 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} fontSize="1.1rem">{stats.assigned_delivery_persons}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Assigned</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ borderRadius: 2, background: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)", color: "white" }}>
            <CardContent sx={{ py: 0.75, px: 1.25, "&:last-child": { pb: 0.75 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Cancel sx={{ fontSize: 20, opacity: 0.9 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} fontSize="1.1rem">{stats.unassigned_delivery_persons}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Unassigned</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ borderRadius: 2, background: "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)", color: "white" }}>
            <CardContent sx={{ py: 0.75, px: 1.25, "&:last-child": { pb: 0.75 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <RouteIcon sx={{ fontSize: 20, opacity: 0.9 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} fontSize="1.1rem">{stats.total_routes}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Total Routes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
