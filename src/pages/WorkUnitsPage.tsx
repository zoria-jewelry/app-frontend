import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { WorkUnitsReportDto } from '../dto/work-units.ts';
import { WorkUnitsApiClient } from '../api/workUnitsApiClient.ts';
import { toLocalDate } from '../utils.ts';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import FilterIcon from '@mui/icons-material/TuneOutlined';
import WorkUnitsFilterComponent, {
    type WorkUnitsFilterData,
} from '../components/modal/work-units/WorkUnitsFilterComponent.tsx';
import CreateWorkUnitComponent from '../components/modal/work-units/CreateWorkUnitComponent.tsx';
import {
    type CreateWorkUnitFormData,
    saveMetalSchema,
    type SaveMetalFormData,
} from '../validation/schemas.ts';
import ReturnWorkUnitComponent from '../components/modal/work-units/ReturnWorkUnitComponent.tsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const WorkUnitsPage = () => {
    const theme = useTheme();

    const [report, setReport] = useState<WorkUnitsReportDto | undefined>();
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

    const [workUnitIdToReturn, setWorkUnitIdToReturn] = useState<number | undefined>();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SaveMetalFormData>({
        resolver: zodResolver(saveMetalSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            metalWeight: 0,
        },
    });

    const onSave = (data: SaveMetalFormData) => {
        console.log(data);
        reset();
    };

    const fetchReport = useCallback(async () => {
        WorkUnitsApiClient.getReportForPeriod({
            startDate: new Date(),
            endDate: new Date(),
            employeeId: 1,
            metalId: 1,
        })
            .then(setReport)
            .catch((error) => console.log(error));
    }, []);

    useEffect(() => {
        fetchReport();
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
                flexDirection={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                width="100%"
                gap={{ xs: 3, sm: 2, md: 4 }}
                sx={{
                    padding: { xs: 2, sm: 3 },
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {report && (
                    <Box
                        display="flex"
                        flexDirection="column"
                        flex={1}
                        minWidth={0}
                        sx={{
                            textAlign: { xs: 'center', md: 'left' },
                        }}
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
                            Наряди ({report.employeeFullName})
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 400,
                            }}
                        >
                            {toLocalDate(report.periodStart)} – {toLocalDate(report.periodEnd)}
                        </Typography>
                    </Box>
                )}

                <Box
                    display="flex"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    alignItems="center"
                    gap={{ xs: 2, sm: 1.5, md: 2 }}
                    width={{ xs: '100%', md: 'auto' }}
                    minWidth={{ xs: 'auto', sm: 'fit-content' }}
                >
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent={{ xs: 'center', sm: 'flex-start' }}
                        width={{ xs: '100%', sm: 'auto' }}
                    >
                        <IconButton
                            size="large"
                            onClick={() => setIsFilterOpen(true)}
                            aria-label="Filter"
                            sx={{
                                backgroundColor: 'action.hover',
                                '&:hover': {
                                    backgroundColor: 'action.selected',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            <FilterIcon />
                        </IconButton>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsCreateOpen(true)}
                        size="large"
                        sx={{
                            minWidth: { xs: '100%', sm: '200px', md: '250px' },
                            height: { xs: '48px', sm: '40px' },
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: 2,
                            '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Нова видача
                    </Button>
                </Box>
            </Box>

            <WorkUnitsFilterComponent
                open={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={(data: WorkUnitsFilterData) => {
                    WorkUnitsApiClient.getReportForPeriod({
                        startDate: data.startDate ?? new Date(),
                        endDate: data.endDate ?? new Date(),
                        employeeId: data.employeeId ?? 1,
                        metalId: data.metalId ?? 1,
                        orderId: data.orderId,
                    })
                        .then(setReport)
                        .catch((error) => console.log(error));
                }}
            />

            <CreateWorkUnitComponent
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSave={(data: CreateWorkUnitFormData) => {
                    // TODO: Call create work-unit endpoint when available
                    console.log('Create work unit', data);
                }}
            />

            {workUnitIdToReturn && (
                <ReturnWorkUnitComponent
                    workUnitId={workUnitIdToReturn}
                    open={!!workUnitIdToReturn}
                    onClose={() => setWorkUnitIdToReturn(undefined)}
                    onSave={() => fetchReport()}
                />
            )}

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
                            report.entries.map((entry) => (
                                <TableRow
                                    key={entry.id}
                                    sx={{
                                        backgroundColor:
                                            !entry.orderId && entry.issuedDate
                                                ? theme.palette.warning.main
                                                : !entry.issuedDate
                                                  ? theme.palette.success.light
                                                  : 'transparent',
                                    }}
                                >
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
                                        {!entry.returnedDate && (
                                            <IconButton
                                                size="small"
                                                style={{ padding: 0 }}
                                                onClick={() => setWorkUnitIdToReturn(entry.id)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )}
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
                                        {report.totalIssued.toFixed(2)} г
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
                                        {report.totalReturned.toFixed(2)} г
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
                                        {report.totalReturnedWithLoss.toFixed(2)} г
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
                                        г
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
                                        {report.lost.toFixed(2)} г
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Врятовано (???)
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
                                        г
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>
            )}

            <Box width="100%" display="flex" justifyContent="flex-end" alignItems="center">
                <form onSubmit={handleSubmit(onSave)}>
                    <Box>
                        <Typography>Рятування металу, г</Typography>
                        <FormControl fullWidth error={!!errors.metalWeight}>
                            <TextField
                                type="number"
                                fullWidth
                                {...register('metalWeight', { valueAsNumber: true })}
                                error={!!errors.metalWeight}
                            />
                            <FormHelperText
                                error={true}
                                sx={{
                                    margin: 0,
                                    marginBottom: theme.spacing(2),
                                    minHeight: '30px',
                                }}
                            >
                                {errors.metalWeight ? errors.metalWeight.message : ''}
                            </FormHelperText>
                        </FormControl>
                    </Box>
                    <Button variant="contained" color="primary" size="large" type="submit">
                        Зафіксувати повернення
                    </Button>
                </form>
            </Box>
        </Paper>
    );
};

export default WorkUnitsPage;
