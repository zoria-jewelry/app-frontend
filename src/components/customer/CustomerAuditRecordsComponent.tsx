import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { AuditRecord } from '../../dto/audit.ts';
import { CustomersApiClient } from '../../api/customersApiClient.ts';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { toLocalDateTime } from '../../utils.ts';

const CustomerAuditRecordsComponent = () => {
    const theme = useTheme();

    const params = useParams();
    const customerId: number | null = params.customerId ? Number(params.customerId) : null;

    const [records, setRecords] = useState<AuditRecord[]>([]);

    const isMd = useMediaQuery(theme.breakpoints.down('md')); // < 900px

    useEffect(() => {
        if (!customerId) {
            return;
        }

        CustomersApiClient.getCustomerAuditRecords(customerId).then((audit) => {
            console.log(audit);
            setRecords(audit?.entries ?? []);
        });
    }, [customerId]);

    return (
        <>
            {records.map((record) => (
                <Paper
                    key={record.id}
                    sx={{
                        borderRadius: '10px',
                        width: '100%',
                        boxShadow: 3,
                        padding: theme.spacing(6),
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
                    <Box display="flex" flexWrap="wrap" gap={theme.spacing(4)}>
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
                            gap={theme.spacing(4)}
                        >
                            {record.entryRows.map((entry) => (
                                <Typography
                                    key={entry.materialName}
                                    variant="body1"
                                    color="textSecondary"
                                >{`${entry.materialName}: ${entry.delta > 0 ? '+' : ''}${entry.delta} ${entry.isMoney ? 'грн' : 'г'}`}</Typography>
                            ))}
                        </Box>
                    </Box>
                </Paper>
            ))}
        </>
    );
};

export default CustomerAuditRecordsComponent;
