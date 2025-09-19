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
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import type { EmployeeDto } from '../../../dto/employees.ts';
import { EmployeesApiClient } from '../../../api/employeesApiClient.ts';
import type { MaterialDto } from '../../../dto/materials.ts';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';
import { OrdersApiClient } from '../../../api/ordersApiClient.ts';
import { createWorkUnitSchema, type CreateWorkUnitFormData } from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '40%',
        minHeight: '40%',
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

export interface CreateWorkUnitModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: CreateWorkUnitFormData) => void;
}

const CreateWorkUnitComponent = ({ open, onClose, onSave }: CreateWorkUnitModalProps) => {
    const theme = useTheme();

    const [employees, setEmployees] = useState<EmployeeDto[]>([]);
    const [metals, setMetals] = useState<MaterialDto[]>([]);
    const [activeOrderIds, setActiveOrderIds] = useState<number[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateWorkUnitFormData>({
        resolver: zodResolver(createWorkUnitSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            employeeId: 0,
            orderId: undefined,
            metalId: 0,
            weight: 0,
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
        OrdersApiClient.getAllActiveIds().then((ids) => setActiveOrderIds(ids ?? []));
    }, [setValue]);

    const onSubmit = (data: CreateWorkUnitFormData) => {
        onSave(data);
        handleClose();
    };

    const handleClose = () => {
        reset({
            employeeId: 0,
            orderId: undefined,
            metalId: 0,
            weight: 0,
        });
        onClose();
    };

    return (
        <BootstrapDialog onClose={handleClose} aria-labelledby="create-work-unit" open={open}>
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
                <Typography variant="h3" textAlign="center">
                    Нова видача
                </Typography>

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
                                marginBottom: theme.spacing(2),
                                minHeight: '30px',
                            }}
                        >
                            {errors.employeeId ? errors.employeeId.message : ''}
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
                            {activeOrderIds.map((id) => (
                                <MenuItem key={id} value={id}>
                                    {id}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText
                            error={true}
                            sx={{
                                margin: 0,
                                marginBottom: theme.spacing(2),
                                minHeight: '30px',
                            }}
                        >
                            {errors.orderId ? errors.orderId.message : ''}
                        </FormHelperText>
                    </FormControl>
                </Box>

                <Box mt={4}>
                    <Typography>Метал</Typography>
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
                                marginBottom: theme.spacing(2),
                                minHeight: '30px',
                            }}
                        >
                            {errors.metalId ? errors.metalId.message : ''}
                        </FormHelperText>
                    </FormControl>
                </Box>

                <Box mt={4}>
                    <Typography>Вага (г)</Typography>
                    <TextField
                        type="number"
                        fullWidth
                        {...register('weight', { valueAsNumber: true })}
                        error={!!errors.weight}
                    />
                    <FormHelperText
                        error={true}
                        sx={{
                            margin: 0,
                            marginBottom: theme.spacing(2),
                            minHeight: '30px',
                        }}
                    >
                        {errors.weight ? errors.weight.message : ''}
                    </FormHelperText>
                </Box>

                <Box mt={8} display="flex" justifyContent="center">
                    <Button variant="contained" color="primary" type="submit">
                        Зберегти
                    </Button>
                </Box>
            </form>
        </BootstrapDialog>
    );
};

export default CreateWorkUnitComponent;
