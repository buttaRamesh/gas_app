import { Card, CardContent, Box, Typography, IconButton, Tooltip, alpha } from "@mui/material";
import { useNavigate } from "react-router";
import { LocationOn, MoreVert, Map, Groups, Person } from "@mui/icons-material";
import type { Route } from "../types";

interface RouteCardProps {
  route: Route;
  onActionClick: (event: React.MouseEvent<HTMLElement>, routeId: number) => void;
}

export function RouteCard({ route, onActionClick }: RouteCardProps) {
  const navigate = useNavigate();
  const hasError = !route.delivery_person_name || route.area_count === 0 || route.consumer_count === 0;

  const handleAreasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/areas/?route=${route.id}`);
  };

  const handleConsumersClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/consumers/list?route=${route.id}`);
  };

  return (
    <Card
      sx={(theme) => ({
        height: "100%",
        transition: "all 0.25s ease",
        position: "relative",
        borderRadius: 2,
        overflow: "visible",
        border: 3,
        borderColor: hasError ? theme.palette.error.main : theme.palette.success.main,
        background: hasError
          ? "linear-gradient(135deg, rgba(244, 67, 54, 0.02) 0%, rgba(244, 67, 54, 0.08) 100%)"
          : "linear-gradient(135deg, rgba(76, 175, 80, 0.02) 0%, rgba(76, 175, 80, 0.08) 100%)",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: hasError
            ? "0 12px 28px rgba(244, 67, 54, 0.3)"
            : "0 12px 28px rgba(76, 175, 80, 0.3)",
          borderColor: hasError ? theme.palette.error.dark : theme.palette.success.dark,
        },
      })}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, background: "linear-gradient(135deg, #003366 0%, #1a5a8a 100%)", display: "flex", boxShadow: "0 4px 12px rgba(0, 51, 102, 0.3)" }}>
              <LocationOn sx={{ color: "white", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ lineHeight: 1.2 }}>{route.area_code}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>{route.area_code_description}</Typography>
            </Box>
          </Box>
          <Tooltip title="Actions">
            <IconButton size="small" onClick={(e) => onActionClick(e, route.id)} sx={{ mt: 0.5, bgcolor: "grey.100", "&:hover": { bgcolor: "grey.200" } }}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1.5 }}>
          <Box
            onClick={handleAreasClick}
            sx={{ display: "flex", alignItems: "center", gap: 0.75, p: 1, bgcolor: alpha("#003366", 0.03), borderRadius: 1.5, cursor: "pointer", transition: "all 0.2s", "&:hover": { bgcolor: alpha("#003366", 0.1), transform: "scale(1.02)" } }}
          >
            <Map sx={{ color: "primary.light", fontSize: 18 }} />
            <Box>
              <Typography variant="body1" fontWeight={700} color="primary.main">{route.area_count}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>Areas</Typography>
            </Box>
          </Box>
          <Box
            onClick={handleConsumersClick}
            sx={{ display: "flex", alignItems: "center", gap: 0.75, p: 1, bgcolor: alpha("#FF9800", 0.05), borderRadius: 1.5, cursor: "pointer", transition: "all 0.2s", "&:hover": { bgcolor: alpha("#FF9800", 0.15), transform: "scale(1.02)" } }}
          >
            <Groups sx={{ color: "warning.main", fontSize: 18 }} />
            <Box>
              <Typography variant="body1" fontWeight={700} color="warning.dark">{route.consumer_count.toLocaleString()}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>Consumers</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={(theme) => ({
          p: 1.25,
          borderRadius: 1.5,
          bgcolor: hasError ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
          border: 1,
          borderColor: hasError ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.success.main, 0.2),
          display: "flex",
          alignItems: "center",
          gap: 1
        })}>
          <Box sx={(theme) => ({
            p: 0.5,
            borderRadius: 1,
            bgcolor: hasError ? theme.palette.error.main : theme.palette.success.main,
            display: "flex"
          })}>
            <Person sx={{ fontSize: 16, color: "white" }} />
          </Box>
          <Typography variant="body2" fontWeight={600} sx={(theme) => ({ color: hasError ? theme.palette.error.dark : theme.palette.success.dark, flex: 1 })}>
            {route.delivery_person_name || "Unassigned"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
