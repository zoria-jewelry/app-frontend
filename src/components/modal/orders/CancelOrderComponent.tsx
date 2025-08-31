import {
    Box,
    Button,
    Dialog,
    FormControl,
    FormHelperText,
    IconButton,
    TextField,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { OrdersApiClient } from '../../../api/ordersApiClient.ts';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '420px',
        padding: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(8),
        paddingTop: 0,
    },
}));

export interface CancelOrderComponentProps {
    isOpen: boolean;
    orderId: number;
    handleClose: () => void;
}

const CancelOrderComponent = ({ isOpen, orderId, handleClose }: CancelOrderComponentProps) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleCancelOrder = async () => {
        if (!reason.trim()) {
            setError('Введіть причину скасування');
            return;
        }
        try {
            await OrdersApiClient.cancelOrder(orderId, reason);
            handleClose();
        } catch (err) {
            console.error('Failed to cancel order:', err);
            setError('Не вдалося скасувати замовлення');
        }
    };

    return (
        <BootstrapDialog open={isOpen} onClose={handleClose}>
            <IconButton
                aria-label="close"
                onClick={handleClose}
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
                Скасування замовлення №{orderId}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                Вкажіть причину, чому ви хочете скасувати це замовлення.
            </Typography>

            <FormControl fullWidth margin="normal">
                <TextField
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        setError('');
                    }}
                    multiline
                    error={!!error}
                    minRows={3}
                    fullWidth
                />
                <FormHelperText error sx={{ minHeight: '2em', margin: 0 }}>
                    {error ?? ''}
                </FormHelperText>
            </FormControl>

            <Box
                display="flex"
                justifyContent="space-between"
                mt={4}
                sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                }}
            >
                <Button variant="contained" color="secondary" onClick={handleClose}>
                    Відмінити
                </Button>
                <Button variant="contained" color="error" onClick={handleCancelOrder}>
                    Скасувати замовлення
                </Button>
            </Box>
        </BootstrapDialog>
    );
};

export default CancelOrderComponent;
