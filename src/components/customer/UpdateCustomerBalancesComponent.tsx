import { useEffect, useState } from 'react';
import type { CustomerBalanceEntryDto } from '../../dto/customers.ts';
import { useParams } from 'react-router-dom';
import { CustomersApiClient } from '../../api/customersApiClient.ts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormControl, FormHelperText, FormLabel, TextField, useTheme } from '@mui/material';
import {
    updateCustomerBalancesSchema,
    type UpdateCustomerBalancesFormData,
} from '../../validation/schemas.ts';
import { showToast } from '../common/Toast.tsx';

export interface UpdateCustomerBalancesComponentProps {
    onUpdate: () => void;
}

const UpdateCustomerBalancesComponent = ({ onUpdate }: UpdateCustomerBalancesComponentProps) => {
    const theme = useTheme();

    const params = useParams();
    const customerId: number | null = params.customerId ? Number(params.customerId) : null;
    const [balances, setBalances] = useState<CustomerBalanceEntryDto[]>([]);

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<UpdateCustomerBalancesFormData>({
        resolver: zodResolver(updateCustomerBalancesSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            description: '',
            entries: [],
        },
    });

    useEffect(() => {
        if (!customerId) {
            return;
        }

        CustomersApiClient.getCustomerBalanceById(customerId).then((balances) => {
            if (balances) {
                setBalances(balances.entries);

                const entries = balances.entries.map((entry) => ({
                    materialId: entry.materialId,
                    newValue: entry.value,
                }));

                reset({
                    description: '',
                    entries: entries,
                });
            }
        });
    }, [customerId, reset]);

    const onSubmit = (data: UpdateCustomerBalancesFormData) => {
        if (customerId) {
            CustomersApiClient.updateCustomerBalance(customerId, data)
                .then(() => {
                    showToast('Баланс клієнта був успішно оновлений');
                    clearErrors();
                })
                .catch((err) => {
                    showToast('Не вдалось оновити баланс клієнта', 'error');
                    console.log(err);
                })
                .finally(onUpdate);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ marginTop: theme.spacing(8), height: '100%', overflowY: 'scroll' }}
            noValidate
        >
            {/* Each customer balance entry, fetched from the backend */}
            {balances.map((entry, index) => {
                const key = String(entry.materialId);
                return (
                    <FormControl fullWidth key={key}>
                        <FormLabel htmlFor={`material-${key}`}>
                            {`${entry.materialName} ${entry.materialId ? '(г)' : ''}`}
                        </FormLabel>
                        <TextField
                            id={`material-${key}`}
                            fullWidth
                            type="number"
                            margin="normal"
                            slotProps={{
                                htmlInput: {
                                    step: 0.001,
                                },
                            }}
                            {...register(`entries.${index}.newValue`, {
                                valueAsNumber: true,
                                setValueAs: (value) => parseFloat(value) || 0,
                            })}
                            error={!!errors.entries?.[index]?.newValue}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        <FormHelperText
                            error={!!errors.entries?.[index]?.newValue}
                            sx={{
                                margin: 0,
                                marginBottom: theme.spacing(2),
                                minHeight: '30px',
                            }}
                        >
                            {errors?.entries?.[index]?.newValue?.message}
                        </FormHelperText>
                    </FormControl>
                );
            })}

            {/* Description field */}
            <FormControl fullWidth>
                <FormLabel htmlFor="description">Опис операції</FormLabel>
                <TextField
                    id="description"
                    fullWidth
                    type="textarea"
                    multiline
                    minRows={4}
                    margin="normal"
                    {...register('description')}
                    error={!!errors.description}
                    sx={{
                        margin: 0,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '6px',
                        },
                    }}
                />
                <FormHelperText
                    error={!!errors.description}
                    sx={{
                        margin: 0,
                        marginBottom: theme.spacing(2),
                        minHeight: '30px',
                    }}
                >
                    {errors?.description?.message}
                </FormHelperText>
            </FormControl>

            <FormControl
                fullWidth
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: theme.spacing(2),
                    marginBottom: theme.spacing(2),
                }}
            >
                <Button variant="contained" color="primary" type="submit">
                    Оновити баланс
                </Button>
            </FormControl>
        </form>
    );
};

export default UpdateCustomerBalancesComponent;
