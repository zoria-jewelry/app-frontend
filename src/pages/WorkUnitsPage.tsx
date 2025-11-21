import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import {
    Box,
    Button,
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
import { styled } from '@mui/material/styles';
import TooltipMui, { tooltipClasses, type TooltipProps } from '@mui/material/Tooltip';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WorkUnitDto, WorkUnitsReportDto } from '../dto/work-units.ts';
import { WorkUnitsApiClient } from '../api/workUnitsApiClient.ts';
import { getCurrentMonthRange, toFixedNumber, toLocalDateTime } from '../utils.ts';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import FilterIcon from '@mui/icons-material/TuneOutlined';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import WorkUnitsFilterComponent, {
    type WorkUnitsFilterData,
} from '../components/modal/work-units/WorkUnitsFilterComponent.tsx';
import CreateWorkUnitComponent from '../components/modal/work-units/CreateWorkUnitComponent.tsx';
import {
    type CreateWorkUnitFormData,
    type SaveMaterialFormData,
    type ReturnWorkUnitFormData,
    type UpdateWorkUnitFormData,
} from '../validation/schemas.ts';
import ReturnWorkUnitComponent from '../components/modal/work-units/ReturnWorkUnitComponent.tsx';
import SaveMaterialComponent from '../components/modal/work-units/SaveMaterialComponent.tsx';
import EditWorkUnitComponent from '../components/modal/work-units/EditWorkUnitComponent.tsx';
import DialogComponent from '../components/modal/DialogComponent.tsx';
import { showToast } from '../components/common/Toast.tsx';

const WorkUnitsPage = () => {
    const theme = useTheme();
    const DEFAULT_DESCRIPTION = '–';

    const DescriptionTooltip = styled(({ className, ...props }: TooltipProps) => (
        <TooltipMui {...props} arrow classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#1f2a37',
            color: '#f9fafb',
            fontSize: '1rem',
            padding: theme.spacing(2),
            borderRadius: theme.spacing(2),
            boxShadow: theme.shadows[6],
            maxWidth: 360,
            whiteSpace: 'pre-wrap',
        },
        [`& .${tooltipClasses.arrow}`]: {
            color: '#1f2a37',
        },
    }));

    const currentMonth = getCurrentMonthRange();
    const [filterData, setFilterData] = useState<WorkUnitsFilterData>({
        periodStart: currentMonth.start,
        periodEnd: currentMonth.end,
        employeeId: 1,
        materialId: 1,
    });

    const [isStartNewMonthModalOpen, setIsStartNewMonthModalOpen] = useState<boolean>(false);

    const [report, setReport] = useState<WorkUnitsReportDto | undefined>();
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

    const [isSaveMetalOpen, setIsSaveMetalOpen] = useState<boolean>(false);

    const [workUnitToReturn, setWorkUnitToReturn] = useState<WorkUnitDto | undefined>();
    const [workUnitToEdit, setWorkUnitToEdit] = useState<WorkUnitDto | undefined>();

    const entriesToDisplay = useMemo(() => {
        if (!report?.entries) {
            return [];
        }

        const uniqueEntries = new Map<number, WorkUnitDto>();

        report.entries.forEach((entry) => {
            if (!uniqueEntries.has(entry.id)) {
                uniqueEntries.set(entry.id, entry);
            }
        });

        return Array.from(uniqueEntries.values());
    }, [report]);

    const fetchReport = useCallback(async () => {
        if (filterData) {
            WorkUnitsApiClient.getReportForPeriod(filterData)
                .then(setReport)
                .catch((error) => console.log(error));
        }
    }, [filterData]);

    useEffect(() => {
        fetchReport();
    }, [filterData]);

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
                            {toLocalDateTime(report.periodStart)} –{' '}
                            {toLocalDateTime(report.periodEnd)}
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
                        onClick={() => setIsSaveMetalOpen(true)}
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
                            backgroundColor: '#e5f6df',
                        }}
                    >
                        Повернути без видачі
                    </Button>

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
                onApply={setFilterData}
            />

            <CreateWorkUnitComponent
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSave={(data: CreateWorkUnitFormData) => {
                    console.log('Create work unit', data);
                    WorkUnitsApiClient.issueMetal(data)
                        .then(async () => {
                            showToast('Матеріал був успішно виданий ювеліру');
                            await fetchReport();
                        })
                        .catch((err) => {
                            showToast('Не вдалось видати матеріал ювеліру', 'error');
                            console.log(err);
                        });
                }}
            />

            {workUnitToReturn && (
                <ReturnWorkUnitComponent
                    workUnit={workUnitToReturn}
                    open={!!workUnitToReturn}
                    onClose={() => setWorkUnitToReturn(undefined)}
                    onSave={(data: ReturnWorkUnitFormData) => {
                        WorkUnitsApiClient.returnMetal(data)
                            .then(async () => {
                                showToast('Повернення матеріалу ювеліром було успішно зафіксоване');
                                await fetchReport();
                            })
                            .catch((err) => {
                                showToast(
                                    'Не вдалось зафіксувати повернення матеріалу ювеліром',
                                    'error',
                                );
                                console.log(err);
                            });
                    }}
                />
            )}

            {workUnitToEdit && (
                <EditWorkUnitComponent
                    open={!!workUnitToEdit}
                    workUnit={workUnitToEdit}
                    onClose={() => setWorkUnitToEdit(undefined)}
                    onSave={(data: UpdateWorkUnitFormData) => {
                        WorkUnitsApiClient.updateWorkUnit(data)
                            .then(async () => {
                                showToast('Наряд успішно оновлено');
                                await fetchReport();
                            })
                            .catch((err) => {
                                showToast('Не вдалось оновити наряд', 'error');
                                console.log(err);
                            });
                    }}
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
                                Матеріал
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }}>Дата видачі</TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }}>
                                Дата прийняття
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }}>Замовлення, №</TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2', width: '140px' }}>
                                Матеріал (видано), г
                            </TableCell>

                            <TableCell
                                sx={{
                                    backgroundColor: '#b7cfd2',
                                    borderLeft: '1px solid black',
                                    width: '140px',
                                }}
                            >
                                Матеріал (повернено), г
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2', width: '90px' }}>
                                ПН, %
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2', width: '130px' }}>
                                Матеріал з %
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2', width: '260px' }}>
                                Опис
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: '#b7cfd2',
                                    borderTopRightRadius: 10,
                                    width: '70px',
                                }}
                            ></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entriesToDisplay.map((entry) => {
                            const descriptionText =
                                entry.description && entry.description.trim().length > 0
                                    ? entry.description
                                    : DEFAULT_DESCRIPTION;
                            return (
                                <TableRow
                                    key={entry.id}
                                    sx={{
                                        backgroundColor:
                                            !entry.orderId && entry.issuedDate
                                                ? '#FFE9D2'
                                                : !entry.issuedDate
                                                  ? '#e5f6df'
                                                  : 'transparent',
                                    }}
                                >
                                    <TableCell>{entry.materialName}</TableCell>
                                    <TableCell>{toLocalDateTime(entry.issuedDate)}</TableCell>
                                    <TableCell>
                                        {entry.returnedDate
                                            ? toLocalDateTime(entry.returnedDate)
                                            : '–'}
                                    </TableCell>
                                    <TableCell>{entry.orderId ? entry.orderId : '–'}</TableCell>
                                    <TableCell sx={{ width: '140px' }}>
                                        {entry.metalIssued
                                            ? toFixedNumber(entry.metalIssued, 3)
                                            : '–'}
                                    </TableCell>

                                    <TableCell
                                        sx={{ borderLeft: '1px solid black', width: '140px' }}
                                    >
                                        {entry.metalReturned
                                            ? toFixedNumber(entry.metalReturned, 3)
                                            : '–'}
                                    </TableCell>
                                    <TableCell sx={{ width: '90px' }}>
                                        {entry.loss ? toFixedNumber(entry.loss, 2) : '–'}
                                    </TableCell>
                                    <TableCell sx={{ width: '130px' }}>
                                        {entry.metalReturnedWithLoss
                                            ? toFixedNumber(entry.metalReturnedWithLoss, 3)
                                            : '–'}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            maxWidth: '260px',
                                            width: '260px',
                                        }}
                                    >
                                        <DescriptionTooltip
                                            title={descriptionText}
                                            arrow
                                            placement="top-start"
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    display: 'block',
                                                    maxHeight: '72px',
                                                    overflowY: 'auto',
                                                    overflowX: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'pre-line',
                                                    pr: 1,
                                                }}
                                            >
                                                {descriptionText}
                                            </Typography>
                                        </DescriptionTooltip>
                                    </TableCell>
                                    <TableCell width="70px">
                                        <Box display="flex" gap={0.5}>
                                            {!entry.returnedDate && (
                                                <IconButton
                                                    size="small"
                                                    style={{ padding: 0 }}
                                                    onClick={() => setWorkUnitToReturn(entry)}
                                                >
                                                    <AddIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                style={{ padding: 0 }}
                                                onClick={() => setWorkUnitToEdit(entry)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
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
                                        {report.totalIssued.toFixed(3)} г
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
                                        {report.spentOnOrders
                                            ? `${toFixedNumber(report.spentOnOrders, 3)} г`
                                            : '–'}{' '}
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
                                        {report.totalReturned.toFixed(3)} г
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
                                        {report.totalReturnedWithLoss.toFixed(3)} г
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        padding: 0,
                                        border: 'none',
                                        borderTop: '1px solid black',
                                    }}
                                >
                                    <Typography variant="body1" color="text.secondary">
                                        Угорілий матеріал
                                    </Typography>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        padding: 0,
                                        border: 'none',
                                        borderTop: '1px solid black',
                                        width: '50px',
                                    }}
                                ></TableCell>
                                <TableCell
                                    sx={{
                                        padding: 0,
                                        border: 'none',
                                        borderTop: '1px solid black',
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        fontWeight={900}
                                        textAlign="right"
                                        color="error"
                                    >
                                        {toFixedNumber(report.lost, 3)} г
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Повернено переплавленого порошку
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
                                            ? `${toFixedNumber(report.savedByEmployee, 3)} г`
                                            : '–'}{' '}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ padding: 0, border: 'none' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Сальдо на кінець періоду
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
                                        color={
                                            report.delta === 0
                                                ? 'info'
                                                : report.delta > 0
                                                  ? 'green'
                                                  : 'error'
                                        }
                                    >
                                        {toFixedNumber(report.delta, 3)} г
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>
            )}

            {filterData.employeeId && filterData.employeeId > 0 && report && (
                <SaveMaterialComponent
                    open={isSaveMetalOpen}
                    employeeId={filterData.employeeId}
                    employeeName={report.employeeFullName}
                    onClose={() => setIsSaveMetalOpen(false)}
                    onSave={(data: SaveMaterialFormData) => {
                        WorkUnitsApiClient.saveMetal(data)
                            .then(() => {
                                showToast('Повернення угорілого матеріалу успішно зафіксовано');
                                fetchReport();
                            })
                            .catch((err) => {
                                showToast(
                                    'Не вдалось зафіксувати повернення угорілого матеріалу',
                                    'error',
                                );
                                console.log(err);
                            });
                    }}
                />
            )}

            <Box
                width="100%"
                display="flex"
                justifyContent="flex-end"
                mt={theme.spacing(8)}
                mb={theme.spacing(4)}
            >
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setIsStartNewMonthModalOpen(true)}
                >
                    Почати новий місяць
                </Button>
            </Box>

            <DialogComponent
                handleClose={() => setIsStartNewMonthModalOpen(false)}
                handleAction={() => {
                    WorkUnitsApiClient.rolloverWorkUnits()
                        .then(() => {
                            showToast(
                                'Початок нового місяця був успішно зафіксований. Усі відкриті наряди були успішно продубльовані з поточною датою',
                            );
                            fetchReport();
                            setIsStartNewMonthModalOpen(false);
                        })
                        .catch((err) => {
                            showToast(
                                'Не вдалось зафіксувати початок нового місяця. Негайно зверніться до адміністратора!',
                                'error',
                            );
                            console.log(err);
                        });
                }}
                isOpen={isStartNewMonthModalOpen}
                dialogText="Ця дія закриє всі незавершені наряди і відкриє їх знову з поточною датою. Найкращий час для запуску цього процесу – наступний день після завершення інвентаризації. Ви впевнені, що хочете почати новий місяць?"
                actionButtonText="Так, почати"
                actionButtonVariant="error"
            />
        </Paper>
    );
};

export default WorkUnitsPage;
