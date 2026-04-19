import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Button, FormControl, FormLabel, TextField, Typography, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type UpdateEmployeeFormData, updateEmployeeSchema } from '../../../validation/schemas.ts';
import { EmployeesApiClient } from '../../../api/employeesApiClient.ts';
import { showToast } from '../../common/Toast.tsx';
import { useEffect, useState } from 'react';
import type { EmployeeDto } from '../../../dto/employees.ts';
import {
    EDIT_MODAL_PAPER_MAX,
    FORM_HELPER_TEXT_ALIGNED_SX,
} from '../../../constants/createModalLayout.ts';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        width: EDIT_MODAL_PAPER_MAX,
        maxWidth: EDIT_MODAL_PAPER_MAX,
        boxSizing: 'border-box',
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

export interface EditEmployeeComponentProps {
    handleClose: () => void;
    isOpen: boolean;
    employeeId: number;
    onUpdate: () => void;
}

const EditEmployeeComponent = (props: EditEmployeeComponentProps) => {
    const theme = useTheme();
    const [employee, setEmployee] = useState<EmployeeDto | undefined>();

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<UpdateEmployeeFormData>({
        resolver: zodResolver(updateEmployeeSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            name: employee?.name ?? '',
            phone: employee?.phone ?? '',
        },
    });

    useEffect(() => {
        if (props.isOpen && employee) {
            reset({
                name: employee.name,
                phone: employee.phone,
            });
        }
    }, [employee, reset, props.isOpen]);

    useEffect(() => {
        if (props.isOpen && props.employeeId) {
            EmployeesApiClient.getById(props.employeeId)
                .then((foundEmployee) => {
                    if (foundEmployee) {
                        setEmployee(foundEmployee);
                    }
                })
                .catch((error) => {
                    console.error('Failed to fetch employee:', error);
                    showToast('Не вдалось завантажити інформацію про працівника', 'error');
                });
        }
    }, [props.isOpen, props.employeeId]);

    const handleClose = (): void => {
        clearErrors();
        reset();
        props.handleClose();
    };

    const onSubmit = (data: UpdateEmployeeFormData) => {
        console.log(data);
        EmployeesApiClient.update(props.employeeId, data)
            .then(() => {
                showToast('Працівника було успішно оновлено');
                handleClose();
                props.onUpdate();
            })
            .catch((error) => {
                showToast('Не вдалось оновити працівника', 'error');
                console.log(error);
            });
    };

    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.isOpen}
        >
            {/* Close modal icon (X) */}
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

            {/* Form title */}
            <Typography variant="h3" textAlign="center">
                Редагування працівника
            </Typography>

            {/* The form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ marginTop: theme.spacing(4) }}
                noValidate
            >
                <FormControl fullWidth>
                    <FormLabel htmlFor="full-name">ПІБ</FormLabel>
                    <TextField
                        id="full-name"
                        placeholder="Шевченко Тарас Григорович"
                        fullWidth
                        margin="dense"
                        defaultValue=""
                        {...register('name')}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        slotProps={{
                            formHelperText: { sx: FORM_HELPER_TEXT_ALIGNED_SX },
                        }}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel htmlFor="phone-number">Номер телефону</FormLabel>
                    <TextField
                        id="phone-number"
                        placeholder="+380961234567"
                        fullWidth
                        margin="dense"
                        defaultValue=""
                        {...register('phone')}
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        slotProps={{
                            formHelperText: { sx: FORM_HELPER_TEXT_ALIGNED_SX },
                        }}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
                </FormControl>
                <FormControl
                    fullWidth
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: theme.spacing(2),
                    }}
                >
                    <Button variant="contained" color="primary" type="submit">
                        Зберегти
                    </Button>
                </FormControl>
            </form>
        </BootstrapDialog>
    );
};

export default EditEmployeeComponent;
