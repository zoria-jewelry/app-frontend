import { useEffect, useRef, useState } from 'react';
import type { CustomerBalanceEntryDto } from '../../dto/customers.ts';
import { useParams } from 'react-router-dom';
import { CustomersApiClient } from '../../api/customersApiClient.ts';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormControl, FormHelperText, FormLabel, TextField, useTheme } from '@mui/material';

const UpdateCustomerBalancesComponent = () => {
    const theme = useTheme();

    const params = useParams();
    const customerId: number | null = params.customerId ? Number(params.customerId) : null;
    const [balances, setBalances] = useState<CustomerBalanceEntryDto[]>([]);

    const schemaRef = useRef<z.ZodObject<Record<string, z.ZodString>>>(z.object({}));

    type UpdateCustomerBalancesDto = z.infer<typeof schemaRef.current>;

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<UpdateCustomerBalancesDto>({
        resolver: async (values, context, options) =>
            await zodResolver(schemaRef.current)(values, context, options),
        reValidateMode: 'onSubmit',
        defaultValues: {},
    });

    useEffect(() => {
        if (!customerId) {
            return;
        }

        CustomersApiClient.getCustomerBalanceById(customerId).then((balances) => {
            if (balances) {
                setBalances(balances.entries);

                /**
                 *
                 * Dynamically create validation schema...
                 *
                 * */
                const newDefaults: Record<string, string> = {};
                const newShape: Record<string, z.ZodString> = {};

                balances.entries.forEach((entry) => {
                    const key = String(entry.materialId);
                    newDefaults[key] = String(entry.value);
                    newShape[key] = z
                        .string('Введіть число')
                        .refine((val) => !isNaN(Number(val)), { message: 'Неправильний формат' });
                });

                reset(newDefaults);

                schemaRef.current = z.object(newShape);
            }
        });
    }, []);

    const onSubmit = (data: { [key: string]: string }) => {
        console.log(data);
        clearErrors();
        reset();
    };

    useEffect(() => {
        if (customerId) {
            CustomersApiClient.getCustomerBalanceById(customerId).then((customerBalance) => {
                if (!customerBalance) {
                    // TODO: add toast
                } else {
                    setBalances(customerBalance.entries);
                }
            });
        }
    }, [customerId]);

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ marginTop: theme.spacing(8), height: '100%', overflowY: 'scroll' }}
            noValidate
        >
            {/* Each customer balance entry, fetched from the backend */}
            {balances.map((entry) => {
                console.log(entry);
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
                                    step: 0.01,
                                },
                            }}
                            {...register(key)}
                            error={!!errors[key]}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        <FormHelperText
                            error={!!errors[key]}
                            sx={{
                                margin: 0,
                                marginBottom: theme.spacing(2),
                                minHeight: '30px',
                            }}
                        >
                            {errors?.[key]?.message}
                        </FormHelperText>
                    </FormControl>
                );
            })}

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
