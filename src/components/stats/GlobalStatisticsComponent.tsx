import paperStyles from '../../styles/Paper.module.css';
import commonStyles from '../../styles/Common.module.css';
import { Box, Button, Paper, TextField, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { formatDateToYYYYMMDD, toFixedNumber, toLocalDate } from '../../utils.ts';
import { StatisticsApiClient } from '../../api/statsApiClient.ts';
import type { MaterialStatsDto } from '../../dto/stats.ts';
import UpdateBalanceModal from '../modal/stats/UpdateBalanceModal.tsx';
import { showToast } from '../common/Toast.tsx';

export interface GlobalStatisticsProps {
    onUpdate: () => void;
}

const GlobalStatisticsComponent = ({ onUpdate }: GlobalStatisticsProps) => {
    const theme = useTheme();

    const [date, setDate] = useState<Date>(new Date());
    const [globalStats, setGlobalStats] = useState<MaterialStatsDto[]>([]);
    const [statsWithoutCustomerData, setStatsWithoutCustomerData] = useState<MaterialStatsDto[]>(
        [],
    );

    const [isUpdateBalanceModalOpen, setIsUpdateBalanceModalOpen] = useState<boolean>(false);

    useEffect(() => {
        StatisticsApiClient.getStatsForDate(date)
            .then((data) => {
                if (!data) {
                    showToast(`Не вдалось завантажити дані за ${toLocalDate(date)}`, 'error');
                } else {
                    setGlobalStats(data.globalStats);
                    setStatsWithoutCustomerData(data.statsWithoutCustomerData);
                }
            })
            .catch((err) => {
                showToast(`Не вдалось завантажити дані за ${toLocalDate(date)}`, 'error');
                console.log(err);
            });
    }, [date]);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            style={{ gap: theme.spacing(4), borderRadius: '10px' }}
        >
            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                width="100%"
                sx={{
                    padding: { xs: 2, sm: 3 },
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    flex={1}
                    minWidth={0}
                    sx={{ textAlign: { xs: 'center', md: 'left' } }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 600,
                            lineHeight: 1.2,
                            marginBottom: 0.5,
                            wordBreak: 'break-word',
                        }}
                    >
                        Статистика
                    </Typography>
                </Box>

                <Box
                    display="flex"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    gap={{ xs: 2, sm: 1.5, md: 2 }}
                    width={{ xs: '100%', md: 'auto' }}
                    minWidth={{ xs: 'auto', sm: 'fit-content' }}
                >
                    <TextField
                        type="date"
                        fullWidth
                        value={date && formatDateToYYYYMMDD(date)}
                        onChange={(e) => setDate(new Date(e.target.value))}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                            mb: theme.spacing(2),
                        }}
                        label="Станом на"
                    />
                </Box>
            </Box>

            <Box width="100%" display="flex" justifyContent="space-between">
                <Paper
                    className={paperStyles.paper}
                    sx={{ width: '49%', boxShadow: 4, p: theme.spacing(8) }}
                >
                    <Typography variant="h5" pb={theme.spacing(2)}>
                        Металу в сховищі (загальне)
                    </Typography>
                    {globalStats.map((stat) => (
                        <Typography key={stat.materialId} variant="body1">
                            {stat.materialName}:{' '}
                            <span style={{ fontWeight: 900 }}>
                                {toFixedNumber(stat.totalBalance, stat.materialId ? 3 : 2)}{' '}
                                {stat.materialId ? 'г' : 'грн'}
                            </span>
                        </Typography>
                    ))}
                </Paper>

                <Paper
                    className={paperStyles.paper}
                    sx={{
                        width: '49%',
                        boxShadow: 4,
                        p: theme.spacing(8),
                    }}
                >
                    <Typography variant="h5" pb={theme.spacing(2)}>
                        Металу в сховищі (без клієнтського)
                    </Typography>
                    {statsWithoutCustomerData.map((stat) => (
                        <Typography key={stat.materialId} variant="body1">
                            {stat.materialName}:{' '}
                            <span style={{ fontWeight: 900 }}>
                                {toFixedNumber(stat.totalBalance, stat.materialId ? 3 : 2)}{' '}
                                {stat.materialId ? 'г' : 'грн'}
                            </span>
                        </Typography>
                    ))}
                </Paper>
            </Box>

            <Button
                variant="contained"
                onClick={() => setIsUpdateBalanceModalOpen(true)}
                sx={{ alignSelf: 'flex-end', mb: theme.spacing(8) }}
            >
                Оновити баланс
            </Button>

            {isUpdateBalanceModalOpen && (
                <UpdateBalanceModal
                    onUpdate={onUpdate}
                    isOpen={isUpdateBalanceModalOpen}
                    handleClose={() => {
                        setIsUpdateBalanceModalOpen(false);
                        onUpdate();
                    }}
                />
            )}
        </Paper>
    );
};

export default GlobalStatisticsComponent;
