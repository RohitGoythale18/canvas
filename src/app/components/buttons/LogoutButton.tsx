'use client';

import { Button } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <Button
      variant="outlined"
      color="secondary"
      onClick={logout}
      sx={{
        color: 'white',
        borderColor: 'white',
        '&:hover': {
          borderColor: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
