import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { applicationTheme } from './config/theme.ts';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={applicationTheme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </StrictMode>,
);
