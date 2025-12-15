import { Card, CardContent, Box, Skeleton, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function RouteCardSkeleton() {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header Section */}
        <Box sx={{ mb: 2.5 }}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="80%" height={32} sx={{ mt: 0.5 }} />
        </Box>

        {/* Stats Section */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
          <Skeleton
            variant="rectangular"
            height={90}
            sx={{ flex: 1, borderRadius: 2 }}
            animation="wave"
          />
          <Skeleton
            variant="rectangular"
            height={90}
            sx={{ flex: 1, borderRadius: 2 }}
            animation="wave"
          />
        </Box>

        {/* Delivery Person Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="30%" height={16} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
