import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    FormControl,
    FormHelperText,
    FormLabel,
    IconButton,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { type OrderBriefInfoDto, paymentTypes } from '../../../dto/orders.ts';
import { VchasnoApiClient } from '../../../api/vchasnoApiClient.ts';
import { OrdersApiClient } from '../../../api/ordersApiClient.ts';
import { showToast } from '../../common/Toast.tsx';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '620px',
        padding: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(8),
        paddingTop: 0,
    },
}));

export interface SelectReceiptTypeComponentProps {
    isOpen: boolean;
    handleClose: () => void;
    order: OrderBriefInfoDto;
}

const SelectReceiptTypeComponent = (props: SelectReceiptTypeComponentProps) => {
    const theme = useTheme();

    const [type, setType] = useState<number | ''>('');
    const [error, setError] = useState<string | undefined>();

    const [loading, setLoading] = useState<boolean>(false);

    const handleCreateReceipt = async () => {
        setLoading(true);
        if (type === '') {
            setError('Оберіть тип оплати');
            return;
        }

        const paidMoneyNormalized: number = props.order.paidMoney ?? 0;
        if (paidMoneyNormalized > 0) {
            try {
                const receiptUrl: string = await VchasnoApiClient.checkout(
                    paidMoneyNormalized,
                    type,
                );
                await OrdersApiClient.addReceipt(props.order.id, receiptUrl);
                window.open(receiptUrl, '_blank');
            } catch (error) {
                showToast(
                    `Не вдалось отримати чек до замовлення – ${JSON.stringify(error)}`,
                    'error',
                );
                console.log(error);
            }
            setLoading(false);
            props.handleClose();
            return;
        }
    };

    return (
        <BootstrapDialog open={props.isOpen} onClose={props.handleClose}>
            <IconButton
                aria-label="close"
                onClick={props.handleClose}
                size="large"
                sx={(theme) => ({
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon />
            </IconButton>

            <Typography variant="h5" textAlign="center" gutterBottom>
                Формування чеку для замовлення №{props.order.id}
            </Typography>

            <FormControl fullWidth sx={{ mt: theme.spacing(4) }}>
                <FormLabel htmlFor="payment-type-label">Тип оплати</FormLabel>
                <Select
                    labelId="payment-type-label"
                    value={type}
                    onChange={(e) => setType(Number(e.target.value))}
                >
                    {paymentTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText error={true} sx={{ minHeight: '30px' }}>
                    {error}
                </FormHelperText>
            </FormControl>

            <Box
                display="flex"
                justifyContent="space-between"
                mt={4}
                sx={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'center',
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateReceipt}
                    disabled={type === '' || loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                    Створити чек
                </Button>
            </Box>
        </BootstrapDialog>
    );
};

export default SelectReceiptTypeComponent;
