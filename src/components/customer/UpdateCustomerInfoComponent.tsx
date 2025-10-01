import { useForm } from 'react-hook-form';
import {
    type UpdateCustomerInfoFromData,
    updateCustomerInfoSchema,
} from '../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CustomersApiClient } from '../../api/customersApiClient.ts';
import { Button, FormControl, FormHelperText, FormLabel, TextField, useTheme } from '@mui/material';
import { showToast } from '../common/Toast.tsx';

const UpdateCustomerInfoComponent = () => {
    const theme = useTheme();

    const params = useParams();
    const customerId: number | null = params.customerId ? Number(params.customerId) : null;

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

    const fetchCustomerInfo = useCallback(async () => {
        if (customerId) {
            CustomersApiClient.getInfoById(customerId).then((customerInfo) => {
                if (!customerInfo) {
                    showToast('Не вдалось завантажити дані клієнта', 'error');
                } else {
                    console.log(customerInfo);
                    reset({
                        fullName: customerInfo.fullName,
                        phone: customerInfo.phone,
                    });
                }
            });
        }
    }, [customerId]);

    const onSubmit = (data: UpdateCustomerInfoFromData) => {
        CustomersApiClient.updateData(customerId!, data)
            .then(() => {
                fetchCustomerInfo();
                showToast('Дані клієнта були успішно оновлені');
            })
            .catch((err) => {
                console.log(err);
                showToast('Не вдалось оновити дані клієнта', 'error');
            });
        clearErrors();
    };

    useEffect(() => {
        fetchCustomerInfo();
    }, [fetchCustomerInfo]);

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ marginTop: theme.spacing(8), width: '100%', overflow: 'auto' }}
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
                <FormHelperText error={!!errors.phone} sx={{ margin: 0, minHeight: '30px' }}>
                    {errors?.phone?.message}
                </FormHelperText>
            </FormControl>
            <FormControl
                fullWidth
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: theme.spacing(2),
                    marginBottom: theme.spacing(2),
                }}
            >
                <Button variant="contained" color="primary" type="submit">
                    Зберегти
                </Button>
            </FormControl>
        </form>
    );
};

export default UpdateCustomerInfoComponent;
