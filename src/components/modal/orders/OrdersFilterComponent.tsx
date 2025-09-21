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
    Select,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { EmployeeDto } from '../../../dto/employees.ts';
import { EmployeesApiClient } from '../../../api/employeesApiClient.ts';
import type { OrdersFilterData } from '../../../api/ordersApiClient.ts';
import { OrderStatus } from '../../../dto/orders.ts';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '40%',
        minHeight: '60%',
        padding: theme.spacing(12),
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(10),
        paddingTop: 0,
    },
}));

export interface OrdersFilterModalProps {
    open: boolean;
    onClose: () => void;
    onApply: (filterData: OrdersFilterData) => void;
}

const OrdersFilterModal = ({ open, onClose, onApply }: OrdersFilterModalProps) => {
    const theme = useTheme();

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

    const handleApply = () => {
        const composedStatuses: OrderStatus[] = [];
        if (statuses.inProgress) composedStatuses.push(OrderStatus.IN_PROGRESS);
        if (statuses.completed) composedStatuses.push(OrderStatus.COMPLETED);
        if (statuses.canceled) composedStatuses.push(OrderStatus.CANCELED);

        if (fromDate && toDate && fromDate > toDate) {
            setDatesError('Дата кінця не може бути раніше дати початку');
            return;
        }

        onApply({
            executorsIds: executors?.map((e) => Number(e)),
            fromDate,
            toDate,
            statuses: composedStatuses,
        });
        onClose();
    };

    const handleClose = () => {
        setFromDate(undefined);
        setToDate(undefined);
        setStatuses({
            inProgress: false,
            completed: false,
            canceled: false,
        });
        setExecutors([]);
        setDatesError(undefined);
        onClose();
    };

    useEffect(() => {
        EmployeesApiClient.getAllActive().then((employees) => {
            if (employees) {
                setEmployees(employees);
            } else {
                // TODO: add toast
            }
        });
    }, []);

    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
        >
            <IconButton
                aria-label="close"
                onClick={handleClose}
                size="large"
                sx={(theme) => ({
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon />
            </IconButton>
            <Typography variant="h3">Фільтр</Typography>

            <Typography marginTop={theme.spacing(4)}>За період:</Typography>

            <Box mt={2}>
                <Typography>З дати включно</Typography>
                <TextField
                    type="date"
                    fullWidth
                    value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                        setFromDate(e.target.value ? new Date(e.target.value) : undefined);
                        setDatesError(undefined);
                    }}
                />

                <Typography marginTop={theme.spacing(4)}>До дати включно</Typography>
                <TextField
                    type="date"
                    fullWidth
                    value={toDate ? toDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                        setToDate(e.target.value ? new Date(e.target.value) : undefined);
                        setDatesError(undefined);
                    }}
                    error={!!datesError}
                />
                <FormHelperText
                    error={!!datesError}
                    sx={{
                        margin: 0,
                        marginBottom: theme.spacing(2),
                        minHeight: '30px',
                    }}
                >
                    {datesError ? datesError : ''}
                </FormHelperText>
            </Box>

            <Box mt={2}>
                <Typography>Стан</Typography>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={statuses.inProgress}
                                onChange={handleStatusChange}
                                name="inProgress"
                            />
                        }
                        label="У процесі"
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
                    />
                </FormGroup>
            </Box>

            <Box mt={2}>
                <Typography>Виконавець</Typography>
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

            <Box mt={8} display="flex" justifyContent="center">
                <Button variant="contained" onClick={handleApply}>
                    Застосувати
                </Button>
            </Box>
        </BootstrapDialog>
    );
};

export default OrdersFilterModal;
