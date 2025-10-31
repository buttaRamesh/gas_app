import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Autocomplete,
  TextField,
} from "@mui/material";
import { deliveryPersonsApi } from "@/services/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import type { DeliveryPerson } from "@/types/routes";

export default function DeliveryPersonConsumersSelect() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

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
    } catch (err: any) {
      console.error("Failed to fetch delivery persons:", err);
      showSnackbar("Failed to load delivery persons", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSelect = (person: DeliveryPerson | null) => {
    if (person) {
      navigate(`/delivery-persons/${person.id}/consumers`);
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
        <Card elevation={3}>
          <CardContent>
            <Autocomplete
              options={deliveryPersons}
              getOptionLabel={(option) => option.name}
              onChange={(_, value) => handlePersonSelect(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Delivery Person"
                  placeholder="Search by name..."
                  variant="outlined"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <Box sx={{ fontWeight: 600 }}>{option.name}</Box>
                    <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                      {option.assigned_routes_count || 0} routes • {option.total_consumers || 0} consumers
                    </Box>
                  </Box>
                </Box>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="No delivery persons found"
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
