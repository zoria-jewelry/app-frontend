import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { useForm } from 'react-hook-form';
import {
    type UpdateCustomerInfoFromData,
    updateCustomerInfoSchema,
} from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { CustomersApiClient } from '../../../api/customersApiClient.ts';
import { showToast } from '../../common/Toast.tsx';
import { useEffect, useCallback } from 'react';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '40%',
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

export interface EditCustomerInfoComponentProps {
    isOpen: boolean;
    handleClose: () => void;
    customerId: number;
    onUpdate: () => void;
}

const EditCustomerInfoComponent = (props: EditCustomerInfoComponentProps) => {
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<UpdateCustomerInfoFromData>({
        resolver: zodResolver(updateCustomerInfoSchema),
        reValidateMode: 'onSubmit',
    });

    const fetchCustomerInfo = useCallback(() => {
        if (props.isOpen && props.customerId) {
            CustomersApiClient.getInfoById(props.customerId).then((customerInfo) => {
                if (!customerInfo) {
                    showToast('Не вдалось завантажити дані клієнта', 'error');
                } else {
                    reset({
                        fullName: customerInfo.fullName,
                        phone: customerInfo.phone,
                    });
                }
            });
        }
    }, [props.isOpen, props.customerId, reset]);

    useEffect(() => {
        fetchCustomerInfo();
    }, [fetchCustomerInfo]);

    const handleClose = (): void => {
        clearErrors();
        reset();
        props.handleClose();
    };

    const onSubmit = (data: UpdateCustomerInfoFromData) => {
        CustomersApiClient.updateData(props.customerId, data)
            .then(() => {
                showToast('Дані клієнта були успішно оновлені');
                handleClose();
                props.onUpdate();
            })
            .catch((err) => {
                console.log(err);
                showToast('Не вдалось оновити дані клієнта', 'error');
            });
        clearErrors();
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
                Редагування даних клієнта
            </Typography>

            {/* The form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ marginTop: theme.spacing(8) }}
                noValidate
            >
                <FormControl fullWidth>
                    <FormLabel htmlFor="full-name">ПІБ</FormLabel>
                    <TextField
                        id="full-name"
                        placeholder="Шевченко Тарас Григорович"
                        fullWidth
                        margin="normal"
                        {...register('fullName')}
                        error={!!errors.fullName}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
                    <FormHelperText
                        error={!!errors.fullName}
                        sx={{ margin: 0, marginBottom: theme.spacing(2), minHeight: '30px' }}
                    >
                        {errors?.fullName?.message}
                    </FormHelperText>
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel htmlFor="phone-number">Номер телефону</FormLabel>
                    <TextField
                        id="phone-number"
                        placeholder="+380961234567"
                        fullWidth
                        margin="normal"
                        {...register('phone')}
                        error={!!errors.phone}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
                    <FormHelperText
                        error={!!errors.phone}
                        sx={{ margin: 0, marginBottom: theme.spacing(2), minHeight: '30px' }}
                    >
                        {errors?.phone?.message}
                    </FormHelperText>
                </FormControl>
                <FormControl
                    fullWidth
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: theme.spacing(10),
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

export default EditCustomerInfoComponent;
