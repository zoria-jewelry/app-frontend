import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Shared table cell sizing for current + expired price list tables on `/pricing`.
 * minHeight matches rows that include a medium IconButton (≈48px) plus padding.
 */
export const priceListTableCellSx: SxProps<Theme> = {
    py: 3,
    verticalAlign: 'middle',
    minHeight: 80,
};
