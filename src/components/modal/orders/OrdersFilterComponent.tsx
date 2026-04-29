import { type ChangeEvent, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    IconButton,
    MenuItem,
    Popover,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { EmployeeDto } from '../../../dto/employees.ts';
import { EmployeesApiClient } from '../../../api/employeesApiClient.ts';
import type { OrdersFilterData } from '../../../api/ordersApiClient.ts';
import { OrderStatus } from '../../../dto/orders.ts';
import ListItemText from '@mui/material/ListItemText';
import { showToast } from '../../common/Toast.tsx';

export interface OrdersFilterModalProps {
    /** Anchor element (e.g. filter button); popover is closed when null */
    anchorEl: HTMLElement | null;
    onClose: () => void;
    onApply: (filterData: OrdersFilterData) => void;
}

const OrdersFilterModal = ({ anchorEl, onClose, onApply }: OrdersFilterModalProps) => {
    const open = Boolean(anchorEl);

    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [statuses, setStatuses] = useState({
        inProgress: false,
        completed: false,
        canceled: false,
    });
    const [executors, setExecutors] = useState<number[] | undefined>();

    const [employees, setEmployees] = useState<EmployeeDto[]>([]);

    const [datesError, setDatesError] = useState<string | undefined>();

    const handleStatusChange = (event: ChangeEvent<HTMLInputElement>) => {
        setStatuses({ ...statuses, [event.target.name]: event.target.checked });
    };

    const resetFilters = () => {
        setDatesError(undefined);
        setFromDate(undefined);
        setToDate(undefined);
        setStatuses({ inProgress: false, completed: false, canceled: false });
        setExecutors(undefined);
    };

    useEffect(() => {
        const composedStatuses: OrderStatus[] = [];
        if (statuses.inProgress) composedStatuses.push(OrderStatus.IN_PROGRESS);
        if (statuses.completed) composedStatuses.push(OrderStatus.COMPLETED);
        if (statuses.canceled) composedStatuses.push(OrderStatus.CANCELED);

        if (fromDate && toDate && fromDate > toDate) {
            setDatesError('Дата кінця не може бути раніше дати початку');
            return;
        }
        setDatesError(undefined);

        onApply({
            executorsIds: executors?.map((e) => Number(e)),
            fromDate,
            toDate,
            statuses: composedStatuses,
        });
    }, [fromDate, toDate, statuses, executors, onApply]);

    useEffect(() => {
        EmployeesApiClient.getAllActive().then((employees) => {
            if (employees) {
                setEmployees(employees);
            } else {
                showToast('Не вдалось завантажити реєстр працівників', 'error');
            }
        });
    }, []);

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
                backdrop: {
                    sx: { backgroundColor: 'rgba(0, 0, 0, 0.12)' },
                },
                paper: {
                    sx: {
                        p: 2.5,
                        borderRadius: 2,
                        maxWidth: 'min(calc(100vw - 24px), 380px)',
                        width: 'min(calc(100vw - 24px), 440px)',
                        maxHeight: 'min(90dvh, 720px)',
                        overflow: 'auto',
                        boxShadow: 12,
                        border: '1px solid',
                        borderColor: 'divider',
                        mt: 1,
                    },
                },
            }}
            disableRestoreFocus
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                sx={{ mb: 1.5 }}
            >
                <Typography id="orders-filter-title" variant="h6" fontWeight={600} component="h2">
                    Фільтр
                </Typography>
                <IconButton
                    aria-label="Закрити"
                    onClick={onClose}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            <Stack spacing={5} sx={{ width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                    <Typography variant="body1" component="div" sx={{ mb: 1.5 }}>
                        За період
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            flexWrap: 'wrap',
                            alignItems: { xs: 'stretch', md: 'flex-start' },
                            gap: { xs: 3, md: 4 },
                        }}
                    >
                        <Box sx={{ flex: { md: '1 1 200px' }, minWidth: 0, maxWidth: '100%' }}>
                            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                                З дати включно
                            </Typography>
                            <TextField
                                type="date"
                                fullWidth
                                value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                    setFromDate(
                                        e.target.value ? new Date(e.target.value) : undefined,
                                    );
                                    setDatesError(undefined);
                                }}
                            />
                        </Box>

                        <Box sx={{ flex: { md: '1 1 200px' }, minWidth: 0, maxWidth: '100%' }}>
                            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                                До дати включно
                            </Typography>
                            <TextField
                                type="date"
                                fullWidth
                                value={toDate ? toDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                    setToDate(
                                        e.target.value ? new Date(e.target.value) : undefined,
                                    );
                                    setDatesError(undefined);
                                }}
                                error={!!datesError}
                            />
                            <FormHelperText error={!!datesError} sx={{ margin: 0 }}>
                                {datesError ? datesError : ''}
                            </FormHelperText>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ width: '100%' }}>
                    <Typography variant="body1" component="div" sx={{ mb: 1.5 }}>
                        Стан
                    </Typography>
                    <FormGroup
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            flexWrap: 'wrap',
                            alignItems: { sm: 'center' },
                            gap: { xs: 1.25, sm: 2, md: 2.5 },
                            m: 0,
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={statuses.inProgress}
                                    onChange={handleStatusChange}
                                    name="inProgress"
                                />
                            }
                            label="У процесі"
                            sx={{ mr: { sm: 0 } }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={statuses.completed}
                                    onChange={handleStatusChange}
                                    name="completed"
                                />
                            }
                            label="Виконані"
                            sx={{ mr: { sm: 0 } }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={statuses.canceled}
                                    onChange={handleStatusChange}
                                    name="canceled"
                                />
                            }
                            label="Скасовані"
                            sx={{ mr: { sm: 0 } }}
                        />
                    </FormGroup>
                </Box>

                <Box sx={{ width: '100%' }}>
                    <Typography variant="body1" component="div" sx={{ mb: 1.5 }}>
                        Виконавець
                    </Typography>
                    <Select
                        fullWidth
                        multiple
                        value={executors || []}
                        onChange={(e) => {
                            const value = e.target.value;
                            setExecutors(
                                typeof value === 'string' ? value.split(',').map(Number) : value,
                            );
                        }}
                        renderValue={(selected) => {
                            if (!selected || selected.length === 0) return 'Виконавець';
                            return employees
                                .filter((emp) => selected.includes(emp.id))
                                .map((emp) => emp.name)
                                .join(', ');
                        }}
                    >
                        {employees.map((emp) => (
                            <MenuItem key={emp.id} value={emp.id}>
                                <Checkbox checked={executors?.includes(emp.id) || false} />
                                <ListItemText primary={emp.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Stack>

            <Box sx={{ mt: 3, width: '100%' }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={resetFilters}
                    disableElevation
                    sx={{
                        bgcolor: 'grey.400',
                        color: 'grey.900',
                        '&:hover': { bgcolor: 'grey.500' },
                    }}
                >
                    Скинути фільтри
                </Button>
            </Box>
        </Popover>
    );
};

export default OrdersFilterModal;
