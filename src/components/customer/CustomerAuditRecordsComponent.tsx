import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { AuditRecord } from '../../dto/audit.ts';
import { CustomersApiClient } from '../../api/customersApiClient.ts';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { toFixedNumber, toLocalDateTime } from '../../utils.ts';

export interface CustomerAuditRecordsProps {
    refresher: number;
}

const CustomerAuditRecordsComponent = ({ refresher }: CustomerAuditRecordsProps) => {
    const theme = useTheme();

    const params = useParams();
    const customerId: number | null = params.customerId ? Number(params.customerId) : null;

    const [records, setRecords] = useState<AuditRecord[]>([]);

    const isMd = useMediaQuery(theme.breakpoints.down('md')); // < 900px

    useEffect(() => {
        if (!customerId) {
            return;
        }

        CustomersApiClient.getCustomerAuditRecords(customerId).then((audit) =>
            setRecords(audit?.entries ?? []),
        );
    }, [customerId, refresher]);

    return (
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
                            {record.entryRows?.map((entry) => (
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
    );
};

export default CustomerAuditRecordsComponent;
