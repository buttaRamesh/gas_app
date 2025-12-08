import { useState , useEffect} from "react";
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
import { useSearchParams } from "react-router-dom";
import LoginDialog from "@/components/login/LoginDialog";

const Landing = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  useEffect(() => {
  if (params.get("login") === "true") {
    setLoginOpen(true);
  }
}, [params]);
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Navigation - BPCL Blue */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "primary.main",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <Box sx={{ px: 2.5 }}>
          <Toolbar disableGutters sx={{ minHeight: 72 }}>
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
              <LocalFireDepartment sx={{ fontSize: 32, color: "secondary.main" }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "common.white" }}
              >
                Lalitha Gas Agency
              </Typography>
            </Box>

            {/* Menu */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 2,
                alignItems: "center",
              }}
            >
              {["Services", "About", "Contact"].map((item) => (
                <Button
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  sx={{
                    color: "common.white",
                    textTransform: "none",
                    fontWeight: 500,
                    opacity: 0.9,
                    "&:hover": { opacity: 1 },
                  }}
                >
                  {item}
                </Button>
              ))}

              {/* Staff Login */}
              <Button
                variant="outlined"
                onClick={() => setLoginOpen(true)}
                sx={{
                  color: "common.white",
                  borderColor: "rgba(255,255,255,0.6)",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "secondary.main",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Staff Login
              </Button>

              {/* Get Started */}
              <Button
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "secondary.main",
                  color: "black",
                  "&:hover": { bgcolor: "secondary.dark" },
                }}
                onClick={() => navigate("/dashboard")}
              >
                Get Started
              </Button>
            </Box>
          </Toolbar>
        </Box>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", maxWidth: 850, mx: "auto" }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                mb: 2.5,
                color: "primary.main",
                fontSize: { xs: "2.3rem", sm: "2.8rem", md: "3.5rem" },
                lineHeight: 1.2,
              }}
            >
              Reliable Gas Distribution Powered by Modern Technology
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 700, mx: "auto", lineHeight: 1.6 }}
            >
              Safe, efficient and dependable LPG cylinder distribution for homes,
              hotels, restaurants and businesses.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Phone />}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  px: 3,
                  py: 1.25,
                  textTransform: "none",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Call Now
              </Button>

              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  px: 3,
                  py: 1.25,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "primary.dark",
                    bgcolor: "rgba(0, 91, 171, 0.05)",
                  },
                }}
              >
                Schedule Delivery
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            }}
          >
            {[
              {
                icon: <LocalShipping sx={{ color: "primary.main" }} />,
                title: "Fast Delivery",
                desc: "Same-day and next-day delivery across our service areas.",
              },
              {
                icon: <Security sx={{ color: "primary.main" }} />,
                title: "Safety First",
                desc: "Certified technicians and strict safety protocols.",
              },
              {
                icon: <Schedule sx={{ color: "primary.main" }} />,
                title: "24/7 Support",
                desc: "Round-the-clock assistance for emergencies and inquiries.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: "secondary.light",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">{item.desc}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Services Section — 3 Column Grid */}
      <Box id="services" sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            sx={{
              mb: 3,
              color: "primary.main",
              fontSize: { xs: "1.8rem", md: "2.4rem" },
            }}
          >
            Our Services
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6, maxWidth: 700, mx: "auto" }}
          >
            Complete LPG solutions for homes, hotels, businesses and industries.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            }}
          >
            {[
              "LPG Cylinder Delivery",
              "Commercial Gas Supply",
              "Gas Connection Setup",
              "Emergency Refills",
              "Bulk Gas Orders",
              "Equipment Installation",
              "Safety Inspections",
              "Maintenance Services",
              "Regulator & Hose Replacement",
            ].map((service) => (
              <Card
                key={service}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 2,
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <CheckCircle
                    sx={{
                      color: "primary.main",
                      fontSize: 28,
                      mb: 1.5,
                    }}
                  />
                  <Typography fontWeight={600} variant="body1">
                    {service}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", gap: 6, flexDirection: { xs: "column", md: "row" } }}>
            {/* Left side text */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  mb: 3,
                  color: "primary.main",
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Why Choose Lalitha Gas Agency?
              </Typography>

              <Typography
                color="text.secondary"
                paragraph
                sx={{ mb: 4, lineHeight: 1.7 }}
              >
                With over a decade of experience in gas distribution, we have built
                trust through reliability, safety and exceptional service. Our
                certified team ensures the highest delivery standards.
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {[
                  {
                    title: "Licensed & Certified",
                    desc: "All our technicians are fully certified and trained.",
                  },
                  {
                    title: "Wide Coverage",
                    desc: "Serving multiple districts with efficient logistics.",
                  },
                ].map((item) => (
                  <Box key={item.title} sx={{ display: "flex", gap: 2 }}>
                    <CheckCircle sx={{ color: "primary.main", mt: 0.3, fontSize: 24 }} />
                    <Box>
                      <Typography fontWeight={600} gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Right side - Blue Stats Card */}
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: 3,
                  p: { xs: 4, md: 6 },
                  color: "white",
                  textAlign: "center",
                }}
              >
                <Group sx={{ fontSize: { xs: 48, md: 64 }, mb: 3, color: "secondary.main" }} />

                <Typography
                  variant="h2"
                  fontWeight={700}
                  sx={{ fontSize: { xs: "2.5rem", md: "3.4rem" } }}
                >
                  10,000+
                </Typography>

                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                  Happy Customers
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      10+
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Years Experience
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      99.9%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Safety Record
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Contact Section + WhatsApp */}
      <Box id="contact" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            sx={{ mb: 3, color: "primary.main" }}
          >
            Get In Touch
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6 }}
          >
            We're here to help. Reach out for orders, inquiries or emergencies.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
            }}
          >
            {/* Call */}
            <Card
              elevation={0}
              sx={{
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": { transform: "translateY(-5px)", boxShadow: 3 },
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Phone sx={{ color: "primary.main", fontSize: 30, mb: 2 }} />
                <Typography variant="h6" fontWeight={600}>
                  Call Us
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  1-800-LALITHA
                </Typography>
              </CardContent>
            </Card>

            {/* Visit */}
            <Card
              elevation={0}
              sx={{
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": { transform: "translateY(-5px)", boxShadow: 3 },
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <LocationOn sx={{ color: "primary.main", fontSize: 30, mb: 2 }} />
                <Typography variant="h6" fontWeight={600}>
                  Visit Us
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Machilipatnam, AP
                </Typography>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card
              elevation={0}
              sx={{
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": { transform: "translateY(-5px)", boxShadow: 3 },
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Schedule sx={{ color: "primary.main", fontSize: 30, mb: 2 }} />
                <Typography variant="h6" fontWeight={600}>
                  Office Hours
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Mon–Sat: 8AM–8PM
                </Typography>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card
              elevation={0}
              sx={{
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": { transform: "translateY(-5px)", boxShadow: 3 },
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "#25D36633",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src="https://img.icons8.com/color/48/25D366/whatsapp.png"
                    width={32}
                    height={32}
                  />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  WhatsApp
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Chat with us instantly
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: "primary.main",
          color: "common.white",
          pt: 6,
          pb: 3,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr" },
              gap: 4,
              mb: 4,
            }}
          >
            {/* Branding */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <LocalFireDepartment sx={{ fontSize: 34, color: "secondary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Lalitha Gas Agency
                </Typography>
              </Box>

              <Typography sx={{ opacity: 0.85, lineHeight: 1.6 }}>
                Reliable LPG distribution with over a decade of trusted service.
                Our mission is to ensure safe, timely and dependable deliveries
                for homes and businesses.
              </Typography>
            </Box>

            {/* Quick Links */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Quick Links
              </Typography>

              {[
                { label: "Services", href: "#services" },
                { label: "About Us", href: "#about" },
                { label: "Contact", href: "#contact" },
              ].map((item) => (
                <Typography
                  key={item.label}
                  component="a"
                  href={item.href}
                  sx={{
                    display: "block",
                    mb: 1.2,
                    color: "common.white",
                    opacity: 0.85,
                    textDecoration: "none",
                    "&:hover": { opacity: 1, textDecoration: "underline" },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>

            {/* Contact Info */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Contact
              </Typography>

              <Typography sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Phone sx={{ fontSize: 20, color: "secondary.main" }} />
                1-800-LALITHA
              </Typography>

              <Typography sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <LocationOn sx={{ fontSize: 20, color: "secondary.main" }} />
                Machilipatnam, AP
              </Typography>

              <Typography sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <Schedule sx={{ fontSize: 20, color: "secondary.main" }} />
                Mon–Sat: 8AM–8PM
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Box
            sx={{
              height: "1px",
              bgcolor: "rgba(255,255,255,0.2)",
              mb: 2,
            }}
          />

          {/* Bottom Text */}
          <Typography align="center" sx={{ opacity: 0.75 }}>
            © {new Date().getFullYear()} Lalitha Gas Agency — All rights reserved.
          </Typography>
          <Typography align="center" variant="caption" sx={{ opacity: 0.65 }}>
            Licensed LPG Distributor | Safety Certified
          </Typography>
        </Container>
      </Box>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </Box>
  );
};

export default Landing;
