import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Card, CardContent, IconButton } from "@mui/material";
import {
  ArrowBack as BackIcon,
  PersonOutline as PersonIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { PageHeader } from "@/components/PageHeader";

const colorVariants = [
  {
    id: 1,
    name: "Original Gold Gradient",
    background: "linear-gradient(145deg, #ffffff 0%, rgba(212, 175, 55, 0.15) 100%)",
    borderColor: "rgba(212, 175, 55, 0.3)",
    hoverBg: "linear-gradient(145deg, #ffffff 0%, rgba(212, 175, 55, 0.25) 100%)",
  },
  {
    id: 2,
    name: "Soft Blue Gradient",
    background: "linear-gradient(145deg, #ffffff 0%, rgba(59, 130, 246, 0.15) 100%)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    hoverBg: "linear-gradient(145deg, #ffffff 0%, rgba(59, 130, 246, 0.25) 100%)",
  },
  {
    id: 3,
    name: "Mint Green Gradient",
    background: "linear-gradient(145deg, #ffffff 0%, rgba(16, 185, 129, 0.15) 100%)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    hoverBg: "linear-gradient(145deg, #ffffff 0%, rgba(16, 185, 129, 0.25) 100%)",
  },
  {
    id: 4,
    name: "Lavender Gradient",
    background: "linear-gradient(145deg, #ffffff 0%, rgba(139, 92, 246, 0.15) 100%)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    hoverBg: "linear-gradient(145deg, #ffffff 0%, rgba(139, 92, 246, 0.25) 100%)",
  },
  {
    id: 5,
    name: "Rose Gradient",
    background: "linear-gradient(145deg, #ffffff 0%, rgba(244, 63, 94, 0.15) 100%)",
    borderColor: "rgba(244, 63, 94, 0.3)",
    hoverBg: "linear-gradient(145deg, #ffffff 0%, rgba(244, 63, 94, 0.25) 100%)",
  },
  {
    id: 6,
    name: "Warm Orange Gradient",
    background: "linear-gradient(145deg, #ffffff 0%, rgba(249, 115, 22, 0.15) 100%)",
    borderColor: "rgba(249, 115, 22, 0.3)",
    hoverBg: "linear-gradient(145deg, #ffffff 0%, rgba(249, 115, 22, 0.25) 100%)",
  },
  {
    id: 7,
    name: "Teal Gradient",
    background: "linear-gradient(145deg, #ffffff 0%, rgba(20, 184, 166, 0.15) 100%)",
    borderColor: "rgba(20, 184, 166, 0.3)",
    hoverBg: "linear-gradient(145deg, #ffffff 0%, rgba(20, 184, 166, 0.25) 100%)",
  },
  {
    id: 8,
    name: "Slate Gradient",
    background: "linear-gradient(145deg, #ffffff 0%, rgba(100, 116, 139, 0.15) 100%)",
    borderColor: "rgba(100, 116, 139, 0.3)",
    hoverBg: "linear-gradient(145deg, #ffffff 0%, rgba(100, 116, 139, 0.25) 100%)",
  },
  {
    id: 9,
    name: "Amber Gradient",
    background: "linear-gradient(145deg, #ffffff 0%, rgba(245, 158, 11, 0.15) 100%)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    hoverBg: "linear-gradient(145deg, #ffffff 0%, rgba(245, 158, 11, 0.25) 100%)",
  },
  {
    id: 10,
    name: "Indigo Gradient",
    background: "linear-gradient(145deg, #ffffff 0%, rgba(99, 102, 241, 0.15) 100%)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    hoverBg: "linear-gradient(145deg, #ffffff 0%, rgba(99, 102, 241, 0.25) 100%)",
  },
];

const sampleRoute = {
  area_code: "RT-001",
  area_code_description: "North District Main",
  area_count: 5,
  consumer_count: 142,
  delivery_person_name: "John Doe",
};

export default function RouteCardColorDemo() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="xl" sx={{ px: 2 }}>
        <PageHeader
          title="Route Card Color Options"
          description="Preview different background colors for route cards"
          actions={
            <IconButton onClick={() => navigate("/routes")} sx={{ bgcolor: "background.paper" }}>
              <BackIcon />
            </IconButton>
          }
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(2, 1fr)",
            },
            gap: 4,
          }}
        >
          {colorVariants.map((variant) => (
            <Box key={variant.id}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {variant.id}. {variant.name}
              </Typography>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  background: variant.background,
                  borderRadius: 3,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: "2px solid",
                  borderColor: variant.borderColor,
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 32px -10px rgba(0, 0, 0, 0.2)",
                    borderColor: variant.borderColor.replace("0.2", "0.5"),
                    background: variant.hoverBg,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: "#d4af37",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          letterSpacing: 1,
                        }}
                      >
                        {sampleRoute.area_code}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          fontSize: "1rem",
                          mt: 0.5,
                          lineHeight: 1.3,
                        }}
                      >
                        {sampleRoute.area_code_description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        sx={{
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                            bgcolor: "primary.light",
                          },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        sx={{
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                            bgcolor: "secondary.light",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        sx={{
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                            bgcolor: "error.light",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        p: 2,
                        bgcolor: "info.main",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "info.dark",
                      }}
                    >
                      <LocationIcon sx={{ mb: 0.5, color: "white" }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                        {sampleRoute.area_count}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "white", fontWeight: 500, opacity: 0.9 }}>
                        Areas
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        p: 2,
                        bgcolor: "success.main",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "success.dark",
                      }}
                    >
                      <GroupIcon sx={{ mb: 0.5, color: "white" }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                        {sampleRoute.consumer_count}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "white", fontWeight: 500, opacity: 0.9 }}>
                        Consumers
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      bgcolor: "primary.light",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18, color: "white" }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.65rem" }}>
                        Delivery Person
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {sampleRoute.delivery_person_name}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
