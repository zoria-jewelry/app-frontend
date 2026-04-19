import Box from '@mui/material/Box';
import { Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useCallback, useEffect, useState } from 'react';
import { VchasnoApiClient } from '../../api/vchasnoApiClient.ts';
import { showToast } from '../common/Toast.tsx';
import { SIDEBAR_ICON_FONT_PX } from '../../constants/appShell.ts';

export interface ShiftSidebarActionsProps {
    /** Icon-only compact controls (narrow sidebar rail) */
    collapsed?: boolean;
}

const ShiftSidebarActions = ({ collapsed = false }: ShiftSidebarActionsProps) => {
    const [isShiftOpen, setIsShiftOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchShiftState = useCallback(() => {
        VchasnoApiClient.isShiftActive()
            .then(setIsShiftOpen)
            .catch((err) => {
                showToast(
                    'Не вдалось визначити, чи зміна активна. Перевірте, чи запущений застосунок Vchasno Kasa, або зверніться до адміністратора',
                    'error',
                );
                console.log(err);
            });
    }, []);

    const handleApiError = (errorText?: string) => {
        if (errorText && errorText.trim() !== '') {
            showToast(`Помилка від Vchasno Kasa – ${errorText}`, 'error');
            console.error('API reported error:', errorText);
        }
    };

    const onStartShift = async () => {
        setLoading(true);
        try {
            const response = await VchasnoApiClient.startShift();
            showToast('Зміна була успішно розпочата');
            handleApiError(response?.errortxt);
            fetchShiftState();
        } catch (e) {
            showToast(
                `Не вдалось почати зміну. Перевірте, чи запущений застосунок Vchasno Kasa, або зверніться до адміністратора`,
                'error',
            );
            console.error('Failed to open shift:', e);
        } finally {
            setLoading(false);
        }
    };

    const onEndShift = async () => {
        setLoading(true);
        try {
            const response = await VchasnoApiClient.endShift();
            showToast('Зміна була успішно завершена');
            handleApiError(response?.errortxt);
            fetchShiftState();
        } catch (e) {
            showToast(
                `Не вдалось закрити зміну. Перевірте, чи запущений застосунок Vchasno Kasa, або зверніться до адміністратора`,
                'error',
            );
            console.error('Failed to close shift:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShiftState();
    }, [fetchShiftState]);

    if (collapsed) {
        return (
            <Box
                sx={{
                    py: 1,
                    px: 0.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                }}
            >
                {!isShiftOpen && (
                    <Tooltip title="Відкрити зміну" placement="right" arrow>
                        <span>
                            <IconButton
                                color="primary"
                                size="medium"
                                onClick={onStartShift}
                                disabled={loading}
                                aria-label="Відкрити зміну"
                                sx={{
                                    '& .MuiSvgIcon-root': { fontSize: SIDEBAR_ICON_FONT_PX },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={SIDEBAR_ICON_FONT_PX}
                                        color="inherit"
                                    />
                                ) : (
                                    <PlayArrowIcon />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
                {isShiftOpen && (
                    <Tooltip title="Закрити зміну" placement="right" arrow>
                        <span>
                            <IconButton
                                color="error"
                                size="medium"
                                onClick={onEndShift}
                                disabled={loading}
                                aria-label="Закрити зміну"
                                sx={{
                                    '& .MuiSvgIcon-root': { fontSize: SIDEBAR_ICON_FONT_PX },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={SIDEBAR_ICON_FONT_PX}
                                        color="inherit"
                                    />
                                ) : (
                                    <StopIcon />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
            </Box>
        );
    }

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
