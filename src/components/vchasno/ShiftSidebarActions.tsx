import Box from '@mui/material/Box';
import { Button, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { VchasnoApiClient } from '../../api/vchasnoApiClient.ts';

const ShiftSidebarActions = () => {
    const [isShiftOpen, setIsShiftOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchShiftState = useCallback(() => {
        VchasnoApiClient.isShiftActive()
            .then(setIsShiftOpen)
            .catch((err) => {
                // TODO: add toast
                console.log(err);
            });
    }, [isShiftOpen]);

    const handleApiError = (errorText?: string) => {
        if (errorText && errorText.trim() !== '') {
            // TODO: add toast
            console.error('API reported error:', errorText);
        }
    };

    const onStartShift = async () => {
        setLoading(true);
        try {
            const response = await VchasnoApiClient.startShift();
            handleApiError(response?.errortxt);
            fetchShiftState();
        } catch (e) {
            console.error('Failed to open shift:', e);
        } finally {
            setLoading(false);
        }
    };

    const onEndShift = async () => {
        setLoading(true);
        try {
            const response = await VchasnoApiClient.endShift();
            handleApiError(response?.errortxt);
            fetchShiftState();
        } catch (e) {
            console.error('Failed to close shift:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShiftState();
    }, [isShiftOpen]);

    return (
        <Box
            sx={{
                p: 2,
                borderTop: '1px solid #eee',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
            }}
        >
            {!isShiftOpen && (
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={onStartShift}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                    Відкрити зміну
                </Button>
            )}
            {isShiftOpen && (
                <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={onEndShift}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                    Закрити зміну
                </Button>
            )}
        </Box>
    );
};

export default ShiftSidebarActions;
