import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import {
    Box,
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { WorkUnitsReportDto } from '../dto/work-units.ts';
import { WorkUnitsApiClient } from '../api/workUnitsApiClient.ts';
import { toLocalDate } from '../utils.ts';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import FilterIcon from '@mui/icons-material/TuneOutlined';

const WorkUnitsPage = () => {
    const theme = useTheme();

    const [report, setReport] = useState<WorkUnitsReportDto | undefined>();

    useEffect(() => {
        WorkUnitsApiClient.getReportForPeriod({
            startDate: new Date(),
            endDate: new Date(),
            employeeId: 1,
            metalId: 1,
        })
            .then(setReport)
            .catch((error) => console.log(error));
    }, []);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            style={{
                gap: theme.spacing(4),
                borderRadius: '10px',
                paddingBottom: theme.spacing(4),
                marginBottom: theme.spacing(8),
            }}
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                flexWrap="wrap"
                gap={2}
            >
                {report && (
                    <Box display="flex" flexDirection="column">
                        <Typography variant="h3" textAlign="left">
                            Наряди ({report.employeeFullName})
                        </Typography>
                        <Typography variant="body1">
                            {toLocalDate(report.periodStart)} – {toLocalDate(report.periodEnd)}
                        </Typography>
                    </Box>
                )}

                <Box
                    display="flex"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    gap={2}
                    width={{ xs: '100%', sm: 'auto' }}
                >
                    <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        width="100%"
                        gap={1}
                        flex={1}
                    >
                        <IconButton size="large" onClick={() => {}} aria-label="Filter">
                            <FilterIcon />
                        </IconButton>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {}}
                        sx={{ minWidth: { sm: '300px' } }}
                    >
                        Нова видача
                    </Button>
                </Box>
            </Box>

            <TableContainer
                style={{
                    minWidth: '350px',
                    maxHeight: '60vh',
                    overflow: 'auto',
                    boxSizing: 'content-box',
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ backgroundColor: '#b7cfd2', borderTopLeftRadius: 10 }}>
                                Дата видачі
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }}>
                                Дата прийняття
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }}>Замовлення, №</TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }}>
                                Метал (видано), г
                            </TableCell>

                            <TableCell
                                sx={{ backgroundColor: '#b7cfd2', borderLeft: '1px solid black' }}
                            >
                                Метал (повернено), г
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }}>ПН, %</TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }}>Метал з %</TableCell>
                            <TableCell
                                sx={{ backgroundColor: '#b7cfd2', borderTopRightRadius: 10 }}
                            ></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {report &&
                            report.entries.map((entry, id) => (
                                <TableRow key={id}>
                                    <TableCell>{toLocalDate(entry.issuedDate)}</TableCell>
                                    <TableCell>
                                        {entry.returnedDate ? toLocalDate(entry.returnedDate) : '–'}
                                    </TableCell>
                                    <TableCell>{entry.orderId ? entry.orderId : '–'}</TableCell>
                                    <TableCell>
                                        {entry.metalIssued ? entry.metalIssued.toFixed(3) : '–'}
                                    </TableCell>

                                    <TableCell sx={{ borderLeft: '1px solid black' }}>
                                        {entry.metalReturned ? entry.metalReturned.toFixed(3) : '–'}
                                    </TableCell>
                                    <TableCell>
                                        {entry.loss ? entry.loss.toFixed(2) : '–'}
                                    </TableCell>
                                    <TableCell>
                                        {entry.metalReturnedWithLoss
                                            ? entry.metalReturnedWithLoss.toFixed(3)
                                            : '–'}
                                    </TableCell>
                                    <TableCell width="50px">
                                        <IconButton
                                            size="small"
                                            style={{ padding: 0 }}
                                            onClick={() => {}}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {report && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: theme.spacing(4),
                    }}
                    alignSelf="flex-end"
                >
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Усього видано
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    sx={{ padding: 0, border: 'none', width: '50px' }}
                                ></TableCell>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" fontWeight={900} textAlign="right">
                                        {report.totalIssued.toFixed(2)} гр
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Усього повернено (без %)
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    sx={{ padding: 0, border: 'none', width: '50px' }}
                                ></TableCell>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" fontWeight={900} textAlign="right">
                                        {report.totalReturned.toFixed(2)} гр
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Усього повернено (з %)
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    sx={{ padding: 0, border: 'none', width: '50px' }}
                                ></TableCell>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" fontWeight={900} textAlign="right">
                                        {report.totalReturnedWithLoss.toFixed(2)} гр
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Витрачено на замовлення
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    sx={{ padding: 0, border: 'none', width: '50px' }}
                                ></TableCell>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" fontWeight={900} textAlign="right">
                                        {report.savedByEmployee
                                            ? report.spentOnOrders.toFixed(2)
                                            : '–'}{' '}
                                        гр
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Втрачено
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    sx={{ padding: 0, border: 'none', width: '50px' }}
                                ></TableCell>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography
                                        variant="body1"
                                        fontWeight={900}
                                        textAlign="right"
                                        color="error"
                                    >
                                        {report.lost.toFixed(2)} гр
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Повернено
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    sx={{ padding: 0, border: 'none', width: '50px' }}
                                ></TableCell>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography
                                        variant="body1"
                                        fontWeight={900}
                                        textAlign="right"
                                        color="green"
                                    >
                                        {report.savedByEmployee
                                            ? report.savedByEmployee.toFixed(2)
                                            : '–'}{' '}
                                        гр
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Paper>
    );
};

export default WorkUnitsPage;
