import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { applicationTheme } from './configs/theme.ts';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={applicationTheme}>
            <CssBaseline />
            <ToastProvider />
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);
