import { Box, Card, Typography, Grid, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { RouteStats as RouteStatsType } from "../types";

interface RouteStatsProps {
  stats: RouteStatsType | null;
  loading?: boolean;
}

export function RouteStats({ stats, loading }: RouteStatsProps) {
  const theme = useTheme();

  if (loading || !stats) {
    return null;
  }

  const statItems = [
    // Row 1
    {
      label: "Total Routes",
      value: stats.total_routes,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.08),
    },
    {
      label: "Assigned Routes",
      value: stats.assigned_routes,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.08),
    },
    {
      label: "Unassigned Routes",
      value: stats.unassigned_routes,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.08),
    },
    // Row 2
    {
      label: "Total Consumers",
      value: stats.total_consumers,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.08),
    },
    {
      label: "Assigned Consumers",
      value: stats.assigned_consumers,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.08),
    },
    {
      label: "Avg Consumers/Route",
      value: stats.average_consumers_per_route,
      color: theme.palette.secondary.main,
      bgColor: alpha(theme.palette.secondary.main, 0.08),
    },
  ];

  return (
    <Box
      sx={{
        mb: 3,
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(-10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        animation: "fadeIn 0.4s ease-out",
      }}
    >
      <Grid container spacing={1.5}>
        {statItems.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: stat.bgColor,
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 12px ${alpha(stat.color, 0.15)}`,
                  borderColor: alpha(stat.color, 0.4),
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "4px",
                  height: "100%",
                  bgcolor: stat.color,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2.5,
                  py: 1.5,
                  pl: 3,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  {stat.label}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: stat.color,
                    fontSize: "1.75rem",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
