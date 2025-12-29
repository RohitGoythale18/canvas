'use client';

import React, { useState } from 'react';
import { Container, Paper, Tabs, Tab, Box } from '@mui/material';
import LoginForm from '../components/forms/LoginForm';
import RegisterForm from '../components/forms/RegisterForm';

export default function LoginPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="auth tabs">
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 3 }}>
          {tabValue === 0 && <LoginForm />}
          {tabValue === 1 && <RegisterForm />}
        </Box>
      </Paper>
    </Container>
  );
}
