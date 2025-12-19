import { Card, CardContent } from '@mui/material';
import { ReactNode } from 'react';

interface DetailCardProps {
  children: ReactNode;
}

export function DetailCard({ children }: DetailCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: '1px solid rgba(102, 126, 234, 0.15)',
        boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  );
}
