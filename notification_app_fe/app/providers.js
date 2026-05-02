"use client";

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f4c5c'
    },
    secondary: {
      main: '#c97b63'
    },
    background: {
      default: '#f7f7f5',
      paper: '#fffdf8'
    },
    text: {
      primary: '#151515',
      secondary: '#5f5a55'
    }
  },
  shape: {
    borderRadius: 18
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.03em'
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.025em'
    },
    h5: {
      fontWeight: 700
    },
    button: {
      textTransform: 'none',
      fontWeight: 700
    }
  }
});

export default function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
