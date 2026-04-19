import paperStyles from '../../styles/Paper.module.css';
import commonStyles from '../../styles/Common.module.css';
import { Box, Button, Paper, TextField, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { formatDateToYYYYMMDD, toFixedNumber, toLocalDate } from '../../utils.ts';
import { StatisticsApiClient } from '../../api/statsApiClient.ts';
import type { MaterialStatsDto } from '../../dto/stats.ts';
import UpdateBalanceModal from '../modal/stats/UpdateBalanceModal.tsx';
import { showToast } from '../common/Toast.tsx';

export interface GlobalStatisticsProps {
    onUpdate: () => void;
    refresher?: number;
}

function materialStatsKey(m: MaterialStatsDto): string {
    return m.materialId === null ? '__currency__' : String(m.materialId);
}

/** Клієнтська частина: загалом мінус без клієнтських (по кожному матеріалу). */
function clientOnlyMaterialStats(
    globalStats: MaterialStatsDto[],
    withoutCustomer: MaterialStatsDto[],
): MaterialStatsDto[] {
    const withoutByKey = new Map<string, number>();
    for (const row of withoutCustomer) {
        withoutByKey.set(materialStatsKey(row), row.totalBalance);
    }
    return globalStats.map((g) => {
        const sub = withoutByKey.get(materialStatsKey(g)) ?? 0;
        return {
            ...g,
            totalBalance: g.totalBalance - sub,
        };
    });
}

const GlobalStatisticsComponent = ({ onUpdate, refresher }: GlobalStatisticsProps) => {
    const theme = useTheme();

    const baseDate: Date = new Date();
    baseDate.setSeconds(0, 0);
    const [date, setDate] = useState<Date>(baseDate);
    const [globalStats, setGlobalStats] = useState<MaterialStatsDto[]>([]);
    const [statsWithoutCustomerData, setStatsWithoutCustomerData] = useState<MaterialStatsDto[]>(
        [],
    );
    const [employeesStats, setEmployeesStats] = useState<MaterialStatsDto[]>([]);

    const [isUpdateBalanceModalOpen, setIsUpdateBalanceModalOpen] = useState<boolean>(false);

    const statsClientMaterialsOnly = useMemo(
        () => clientOnlyMaterialStats(globalStats, statsWithoutCustomerData),
        [globalStats, statsWithoutCustomerData],
    );

    useEffect(() => {
        StatisticsApiClient.getStatsForDate(date)
            .then((data) => {
                if (!data) {
                    showToast(`Не вдалось завантажити дані за ${toLocalDate(date)}`, 'error');
                } else {
                    setGlobalStats(data.globalStats);
                    setStatsWithoutCustomerData(data.statsWithoutCustomerData);
                    setEmployeesStats(data.employeesStats || []);
                }
            })
            .catch((err) => {
                showToast(`Не вдалось завантажити дані за ${toLocalDate(date)}`, 'error');
                console.log(err);
            });
    }, [date, refresher]);

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
                    flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent={{ xs: 'stretch', sm: 'flex-end' }}
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
                            mb: 0,
                        }}
                        label="Станом на"
                    />
                </Box>
            </Box>

            <Box
                width="100%"
                display="grid"
                gridTemplateColumns={{
                    xs: '1fr',
                    md: 'repeat(2, minmax(0, 1fr))',
                    xl: 'repeat(4, minmax(0, 1fr))',
                }}
                gap={theme.spacing(4)}
            >
                <Paper
                    sx={{
                        width: '100%',
                        p: theme.spacing(6),
                        backgroundColor: '#fff',
                        boxShadow: 3,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h5" pb={theme.spacing(2)}>
                        Матеріалів у сховищі (загалом)
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
                    sx={{
                        width: '100%',
                        p: theme.spacing(6),
                        backgroundColor: '#fff',
                        boxShadow: 3,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h5" pb={theme.spacing(2)}>
                        Матеріалів у сховищі (без клієнтських)
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

                <Paper
                    sx={{
                        width: '100%',
                        p: theme.spacing(6),
                        backgroundColor: '#fff',
                        boxShadow: 3,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h5" pb={theme.spacing(2)}>
                        Матеріалів у сховищі (клієнтські)
                    </Typography>
                    {statsClientMaterialsOnly.map((stat) => (
                        <Box
                            key={stat.materialId}
                            sx={{ mb: Number(stat.totalDebt) > 0 ? 0.5 : 0 }}
                        >
                            <Typography variant="body1">
                                {stat.materialName}:{' '}
                                <span style={{ fontWeight: 900 }}>
                                    {toFixedNumber(stat.totalBalance, stat.materialId ? 3 : 2)}{' '}
                                    {stat.materialId ? 'г' : 'грн'}
                                </span>
                            </Typography>
                            {Number(stat.totalDebt) > 0 && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        color: theme.palette.error.main,
                                        display: 'block',
                                        ml: 0,
                                        mt: 0.25,
                                    }}
                                >
                                    Загальний борг всіх клієнтів:{' '}
                                    {toFixedNumber(stat.totalDebt, stat.materialId ? 3 : 2)}{' '}
                                    {stat.materialId ? 'г' : 'грн'}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Paper>

                <Paper
                    sx={{
                        width: '100%',
                        p: theme.spacing(6),
                        backgroundColor: '#fff',
                        boxShadow: 3,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h5" pb={theme.spacing(2)}>
                        На руках у ювелірів
                    </Typography>
                    {employeesStats.map((stat) => (
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
                    }}
                />
            )}
        </Paper>
    );
};

export default GlobalStatisticsComponent;
