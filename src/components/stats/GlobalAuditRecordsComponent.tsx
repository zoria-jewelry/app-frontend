import { Box, Paper, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import paperStyles from '../../styles/Paper.module.css';
import commonStyles from '../../styles/Common.module.css';
import {
    formatDateToYYYYMMDD,
    getCurrentMonthRange,
    toFixedNumber,
    toLocalDateTime,
} from '../../utils.ts';
import { useEffect, useState } from 'react';
import type { AuditRecord } from '../../dto/audit.ts';
import { StatisticsApiClient } from '../../api/statsApiClient.ts';

export interface GlobalAuditRecordsComponentProps {
    refresher: number;
}

const GlobalAuditRecordsComponent = ({ refresher }: GlobalAuditRecordsComponentProps) => {
    const theme = useTheme();

    const { start, end } = getCurrentMonthRange();

    const [fromDate, setFromDate] = useState<Date>(start);
    const [toDate, setToDate] = useState<Date>(end);

    const [records, setRecords] = useState<AuditRecord[]>([]);

    const [error, setError] = useState<boolean>(false);

    const isMd = useMediaQuery(theme.breakpoints.down('md')); // < 900px

    useEffect(() => {
        if (toDate < fromDate) {
            setError(true);
            return;
        }
        setError(false);

        StatisticsApiClient.getAuditForPeriod(fromDate, toDate)
            .then((data) => setRecords(data.entries))
            .catch((err) => {
                // TODO: add toast
                console.log(err);
            });
    }, [fromDate, toDate, refresher]);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            sx={{
                gap: theme.spacing(4),
                borderRadius: '10px',
                maxHeight: '80vh',
                my: theme.spacing(4),
            }}
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
                        Історія змін
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
                        error={error}
                        value={formatDateToYYYYMMDD(fromDate)}
                        onChange={(e) => setFromDate(new Date(e.target.value))}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                            mb: theme.spacing(2),
                        }}
                        label="Від"
                    />

                    <TextField
                        type="date"
                        fullWidth
                        error={error}
                        value={formatDateToYYYYMMDD(toDate)}
                        onChange={(e) => setToDate(new Date(e.target.value))}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                            mb: theme.spacing(2),
                        }}
                        label="До"
                    />
                </Box>
            </Box>

            <Box sx={{ overflowY: 'auto' }} padding={theme.spacing(2)}>
                {records.map((record) => (
                    <Paper
                        key={record.id}
                        sx={{
                            borderRadius: '10px',
                            width: '100%',
                            boxShadow: 3,
                            padding: theme.spacing(6),
                            marginBottom: theme.spacing(1),
                        }}
                    >
                        <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={theme.spacing(4)}
                            mb={theme.spacing(4)}
                            height="fit-content"
                        >
                            <Typography variant="body1" color="textPrimary" fontWeight={900}>
                                {toLocalDateTime(record.time)}
                            </Typography>
                            <Typography variant="body1" color="textPrimary">
                                Виконавець дії: {record.actorFullName}
                            </Typography>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap={theme.spacing(8)}>
                            <Box width={isMd ? '100%' : '40%'}>
                                <Typography variant="body1" color="textPrimary">
                                    Опис:
                                </Typography>
                                <Typography variant="body1" color="textPrimary">
                                    {record.description}
                                </Typography>
                            </Box>
                            <Box
                                width={isMd ? '100%' : '55%'}
                                display="flex"
                                flexWrap="wrap"
                                gap={theme.spacing(2)}
                                border={`2px solid ${theme.palette.divider}`}
                                padding={theme.spacing(2)}
                            >
                                {record.entryRows.map((entry) => (
                                    <Typography
                                        key={entry.materialName}
                                        variant="body1"
                                        color="textSecondary"
                                        width={isMd ? '95%' : '45%'}
                                    >{`${entry.materialName}: ${entry.delta > 0 ? '+' : ''}${toFixedNumber(entry.delta, entry.isMoney ? 2 : 3)} ${entry.isMoney ? 'грн' : 'г'}`}</Typography>
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                ))}
            </Box>
        </Paper>
    );
};

export default GlobalAuditRecordsComponent;
