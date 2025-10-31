import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Alert,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Route as RouteIcon,
} from "@mui/icons-material";
import { PageHeader } from "../../components/PageHeader";
import { consumersApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { ConsumerDetail, ConsumerRouteInfo, OptingStatus } from "../../types/consumers";

const ConsumerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [consumer, setConsumer] = useState<ConsumerDetail | null>(null);
  const [routeInfo, setRouteInfo] = useState<ConsumerRouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchConsumer();
      fetchRouteInfo();
    }
  }, [id]);

  const fetchConsumer = async () => {
    try {
      setLoading(true);
      const response = await consumersApi.getById(Number(id));
      setConsumer(response.data);
    } catch (error) {
      showSnackbar("Failed to fetch consumer details", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteInfo = async () => {
    try {
      setRouteLoading(true);
      const response = await consumersApi.getRoute(Number(id));
      setRouteInfo(response.data);
    } catch (error) {
      // Route not assigned - this is not necessarily an error
      console.log("No route assigned to this consumer");
    } finally {
      setRouteLoading(false);
    }
  };

  const handleKycToggle = async () => {
    if (!consumer) return;

    try {
      const response = await consumersApi.updateKycStatus(consumer.id, !consumer.is_kyc_done);
      setConsumer(response.data);
      showSnackbar(
        `KYC status updated to ${!consumer.is_kyc_done ? "Done" : "Pending"}`,
        "success"
      );
    } catch (error) {
      showSnackbar("Failed to update KYC status", "error");
      console.error(error);
    }
  };

  const getOptingStatusColor = (status: OptingStatus) => {
    switch (status) {
      case "OPT_IN":
        return "success";
      case "OPT_OUT":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!consumer) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">Consumer not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageHeader
        title={consumer.consumer_name}
        description={`Consumer #${consumer.consumer_number}`}
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate("/consumers")}
            >
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/consumers/${id}/edit`)}
            >
              Edit
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Consumer Number
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {consumer.consumer_number}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Consumer Name
                  </Typography>
                  <Typography variant="body1">{consumer.consumer_name}</Typography>
                </Box>

                {consumer.father_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Father's Name
                    </Typography>
                    <Typography variant="body1">{consumer.father_name}</Typography>
                  </Box>
                )}

                {consumer.mother_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Mother's Name
                    </Typography>
                    <Typography variant="body1">{consumer.mother_name}</Typography>
                  </Box>
                )}

                {consumer.spouse_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Spouse Name
                    </Typography>
                    <Typography variant="body1">{consumer.spouse_name}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status & Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status & Category
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">{consumer.category_name || "-"}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Consumer Type
                  </Typography>
                  <Typography variant="body1">{consumer.type_name || "-"}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Opting Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={consumer.opting_status_display || consumer.opting_status}
                      color={getOptingStatusColor(consumer.opting_status)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    KYC Status
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    {consumer.is_kyc_done ? (
                      <>
                        <CheckIcon color="success" />
                        <Typography variant="body2">KYC Done</Typography>
                      </>
                    ) : (
                      <>
                        <CancelIcon color="error" />
                        <Typography variant="body2">KYC Pending</Typography>
                      </>
                    )}
                    <Button size="small" variant="outlined" onClick={handleKycToggle}>
                      Toggle KYC
                    </Button>
                  </Box>
                </Box>

                {consumer.scheme_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Scheme
                    </Typography>
                    <Typography variant="body1">{consumer.scheme_name}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Government IDs */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Government IDs
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {consumer.ration_card_num && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ration Card Number
                    </Typography>
                    <Typography variant="body1">{consumer.ration_card_num}</Typography>
                  </Box>
                )}

                {consumer.blue_book && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Blue Book Number
                    </Typography>
                    <Typography variant="body1">{consumer.blue_book}</Typography>
                  </Box>
                )}

                {consumer.lpg_id && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      LPG ID
                    </Typography>
                    <Typography variant="body1">{consumer.lpg_id}</Typography>
                  </Box>
                )}

                {consumer.bpl_type_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      BPL Type
                    </Typography>
                    <Typography variant="body1">{consumer.bpl_type_name}</Typography>
                  </Box>
                )}

                {consumer.dct_type_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      DCT Type
                    </Typography>
                    <Typography variant="body1">{consumer.dct_type_name}</Typography>
                  </Box>
                )}

                {!consumer.ration_card_num && !consumer.blue_book && !consumer.lpg_id && !consumer.bpl_type_name && !consumer.dct_type_name && (
                  <Typography variant="body2" color="text.secondary">
                    No government IDs available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Route Assignment */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <RouteIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                Route Assignment
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {routeLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : routeInfo ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Route Code
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {routeInfo.route_code}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Route Description
                    </Typography>
                    <Typography variant="body1">{routeInfo.route_description}</Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/routes/${routeInfo.route_id}`)}
                  >
                    View Route Details
                  </Button>
                </Box>
              ) : (
                <Alert severity="info">No route assigned to this consumer</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PhoneIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {consumer.contacts.length > 0 ? (
                <List dense>
                  {consumer.contacts.map((contact) => (
                    <ListItem key={contact.id}>
                      <ListItemText
                        primary={
                          <Box>
                            {contact.mobile_number && (
                              <Typography variant="body2">
                                <PhoneIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                                Mobile: {contact.mobile_number}
                              </Typography>
                            )}
                            {contact.phone_number && (
                              <Typography variant="body2">
                                <PhoneIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                                Phone: {contact.phone_number}
                              </Typography>
                            )}
                            {contact.email && (
                              <Typography variant="body2">
                                <EmailIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                                Email: {contact.email}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No contact information available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Addresses */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocationIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                Addresses
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {consumer.addresses.length > 0 ? (
                <List dense>
                  {consumer.addresses.map((address) => (
                    <ListItem key={address.id}>
                      <ListItemText
                        primary={address.address_text || "N/A"}
                        secondary={
                          <>
                            {address.city && <span>{address.city}</span>}
                            {address.pin_code && <span> - {address.pin_code}</span>}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No addresses available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ConsumerDetailPage;
