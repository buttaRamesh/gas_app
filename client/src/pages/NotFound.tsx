import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h1" sx={{ fontWeight: 700, fontSize: "6rem", color: "primary.main", mb: 2 }}>
            404
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>
            Oops! Page not found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound;
