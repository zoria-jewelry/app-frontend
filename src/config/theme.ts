import { createTheme } from '@mui/material';

export const applicationTheme = createTheme({
    typography: {
        body1: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
        },
        body2: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 'lighter',
        },
        button: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: '500',
        },
        h1: {
            fontFamily: 'Playfair Display, serif',
            fontSize: 24,
            fontWeight: 700,
        },
        h2: {
            fontFamily: 'Playfair Display, serif',
            fontSize: 22,
            fontWeight: 600,
        },
        h3: {
            fontFamily: 'Playfair Display, serif',
            fontSize: 20,
            fontWeight: 500,
        },
        h4: {
            fontFamily: 'Playfair Display, serif',
            fontSize: 18,
            fontWeight: 400,
        },
        h5: {
            fontFamily: 'Playfair Display, serif',
            fontSize: 16,
            fontWeight: 400,
        },
    },
    palette: {
        primary: {
            main: '#ffcf23',
            contrastText: '#1d1d1d',
        },
        secondary: {
            main: '#d9d9d9',
            contrastText: '#000',
        },
        text: {
            primary: '#1d1d1d',
            secondary: '#333333',
        },
        error: {
            main: '#ff6e6e',
            contrastText: '#fff',
        },
        warning: {
            main: '#ffc985',
            contrastText: '#000',
        },
        // info: {}, // TODO: for toast messages?
        success: {
            main: '#c5f0cf',
        },
        background: {
            default: '#f0f2f5',
            paper: '#fff',
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
    components: {
        MuiButton: {
            defaultProps: {
                size: 'medium',
            },
        },
        MuiPaper: {
            defaultProps: {
                square: false,
            },
        },
    },
    spacing: (factor: number) => `${0.25 * factor}rem`,
});
