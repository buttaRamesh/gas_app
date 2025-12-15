import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import type { Route } from "../types";

interface RouteCardProps {
  route: Route;
  index: number;
}

export function RouteCard({ route, index }: RouteCardProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isUnassigned = !route.delivery_person_name;


  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/routes/${route.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/routes/${route.id}/edit`);
  };

  const handleCardClick = () => {
    navigate(`/routes/${route.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        background: theme.custom.gradients.blueSubtle,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "@keyframes fadeInUp": {
          from: { opacity: 0, transform: "translateY(30px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        animation: `fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s both`,

        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
          borderColor: theme.palette.primary.main,
          borderWidth: "2px",
          background: alpha(theme.palette.primary.main, 0.04),

          "& .stat-box": {
            transform: "scale(1.05)",
          },
        },
      }}
    >

      <CardContent sx={{ p: 2.5 }}>
        {/* Header Section */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: 1.2,
                }}
              >
                {route.area_code}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontSize: "1.1rem",
                  mt: 0.5,
                  lineHeight: 1.3,
                }}
              >
                {route.area_code_description}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
              <IconButton
                size="small"
                onClick={handleView}
                sx={{
                  color: theme.palette.primary.main,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "scale(1.15)",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
                aria-label="View route"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={handleEdit}
                sx={{
                  color: theme.palette.secondary.main,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "scale(1.15)",
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  },
                }}
                aria-label="Edit route"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Stats Section */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
          <Box
            className="stat-box"
            sx={{
              flex: 1,
              textAlign: "center",
              p: 2,
              bgcolor: theme.palette.info.main,
              borderRadius: 2,
              border: `1px solid ${theme.palette.info.dark}`,
              transition: "transform 0.2s ease",
            }}
          >
            <LocationOnIcon sx={{ fontSize: 24, color: theme.palette.common.white, mb: 0.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.common.white, lineHeight: 1 }}>
              {route.area_count}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.common.white, fontWeight: 500, opacity: 0.95 }}>
              Areas
            </Typography>
          </Box>

          <Box
            className="stat-box"
            sx={{
              flex: 1,
              textAlign: "center",
              p: 2,
              bgcolor: theme.palette.success.main,
              borderRadius: 2,
              border: `1px solid ${theme.palette.success.dark}`,
              transition: "transform 0.2s ease",
            }}
          >
            <GroupIcon sx={{ fontSize: 24, color: theme.palette.common.white, mb: 0.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.common.white, lineHeight: 1 }}>
              {route.consumer_count}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.common.white, fontWeight: 500, opacity: 0.95 }}>
              Consumers
            </Typography>
          </Box>
        </Box>

        {/* Delivery Person Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            bgcolor: isUnassigned
              ? alpha(theme.palette.warning.main, 0.1)
              : alpha(theme.palette.primary.main, 0.1),
            borderRadius: 2,
            border: `1px solid ${
              isUnassigned ? theme.palette.warning.main : theme.palette.primary.main
            }`,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: isUnassigned ? theme.palette.warning.main : theme.palette.primary.main,
            }}
          >
            <PersonOutlineIcon sx={{ fontSize: 20, color: theme.palette.common.white }} />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", fontSize: "0.7rem" }}
            >
              Delivery Person
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {route.delivery_person_name || "Unassigned"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
