import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Same visual height for small outlined fields in order modals. Global theme sets
 * minHeight 2rem on sizeSmall (configs/theme.ts), but Autocomplete adds extra root
 * padding unless we normalize it.
 */
export const orderFormOutlinedUniformSx: SxProps<Theme> = {
    '& .MuiOutlinedInput-root': {
        minHeight: '2rem',
        maxHeight: '2rem',
        boxSizing: 'border-box',
        py: 0,
        display: 'flex',
        alignItems: 'center',
    },
    '& .MuiOutlinedInput-input': {
        py: '0.375rem',
        boxSizing: 'border-box',
    },
    '& input.MuiAutocomplete-input': {
        py: '0.375rem !important',
        boxSizing: 'border-box',
    },
};

/**
 * Outlined `Select` — its root is the OutlinedInput, so this mirrors
 * `orderFormOutlinedUniformSx` on TextField (nested `.MuiOutlinedInput-root`).
 */
export const orderFormOutlinedSelectUniformSx: SxProps<Theme> = {
    minHeight: '2rem',
    maxHeight: '2rem',
    boxSizing: 'border-box',
    py: 0,
    display: 'flex',
    alignItems: 'center',
    '& .MuiSelect-select': {
        py: '0.375rem',
        boxSizing: 'border-box',
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
    },
};
