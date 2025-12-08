import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";

const LandingAppBar = () => {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* Brand / Logo */}
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Gas Application
        </Typography>

        {/* Right side buttons */}
        <Box>
          <Button color="inherit" href="/login">
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default LandingAppBar;
