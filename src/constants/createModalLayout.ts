import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Default width for simple “create” dialogs (excludes order creation, which has its own layout).
 */
export const CREATE_MODAL_PAPER_MAX = 'min(520px, calc(100vw - 2rem))';

/** Flush with full-width outlined fields; MUI `FormHelperText` defaults add a left indent. */
export const FORM_HELPER_TEXT_ALIGNED_SX: SxProps<Theme> = {
    margin: 0,
    marginLeft: 0,
    paddingLeft: 0,
    marginTop: 0.5,
};

/** Narrow forms: edit customer, employee, material, work unit, balances, etc. */
export const EDIT_MODAL_PAPER_MAX = 'min(480px, calc(100vw - 2rem))';

/** Create / edit product: two columns (form + crop preview) */
export const PRODUCT_CREATE_EDIT_MODAL_PAPER_MAX = 'min(960px, calc(100vw - 2rem))';

/** Archive list tables: readable but not full-viewport width */
export const ARCHIVE_TABLE_MODAL_PAPER_MAX = 'min(880px, calc(100vw - 2rem))';

/** “Прийняття” / return metal modal */
export const RETURN_METAL_MODAL_PAPER_MAX = 'min(420px, calc(100vw - 2rem))';

/** Archive / unarchive / destructive confirm dialogs (shared `DialogComponent`) */
export const CONFIRMATION_DIALOG_PAPER_MAX = 'min(380px, calc(100vw - 2rem))';

/** Customer page: audit / balance operations history — wider than `maxWidth="xl"` */
export const CUSTOMER_BALANCE_HISTORY_DIALOG_MAX = 'min(1920px, calc(100vw - 2rem))';
