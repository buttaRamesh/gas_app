import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Person as PersonIcon,
  LocalShipping as RouteIcon,
  People as ConsumersIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { deliveryPersonsApi } from "@/services/api";
import { DeliveryPerson } from "@/types/routes";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";

export default function DeliveryPersons() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPersons, setFilteredPersons] = useState<DeliveryPerson[]>([]);

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPersons(deliveryPersons);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = deliveryPersons.filter((person) =>
      person.name.toLowerCase().includes(query)
    );
    setFilteredPersons(filtered);
  }, [searchQuery, deliveryPersons]);

  const fetchDeliveryPersons = async () => {
    try {
      setLoading(true);
      const response = await deliveryPersonsApi.getAll();
      const persons = Array.isArray(response.data?.results)
        ? response.data.results
        : Array.isArray(response.data)
        ? response.data
        : [];
      setDeliveryPersons(persons);
      setFilteredPersons(persons);
    } catch (err: any) {
      console.error("Failed to fetch delivery persons:", err);
      showSnackbar("Failed to load delivery persons", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={48} />
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "hsl(var(--background))", py: 4 }}>
      <Container maxWidth="xl" sx={{ px: 2 }}>
        <PageHeader
          title="Delivery Persons"
          showSearch
          searchValue={searchQuery}
          searchPlaceholder="Search by name..."
          onSearchChange={setSearchQuery}
        />

        {filteredPersons.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 16 }}>
            <PersonIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {searchQuery ? "No delivery persons found" : "No delivery persons yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery
                ? "Try a different search term"
                : "Add your first delivery person to get started"}
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/delivery-persons/create")}
                sx={{ bgcolor: "primary.main", color: "white" }}
              >
                Add Delivery Person
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3 }}>
            {filteredPersons.map((person) => (
              <Card
                key={person.id}
                elevation={2}
                sx={{
                  height: "100%",
                  bgcolor: "grey.100",
                  borderRadius: 3,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: "2px solid",
                  borderColor: "hsla(var(--primary), 0.3)",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 32px -10px rgba(0, 0, 0, 0.15)",
                    borderColor: "primary.main",
                    bgcolor: "grey.200",
                  },
                }}
                onClick={() => navigate(`/delivery-persons/${person.id}`)}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="overline" 
                        sx={{ 
                          color: "hsl(var(--primary))", 
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          letterSpacing: 1,
                        }}
                      >
                        ID: {person.id}
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
                        {person.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/delivery-persons/${person.id}`);
                        }}
                        sx={{
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                            bgcolor: "primary.light",
                          }
                        }}
                      >
                        <ArrowForwardIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1.5, mb: 0 }}>
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
                      <RouteIcon sx={{ mb: 0.5, color: "white" }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                        {person.assigned_routes_count || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "white", fontWeight: 500, opacity: 0.9 }}>
                        Routes
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
                      <ConsumersIcon sx={{ mb: 0.5, color: "white" }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                        {person.total_consumers || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "white", fontWeight: 500, opacity: 0.9 }}>
                        Consumers
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
