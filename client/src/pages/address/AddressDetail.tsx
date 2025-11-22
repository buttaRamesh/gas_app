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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { PageHeader } from "../../components/PageHeader";
import { addressesApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { Address } from "../../types/address";

const AddressDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAddress();
    }
  }, [id]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await addressesApi.getById(Number(id));
      setAddress(response.data);
    } catch (error) {
      showSnackbar("Failed to fetch address details", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!address) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6" color="error">
          Address not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={`Address #${address.id}`}
        description="View address details"
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate("/addresses")}
            >
              Back to Addresses
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/addresses/${address.id}/edit`)}
            >
              Edit Address
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Main Address Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocationIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Address Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ width: "30%", fontWeight: "bold" }}>
                      Address ID
                    </TableCell>
                    <TableCell>{address.id}</TableCell>
                  </TableRow>

                  {address.house_no && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                        House Number
                      </TableCell>
                      <TableCell>{address.house_no}</TableCell>
                    </TableRow>
                  )}

                  {address.house_name_flat_number && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                        Flat/Building Name
                      </TableCell>
                      <TableCell>{address.house_name_flat_number}</TableCell>
                    </TableRow>
                  )}

                  {address.housing_complex_building && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                        Complex Name
                      </TableCell>
                      <TableCell>{address.housing_complex_building}</TableCell>
                    </TableRow>
                  )}

                  {address.street_road_name && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                        Street/Road Name
                      </TableCell>
                      <TableCell>{address.street_road_name}</TableCell>
                    </TableRow>
                  )}

                  {address.land_mark && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                        Nearby Landmark
                      </TableCell>
                      <TableCell>{address.land_mark}</TableCell>
                    </TableRow>
                  )}

                  {address.city_town_village && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                        City/Town/Village
                      </TableCell>
                      <TableCell>{address.city_town_village}</TableCell>
                    </TableRow>
                  )}

                  {address.district && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                        District
                      </TableCell>
                      <TableCell>{address.district}</TableCell>
                    </TableRow>
                  )}

                  {address.pin_code && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                        Pin Code
                      </TableCell>
                      <TableCell>{address.pin_code}</TableCell>
                    </TableRow>
                  )}

                  {address.address_text && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                        Full Address Text
                      </TableCell>
                      <TableCell>{address.address_text}</TableCell>
                    </TableRow>
                  )}

                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                      Content Type
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={address.content_type_name || `Type ${address.content_type}`}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                      Related Object ID
                    </TableCell>
                    <TableCell>{address.object_id}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddressDetail;
