import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
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
import type { MaterialDto } from '../../../dto/materials.ts';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { OrdersApiClient } from '../../../api/ordersApiClient.ts';
import {
    workUnitsFilterSchema,
    type WorkUnitsFilterFormData,
} from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { formatDateToYYYYMMDD, getCurrentMonthRange } from '../../../utils.ts';

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

export interface WorkUnitsFilterData {
    employeeId?: number;
    startDate?: Date;
    endDate?: Date;
    metalId?: number;
    orderId?: number;
}

export interface WorkUnitsFilterModalProps {
    open: boolean;
    onClose: () => void;
    onApply: (filterData: WorkUnitsFilterData) => void;
}

const WorkUnitsFilterComponent = ({ open, onClose, onApply }: WorkUnitsFilterModalProps) => {
    const theme = useTheme();

    const currentMonth = getCurrentMonthRange();
    const [employees, setEmployees] = useState<EmployeeDto[]>([]);
    const [metals, setMetals] = useState<MaterialDto[]>([]);
    const [ordersIds, setOrdersIds] = useState<number[]>([]);

    const {
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<WorkUnitsFilterFormData>({
        resolver: zodResolver(workUnitsFilterSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            startDate: currentMonth.start,
            endDate: currentMonth.end,
            employeeId: 0,
            metalId: 0,
            orderId: undefined,
        },
    });

    useEffect(() => {
        EmployeesApiClient.getAllActive().then((es) => {
            setEmployees(es ?? []);
            if (es && es.length > 0) {
                setValue('employeeId', es[0].id);
            }
        });
        MaterialsApiClient.getAll().then((ms) => {
            setMetals(ms ?? []);
            if (ms && ms.length > 0) {
                setValue('metalId', ms[0].id);
            }
        });
        OrdersApiClient.getAllActiveIds().then((ids) => setOrdersIds(ids ?? []));
    }, [setValue]);

    const onSubmit = (data: WorkUnitsFilterFormData) => {
        onApply({
            employeeId: data.employeeId,
            startDate: data.startDate,
            endDate: data.endDate,
            metalId: data.metalId,
            orderId: data.orderId,
        });
        onClose();
    };

    const handleClose = () => {
        const currentMonth = getCurrentMonthRange();
        reset({
            startDate: currentMonth.start,
            endDate: currentMonth.end,
            employeeId: 0,
            metalId: 0,
            orderId: undefined,
        });
        onClose();
    };

    return (
        <BootstrapDialog onClose={handleClose} aria-labelledby="work-units-filter" open={open}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

                <Box mt={4}>
                    <Typography>Працівник</Typography>
                    <FormControl fullWidth error={!!errors.employeeId}>
                        <Select
                            fullWidth
                            value={watch('employeeId') || ''}
                            onChange={(e) => setValue('employeeId', Number(e.target.value))}
                            displayEmpty
                        >
                            <MenuItem value="">Оберіть працівника</MenuItem>
                            {employees.map((emp) => (
                                <MenuItem key={emp.id} value={emp.id}>
                                    {emp.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText
                            error={true}
                            sx={{
                                margin: 0,
                                minHeight: '30px',
                            }}
                        >
                            {errors.employeeId ? errors.employeeId.message : ''}
                        </FormHelperText>
                    </FormControl>
                </Box>

                <Typography marginTop={theme.spacing(2)}>За період:</Typography>
                <Box mt={2}>
                    <Typography>З дати включно</Typography>
                    <TextField
                        type="date"
                        fullWidth
                        value={watch('startDate') ? formatDateToYYYYMMDD(watch('startDate')) : ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setValue('startDate', new Date(value));
                        }}
                        error={!!errors.startDate}
                    />
                    <FormHelperText
                        error={true}
                        sx={{
                            margin: 0,
                            minHeight: '30px',
                        }}
                    >
                        {errors.startDate ? errors.startDate.message : ''}
                    </FormHelperText>

                    <Typography>До дати включно</Typography>
                    <TextField
                        type="date"
                        fullWidth
                        value={watch('endDate') ? formatDateToYYYYMMDD(watch('endDate')) : ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setValue('endDate', new Date(value));
                        }}
                        error={!!errors.endDate}
                    />
                    <FormHelperText
                        error={true}
                        sx={{
                            margin: 0,
                            minHeight: '30px',
                        }}
                    >
                        {errors.endDate ? errors.endDate.message : ''}
                    </FormHelperText>
                </Box>

                <Box mt={4}>
                    <Typography>Тип металу</Typography>
                    <FormControl fullWidth error={!!errors.metalId}>
                        <Select
                            fullWidth
                            value={watch('metalId') || ''}
                            onChange={(e) => setValue('metalId', Number(e.target.value))}
                            displayEmpty
                        >
                            <MenuItem value="">Оберіть метал</MenuItem>
                            {metals.map((m) => (
                                <MenuItem key={m.id} value={m.id}>
                                    {m.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText
                            error={true}
                            sx={{
                                margin: 0,
                                minHeight: '30px',
                            }}
                        >
                            {errors.metalId ? errors.metalId.message : ''}
                        </FormHelperText>
                    </FormControl>
                </Box>

                <Box mt={4}>
                    <Typography>Замовлення (№)</Typography>
                    <FormControl fullWidth error={!!errors.orderId}>
                        <Select
                            fullWidth
                            value={watch('orderId') || ''}
                            onChange={(e) =>
                                setValue(
                                    'orderId',
                                    e.target.value ? Number(e.target.value) : undefined,
                                )
                            }
                            displayEmpty
                        >
                            <MenuItem value="">Оберіть замовлення</MenuItem>
                            {ordersIds.map((o) => (
                                <MenuItem key={o} value={o}>
                                    {o}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box mt={8} display="flex" justifyContent="center">
                    <Button variant="contained" type="submit">
                        Застосувати
                    </Button>
                </Box>
            </form>
        </BootstrapDialog>
    );
};

export default WorkUnitsFilterComponent;
