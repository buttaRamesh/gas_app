import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Card,
  CardContent,
} from "@mui/material";
import {
  Phone,
  LocationOn,
  Schedule,
  Security,
  LocalShipping,
  CheckCircle,
  Group,
  LocalFireDepartment,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LoginDialog from "@/components/login/LoginDialog";

const Landing = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Navigation */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ px: 2.5 }}>
          <Toolbar disableGutters sx={{ minHeight: 70 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
              <LocalFireDepartment sx={{ fontSize: 32, color: "secondary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                Lalitha Gas Agency
              </Typography>
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, alignItems: "center" }}>
              <Button color="inherit" href="#services" sx={{ color: "text.primary", textTransform: "none" }}>
                Services
              </Button>
              <Button color="inherit" href="#about" sx={{ color: "text.primary", textTransform: "none" }}>
                About
              </Button>
              <Button color="inherit" href="#contact" sx={{ color: "text.primary", textTransform: "none" }}>
                Contact
              </Button>
              <Button
                variant="text"
                size="medium"
                onClick={() => setLoginOpen(true)}
                sx={{
                  color: "text.primary",
                  textTransform: "none",
                  ml: 1
                }}
              >
                Staff Login
              </Button>
              <Button
                variant="contained"
                size="medium"
                onClick={() => navigate("/dashboard")}
                sx={{
                  textTransform: "none",
                  bgcolor: "#F59E0B",
                  "&:hover": {
                    bgcolor: "#D97706"
                  }
                }}
              >
                Get Started
              </Button>
            </Box>
          </Toolbar>
        </Box>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ pt: { xs: 12, md: 14 }, pb: { xs: 4, md: 6 }, bgcolor: "#F9FAFB" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", maxWidth: 900, mx: "auto" }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                mb: 2.5,
                fontSize: { xs: "2.5rem", sm: "3rem", md: "3.75rem" },
                lineHeight: 1.2,
              }}
            >
              Reliable Gas Distribution For Your Home & Business
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6, fontSize: { xs: "1rem", md: "1.125rem" } }}
            >
              Fast, safe, and dependable gas delivery services. Serving our community for over 10 years with excellence.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Phone />}
                sx={{
                  fontSize: "1rem",
                  px: 3,
                  py: 1.25,
                  textTransform: "none",
                  bgcolor: "#F59E0B",
                  "&:hover": {
                    bgcolor: "#D97706"
                  }
                }}
              >
                Call Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  fontSize: "1rem",
                  px: 3,
                  py: 1.25,
                  textTransform: "none",
                  borderColor: "text.primary",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "text.primary",
                    bgcolor: "rgba(0, 0, 0, 0.04)"
                  }
                }}
              >
                Schedule Delivery
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 4, md: 5 }, bgcolor: "background.paper" }}>
        <Box sx={{ px: 2.5 }}>
          <Box sx={{ display: "flex", gap: 3, maxWidth: "1200px", mx: "auto" }}>
            <Card
              elevation={0}
              sx={{
                flex: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    bgcolor: "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                  }}
                >
                  <LocalShipping sx={{ color: "#F59E0B", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 1.5 }}>
                  Fast Delivery
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Same-day and next-day delivery options available across all service areas.
                </Typography>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                flex: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    bgcolor: "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                  }}
                >
                  <Security sx={{ color: "#F59E0B", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 1.5 }}>
                  Safety First
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Certified technicians and strict safety protocols ensure secure gas handling.
                </Typography>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                flex: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    bgcolor: "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                  }}
                >
                  <Schedule sx={{ color: "#F59E0B", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 1.5 }}>
                  24/7 Support
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Round-the-clock customer service for emergencies and inquiries.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Services Section */}
      <Box id="services" sx={{ py: { xs: 8, md: 12 }, bgcolor: "#F9FAFB" }}>
        <Box sx={{ px: 2.5 }}>
          <Box sx={{ textAlign: "center", mb: 6, maxWidth: "1200px", mx: "auto" }}>
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
              Our Services
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto", fontSize: { xs: "1rem", md: "1.25rem" } }}>
              Comprehensive gas solutions for residential and commercial customers
            </Typography>
          </Box>
          <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
            <Box sx={{ display: "flex", gap: 2.5, mb: 2.5 }}>
              {[
                "LPG Cylinder Delivery",
                "Commercial Gas Supply",
                "Gas Connection Setup",
                "Emergency Refills",
              ].map((service) => (
                <Card
                  key={service}
                  elevation={0}
                  sx={{
                    flex: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    transition: "all 0.3s",
                    "&:hover": {
                      borderColor: "#F59E0B",
                      transform: "translateY(-4px)",
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <CheckCircle sx={{ color: "#F59E0B", mb: 1.5, fontSize: 24 }} />
                    <Typography fontWeight={500} variant="body1">{service}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 2.5 }}>
              {[
                "Bulk Gas Orders",
                "Equipment Installation",
                "Safety Inspections",
                "Maintenance Services",
              ].map((service) => (
                <Card
                  key={service}
                  elevation={0}
                  sx={{
                    flex: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    transition: "all 0.3s",
                    "&:hover": {
                      borderColor: "#F59E0B",
                      transform: "translateY(-4px)",
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <CheckCircle sx={{ color: "#F59E0B", mb: 1.5, fontSize: 24 }} />
                    <Typography fontWeight={500} variant="body1">{service}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
        <Box sx={{ px: 2.5 }}>
          <Box sx={{ display: "flex", gap: 6, alignItems: "center", maxWidth: "1200px", mx: "auto" }}>
            {/* Left side - Text content */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, mb: 3 }}>
                Why Choose Lalitha Gas Agency?
              </Typography>
              <Typography color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.7 }}>
                With over a decade of experience in gas distribution, we've built our reputation on
                reliability, safety, and exceptional customer service. Our team of certified
                professionals ensures every delivery meets the highest standards.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <CheckCircle sx={{ color: "#F59E0B", mt: 0.3, flexShrink: 0, fontSize: 24 }} />
                  <Box>
                    <Typography fontWeight={600} gutterBottom variant="body1">
                      Licensed & Certified
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      All our technicians are fully certified and trained.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <CheckCircle sx={{ color: "#F59E0B", mt: 0.3, flexShrink: 0, fontSize: 24 }} />
                  <Box>
                    <Typography fontWeight={600} gutterBottom variant="body1">
                      Wide Coverage
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Serving multiple districts with efficient logistics.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right side - Orange stats card */}
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  bgcolor: "#F59E0B",
                  borderRadius: 3,
                  p: { xs: 4, md: 6 },
                  color: "white",
                  textAlign: "center",
                }}
              >
                <Group sx={{ fontSize: { xs: 48, md: 64 }, mb: 3 }} />
                <Typography variant="h2" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" } }}>
                  10,000+
                </Typography>
                <Typography variant="h6" sx={{ mb: 5 }}>
                  Happy Customers
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}>
                      10+
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Years Experience
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}>
                      99.9%
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Safety Record
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Contact Section */}
      <Box id="contact" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ px: 2.5 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.75rem", md: "2.5rem" } }}>
              Get In Touch
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: "1rem", md: "1.125rem" } }}>
              We're here to serve you. Reach out for orders, inquiries, or emergencies.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 3, maxWidth: "900px", mx: "auto", justifyContent: "center" }}>
            <Card
              elevation={0}
              sx={{
                flex: 1,
                border: 1,
                borderColor: "divider",
                textAlign: "center",
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 2,
                },
              }}
            >
              <CardContent sx={{ py: 4, px: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    bgcolor: "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2.5,
                  }}
                >
                  <Phone sx={{ color: "#F59E0B", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Call Us
                </Typography>
                <Typography color="text.secondary" variant="body1">1-800-LALITHA</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  24/7 Hotline
                </Typography>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                flex: 1,
                border: 1,
                borderColor: "divider",
                textAlign: "center",
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 2,
                },
              }}
            >
              <CardContent sx={{ py: 4, px: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    bgcolor: "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2.5,
                  }}
                >
                  <LocationOn sx={{ color: "#F59E0B", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Visit Us
                </Typography>
                <Typography color="text.secondary" variant="body1">123 Industry Lane</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Machilipatnam, AP 521001
                </Typography>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                flex: 1,
                border: 1,
                borderColor: "divider",
                textAlign: "center",
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 2,
                },
              }}
            >
              <CardContent sx={{ py: 4, px: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    bgcolor: "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2.5,
                  }}
                >
                  <Schedule sx={{ color: "#F59E0B", fontSize: 24 }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Office Hours
                </Typography>
                <Typography color="text.secondary" variant="body1">Mon-Sat: 8AM-8PM</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Sun: 9AM-5PM
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Lalitha Gas Agency. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 0.5 }}>
            Licensed Gas Distributor | Safety Certified
          </Typography>
        </Container>
      </Box>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </Box>
  );
};

export default Landing;
