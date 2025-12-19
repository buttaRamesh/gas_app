import { Paper, Box, Typography, IconButton } from "@mui/material";
import type { DeliveryPerson } from "../types";
import {
  Route as RouteIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  LocalShipping as LocalShippingIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

interface DeliveryPersonCardProps {
  deliveryPerson: DeliveryPerson;
  onActionClick: (event: React.MouseEvent<HTMLElement>, deliveryPersonId: number) => void;
}

export function DeliveryPersonCard({ deliveryPerson, onActionClick }: DeliveryPersonCardProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isAssigned = deliveryPerson.assigned_routes_count > 0;
  const mobileNumber = deliveryPerson.person.contacts?.[0]?.mobile_number;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalShippingIcon sx={{ color: 'primary.main', fontSize: 18 }} />
          <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Delivery Partner
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isAssigned && <StarIcon sx={{ color: 'warning.main', fontSize: 18 }} />}
          <IconButton size="small" onClick={(e) => onActionClick(e, deliveryPerson.id)} sx={{ ml: 0.5 }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isAssigned ? 'success.main' : 'warning.main',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.25rem',
            boxShadow: `0 4px 12px ${alpha(isAssigned ? theme.palette.success.main : theme.palette.warning.main, 0.4)}`,
          }}
        >
          {(deliveryPerson.person.first_name || deliveryPerson.person.full_name || '?').charAt(0)}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            {`${deliveryPerson.person.first_name} ${deliveryPerson.person.last_name}`.trim() || deliveryPerson.person.full_name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <PhoneIcon sx={{ fontSize: 14 }} />
            <Typography variant="body2">{mobileNumber}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats - Clickable */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/routes/?delivery_person=${deliveryPerson.id}`);
          }}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              transform: 'scale(1.02)',
            },
          }}
        >
          <RouteIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color="primary.main" lineHeight={1}>
              {deliveryPerson.assigned_routes_count}
            </Typography>
            <Typography variant="caption" color="text.secondary">Routes</Typography>
          </Box>
        </Box>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/consumers/list?delivery_person=${deliveryPerson.id}`);
          }}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.secondary.main, 0.08),
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.secondary.main, 0.15),
              transform: 'scale(1.02)',
            },
          }}
        >
          <PeopleIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color="secondary.main" lineHeight={1}>
              {deliveryPerson.total_consumers.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">Consumers</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
