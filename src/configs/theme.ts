import { createTheme, type Theme } from '@mui/material';

export const applicationTheme: Theme = createTheme({
    typography: {
        body1: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 20,
            fontWeight: 'normal',
            color: '#1d1d1d',
        },
        body2: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 18,
            fontWeight: 'lighter',
            color: '#333333',
        },
        button: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: 900,
        },
        h1: {
            fontFamily: 'Merriweather, serif',
            fontSize: 40,
            fontWeight: 700,
        },
        h2: {
            fontFamily: 'Merriweather, serif',
            fontSize: 32,
            fontWeight: 600,
        },
        h3: {
            fontFamily: 'Merriweather, serif',
            fontSize: 28,
            fontWeight: 500,
        },
        h4: {
            fontFamily: 'Merriweather, serif',
            fontSize: 24,
            fontWeight: 400,
        },
        h5: {
            fontFamily: 'Merriweather, serif',
            fontSize: 20,
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
            light: '#ffd54f',
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
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    height: '3rem',
                    paddingLeft: '2rem',
                    paddingRight: '2rem',
                },
            },
            defaultProps: {
                size: 'medium',
            },
        },
        MuiPaper: {
            defaultProps: {
                square: false,
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#3e4e50',
                    color: '#fff',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#b7cfd2',
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                },
            },
        },
        MuiTablePagination: {
            styleOverrides: {
                root: {
                    color: '#1d1d1d',
                    fontSize: 18,
                },
            },
        },
    },
    spacing: (factor: number) => `${0.25 * factor}rem`,
});
