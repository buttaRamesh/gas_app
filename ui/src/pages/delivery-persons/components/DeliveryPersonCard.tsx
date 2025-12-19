import { Card, CardContent, Box, Typography, Chip, IconButton, alpha } from "@mui/material";
import { Person, Route, People, MoreVert, Phone } from "@mui/icons-material";
import type { DeliveryPerson } from "../types";

interface DeliveryPersonCardProps {
  deliveryPerson: DeliveryPerson;
  onActionClick: (event: React.MouseEvent<HTMLElement>, deliveryPersonId: number) => void;
}

export function DeliveryPersonCard({ deliveryPerson, onActionClick }: DeliveryPersonCardProps) {
  const hasRoutes = deliveryPerson.assigned_routes_count > 0;
  const mobileNumber = deliveryPerson.person.contacts?.[0]?.mobile_number;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,51,102,0.08)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,51,102,0.15)",
          transform: "translateY(-2px)",
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: hasRoutes ? alpha("#4CAF50", 0.1) : alpha("#FF9800", 0.1),
                display: "flex",
              }}
            >
              <Person sx={{ fontSize: 20, color: hasRoutes ? "success.main" : "warning.main" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="primary.main"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {`${deliveryPerson.person.first_name} ${deliveryPerson.person.last_name}`.trim() || deliveryPerson.person.full_name}
              </Typography>
              {mobileNumber && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                  <Phone sx={{ fontSize: 12, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                    {mobileNumber}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => onActionClick(e, deliveryPerson.id)}
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: alpha("#003366", 0.05) },
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            icon={<Route sx={{ fontSize: 14 }} />}
            label={`${deliveryPerson.assigned_routes_count} Routes`}
            size="small"
            sx={{
              bgcolor: hasRoutes ? alpha("#2196F3", 0.1) : alpha("#FF9800", 0.1),
              color: hasRoutes ? "info.main" : "warning.main",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 24,
              "& .MuiChip-icon": {
                color: hasRoutes ? "info.main" : "warning.main",
              },
            }}
          />
          <Chip
            icon={<People sx={{ fontSize: 14 }} />}
            label={`${deliveryPerson.total_consumers} Consumers`}
            size="small"
            sx={{
              bgcolor: alpha("#9C27B0", 0.1),
              color: "#9C27B0",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 24,
              "& .MuiChip-icon": {
                color: "#9C27B0",
              },
            }}
          />
        </Box>

        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Chip
            label={hasRoutes ? "Assigned" : "Unassigned"}
            size="small"
            sx={{
              bgcolor: hasRoutes ? alpha("#4CAF50", 0.1) : alpha("#FF9800", 0.1),
              color: hasRoutes ? "success.dark" : "warning.dark",
              fontWeight: 700,
              fontSize: "0.65rem",
              height: 20,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
