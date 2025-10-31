import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  People as ConsumersIcon,
  Person as PersonIcon,
  LocalShipping as RouteIcon,
} from "@mui/icons-material";
import { deliveryPersonsApi } from "@/services/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";
import type { DeliveryPerson } from "@/types/routes";

export default function DeliveryPersonConsumersSelect() {
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

    const query = searchQuery.toLowerCase();
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
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 4 }}>
      <Container maxWidth="md" sx={{ px: 2 }}>
        <PageHeader
          title="View Consumers by Delivery Person"
          description="Select a delivery person to view all assigned consumers"
        />

        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search delivery persons by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {filteredPersons.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <PersonIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {searchQuery ? "No delivery persons found" : "No delivery persons available"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? "Try a different search term" : "Add delivery persons first"}
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredPersons.map((person) => (
                  <ListItem key={person.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => navigate(`/delivery-persons/${person.id}?tab=consumers`)}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 2 }}>
                        <PersonIcon color="primary" sx={{ fontSize: 40 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {person.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {person.id}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Chip
                            icon={<RouteIcon />}
                            label={`${person.assigned_routes_count || 0} routes`}
                            size="small"
                            color="info"
                          />
                          <Chip
                            icon={<ConsumersIcon />}
                            label={`${person.total_consumers || 0} consumers`}
                            size="small"
                            color="success"
                          />
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
