import { createTheme, type Theme } from '@mui/material';

export const applicationTheme: Theme = createTheme({
    typography: {
        body1: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(1rem, 1.2vw, 1.25rem)',
            fontWeight: 'normal',
            color: '#1d1d1d',
            lineHeight: 1.4,
        },
        body2: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.95rem, 1.05vw, 1.125rem)',
            fontWeight: 'lighter',
            color: '#333333',
            lineHeight: 1.4,
        },
        button: {
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.78rem, 0.75vw, 0.92rem)',
            fontWeight: 900,
            lineHeight: 1.2,
        },
        h1: {
            fontFamily: 'Merriweather, serif',
            fontSize: 'clamp(1.9rem, 2.6vw, 2.5rem)',
            fontWeight: 700,
        },
        h2: {
            fontFamily: 'Merriweather, serif',
            fontSize: 'clamp(1.6rem, 2.2vw, 2rem)',
            fontWeight: 600,
        },
        h3: {
            fontFamily: 'Merriweather, serif',
            fontSize: 'clamp(1.35rem, 1.8vw, 1.75rem)',
            fontWeight: 500,
        },
        h4: {
            fontFamily: 'Merriweather, serif',
            fontSize: 'clamp(1.2rem, 1.5vw, 1.5rem)',
            fontWeight: 400,
        },
        h5: {
            fontFamily: 'Merriweather, serif',
            fontSize: 'clamp(1.05rem, 1.2vw, 1.25rem)',
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
        success: {
            main: '#c5f0cf',
        },
        background: {
            default: '#fff',
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
                    height: 'auto !important',
                    minHeight: 'clamp(1.9rem, 4vh, 2.3rem)',
                    paddingLeft: 'clamp(0.6rem, 1.5vw, 1.2rem)',
                    paddingRight: 'clamp(0.6rem, 1.5vw, 1.2rem)',
                    whiteSpace: 'nowrap',
                },
                sizeLarge: {
                    height: 'auto !important',
                    minHeight: 'clamp(2rem, 4.2vh, 2.4rem)',
                    paddingLeft: 'clamp(0.75rem, 1.8vw, 1.3rem)',
                    paddingRight: 'clamp(0.75rem, 1.8vw, 1.3rem)',
                },
                sizeMedium: {
                    minHeight: 'clamp(1.9rem, 4vh, 2.3rem)',
                },
                sizeSmall: {
                    minHeight: 'clamp(1.75rem, 3.6vh, 2.05rem)',
                    paddingLeft: 'clamp(0.5rem, 1.2vw, 0.9rem)',
                    paddingRight: 'clamp(0.5rem, 1.2vw, 0.9rem)',
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
        MuiDialog: {
            defaultProps: {
                fullWidth: true,
                maxWidth: false,
            },
            styleOverrides: {
                root: {
                    '@media (max-width:900px), (max-height:700px)': {
                        '& .MuiDialog-container': {
                            padding: '0 !important',
                            alignItems: 'stretch',
                        },
                        '& .MuiDialog-paper': {
                            margin: '0 !important',
                            width: '100vw !important',
                            maxWidth: '100vw !important',
                            minWidth: '100vw !important',
                            height: '100vh !important',
                            maxHeight: '100vh !important',
                            minHeight: '100vh !important',
                            borderRadius: '0 !important',
                        },
                    },
                },
                paper: {
                    width: 'min(640px, calc(100vw - 6rem))',
                    maxWidth: 'none',
                    maxHeight: 'calc(100vh - 2rem)',
                    '@media (max-width:900px)': {
                        width: 'calc(100vw - 1rem)',
                        maxHeight: 'calc(100vh - 1rem)',
                    },
                },
                paperScrollPaper: {
                    margin: '1rem',
                    '@media (max-width:900px)': {
                        margin: '0.5rem',
                    },
                },
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
        MuiTablePagination: {
            styleOverrides: {
                root: {
                    color: '#1d1d1d',
                    fontSize: 'clamp(0.98rem, 1.12vw, 1.25rem)',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 0,
                    '& .MuiTablePagination-toolbar': {
                        justifyContent: 'flex-end',
                        width: '100%',
                        paddingLeft: 0,
                        paddingRight: 0,
                    },
                    '& .MuiTablePagination-spacer': {
                        display: 'none',
                    },
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    width: '100%',
                    alignSelf: 'stretch',
                    overflowX: 'auto',
                    overflowY: 'auto',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    border: '1px solid rgba(224, 224, 224, 1)',
                    padding: '2px 6px',
                    fontSize: 'clamp(1rem, 1.1vw, 1.125rem)',
                },
                head: {
                    padding: '4px 6px',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                root: {
                    '& .MuiListItem-root:hover': {
                        ':hover': {
                            backgroundColor: '#b7cfd2',
                        },
                    },
                },
            },
        },
        MuiFormHelperText: {
            defaultProps: {
                margin: 'dense',
            },
            styleOverrides: {
                root: {
                    fontSize: 'clamp(0.75rem, 0.9vw, 1rem)',
                    marginTop: 0,
                    marginBottom: 0,
                    minHeight: 0,
                    lineHeight: 1.35,
                    // No reserved space when there is no validation message
                    '&:empty': {
                        display: 'none',
                        margin: 0,
                        padding: 0,
                        height: 0,
                        minHeight: 0,
                    },
                },
            },
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    fontSize: 'clamp(0.875rem, 1vw, 1.125rem)',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small',
                margin: 'dense',
                variant: 'outlined',
            },
        },
        MuiFormControl: {
            defaultProps: {
                margin: 'dense',
                size: 'small',
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    '&.MuiInputBase-sizeSmall': {
                        minHeight: '2rem',
                    },
                },
                input: {
                    '&.MuiInputBase-inputSizeSmall': {
                        paddingTop: '0.375rem',
                        paddingBottom: '0.375rem',
                    },
                },
            },
        },
        MuiInputLabel: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiSelect: {
            defaultProps: {
                size: 'small',
            },
        },
    },
    spacing: (factor: number) => `${0.25 * factor}rem`,
});
