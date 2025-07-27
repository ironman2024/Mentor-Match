import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import theme from './theme';
import { CircularProgress, Box } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import { SocketProvider } from './contexts/SocketContext';
import { SnackbarProvider } from 'notistack';
import { AIProvider } from './contexts/AIContext';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <AIProvider>
            <SocketProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ErrorBoundary>
                  <CssBaseline />
                  <Suspense fallback={
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                      <CircularProgress />
                    </Box>
                  }>
                    <AppRoutes />
                  </Suspense>
                </ErrorBoundary>
              </BrowserRouter>
            </SocketProvider>
          </AIProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
