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

const UpdateCustomerBalancesComponent = () => {
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
        watch,
        setValue,
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

                // Initialize form with current balance entries
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
        console.log('Submitting customer balance update:', data);
        clearErrors();
        // TODO: Implement API call to update customer balances
        // CustomersApiClient.updateCustomerBalances(customerId, data);
    };

    const watchedEntries = watch('entries');

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
                            {`${entry.materialName} (г)`}
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
                            value={watchedEntries?.[index]?.newValue || ''}
                            onChange={(e) => {
                                const newEntries = [...(watchedEntries || [])];
                                newEntries[index] = {
                                    ...newEntries[index],
                                    materialId: entry.materialId,
                                    newValue: parseFloat(e.target.value) || 0,
                                };
                                setValue('entries', newEntries);
                            }}
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
