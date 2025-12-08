// src/pages/theme/ThemePreview.tsx
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  Avatar,
  AppBar,
  Toolbar,
  Paper,
  Divider,
} from "@mui/material";

import InventoryIcon from "@mui/icons-material/Inventory2";
import theme from "@/theme";

export default function ThemePreview() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Theme Preview
      </Typography>

      {/* -------------------------
            COLOR PALETTE + GRADIENTS
         ------------------------- */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            Color Palette
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Paper sx={{ width: 60, height: 60, bgcolor: theme.palette.primary.main }} />
            <Paper sx={{ width: 60, height: 60, bgcolor: theme.palette.secondary.main }} />
            <Paper sx={{ width: 60, height: 60, bgcolor: theme.palette.success.main }} />
            <Paper sx={{ width: 60, height: 60, bgcolor: theme.palette.error.main }} />
          </Stack>

          <Typography variant="subtitle2" sx={{ mt: 3 }}>
            Gradients
          </Typography>

          <Stack spacing={1} sx={{ mt: 1 }}>
            <Box sx={{ height: 40, borderRadius: 1, background: theme.custom.gradients.blue }} />
            <Box sx={{ height: 40, borderRadius: 1, background: theme.custom.gradients.yellow }} />
            <Box
              sx={{
                height: 40,
                borderRadius: 1,
                background: theme.custom.gradients.blueToYellow,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* -------------------------
            TYPOGRAPHY
         ------------------------- */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            Typography
          </Typography>

          <Typography variant="h1">Heading H1</Typography>
          <Typography variant="h2">Heading H2</Typography>
          <Typography variant="h3">Heading H3</Typography>
          <Typography variant="h4">Heading H4</Typography>
          <Typography variant="h5">Heading H5</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Body text example — This uses your Inter font and theme typography settings.
          </Typography>
        </CardContent>
      </Card>

      {/* -------------------------
            BUTTONS
         ------------------------- */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            Buttons
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" color="secondary">
              Primary Action (Gradient)
            </Button>
            <Button variant="contained" color="primary">
              Blue (Gradient)
            </Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="text">Text Button</Button>
          </Stack>
        </CardContent>
      </Card>

      {/* -------------------------
            INPUT FIELDS
         ------------------------- */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            Inputs
          </Typography>

          <Stack spacing={3} sx={{ mt: 2, maxWidth: 400 }}>
            <TextField label="Default Input" />
            <TextField label="Focused Example" />
            <TextField label="Error Example" error helperText="Invalid value" />
          </Stack>
        </CardContent>
      </Card>

      {/* -------------------------
            CARDS / ALERTS / CHIPS
         ------------------------- */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            Cards / Alerts / Chips
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="info">Info alert</Alert>
            <Alert severity="success">Success alert</Alert>

            <Stack direction="row" spacing={1}>
              <Chip label="Default" />
              <Chip label="Primary" color="primary" />
              <Chip label="Secondary" color="secondary" />
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                <InventoryIcon sx={{ color: theme.palette.secondary.contrastText }} />
              </Avatar>

              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Lalitha Gas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agency
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* -------------------------
            APP BAR + SIDEBAR PREVIEW
         ------------------------- */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>
            Header / Sidebar preview
          </Typography>

          <Box sx={{ mt: 2 }}>
            <AppBar position="static" color="transparent" elevation={0}>
              <Toolbar
                sx={{
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 1,
                }}
              >
                <Typography fontWeight={700}>Lalitha Gas Agency</Typography>
              </Toolbar>
            </AppBar>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Box sx={{ width: 60, height: 60, bgcolor: theme.palette.primary.main }} />
              <Box sx={{ flex: 1, height: 60, bgcolor: theme.palette.background.paper }} />
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
