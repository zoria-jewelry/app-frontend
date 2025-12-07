import { useCallback, useEffect, useState } from 'react';
import type { CustomerBalanceEntryDto } from '../../dto/customers.ts';
import { useParams } from 'react-router-dom';
import { CustomersApiClient } from '../../api/customersApiClient.ts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {
    updateCustomerBalancesSchema,
    type UpdateCustomerBalancesFormData,
} from '../../validation/schemas.ts';
import { showToast } from '../common/Toast.tsx';

export interface UpdateCustomerBalancesComponentProps {
    onUpdate: () => void;
}

const evaluateExpression = (expr: string): number | null => {
    if (!expr || !expr.toString().trim()) return null;
    const s = expr.toString().trim();

    if (!/^[0-9+\-.\s]+$/.test(s)) return null;

    const cleaned = s.replace(/\s+/g, '');
    const parts = cleaned.split(/(?=[+-])/g);

    let acc = 0;
    for (const p of parts) {
        if (p === '') continue;
        const parsed = parseFloat(p);
        if (Number.isNaN(parsed)) return null;
        acc += parsed;
    }
    return acc;
};

const UpdateCustomerBalancesComponent = ({ onUpdate }: UpdateCustomerBalancesComponentProps) => {
    const theme = useTheme();
    const params = useParams();
    const customerId: number | null = params.customerId ? Number(params.customerId) : null;

    const [balances, setBalances] = useState<CustomerBalanceEntryDto[]>([]);
    const [rawInputs, setRawInputs] = useState<Record<number, string>>({});

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

    const fetchCustomerBalances = useCallback(() => {
        if (!customerId) return;

        CustomersApiClient.getCustomerBalanceById(customerId).then((balancesResp) => {
            if (balancesResp) {
                setBalances(balancesResp.entries);

                const entriesForForm = balancesResp.entries.map((entry) => ({
                    materialId: entry.materialId,
                    newValue: entry.value,
                }));

                const raw: Record<number, string> = {};
                balancesResp.entries.forEach((e, idx) => {
                    raw[idx] = String(e.value ?? '');
                });
                setRawInputs(raw);

                reset({
                    description: '',
                    entries: entriesForForm,
                });
            }
        });
    }, [customerId, reset]);

    useEffect(() => {
        fetchCustomerBalances();
    }, [fetchCustomerBalances]);

    const handleRawInputChange = (index: number, value: string) => {
        setRawInputs((prev) => ({ ...prev, [index]: value }));
    };

    const onSubmit = (data: UpdateCustomerBalancesFormData) => {
        if (!customerId) return;

        const payloadEntries = (balances || []).map((entry, idx) => {
            const raw = rawInputs[idx];
            const evaluated = raw !== undefined ? evaluateExpression(raw) : null;

            const finalNumber =
                evaluated !== null && evaluated !== undefined
                    ? evaluated
                    : (data.entries?.[idx]?.newValue ?? 0);

            return {
                materialId: entry.materialId,
                newValue: finalNumber,
            };
        });

        const hasInvalid = payloadEntries.some(
            (e) => typeof e.newValue !== 'number' || Number.isNaN(e.newValue),
        );
        if (hasInvalid) {
            showToast('Некоректне значення в одному або більше полів', 'error');
            return;
        }

        CustomersApiClient.updateCustomerBalance(customerId, {
            description: data.description,
            entries: payloadEntries,
        })
            .then(() => {
                showToast('Баланс клієнта був успішно оновлений');
                clearErrors();
                fetchCustomerBalances();
            })
            .catch((err) => {
                console.error(err);
                showToast('Не вдалось оновити баланс клієнта', 'error');
            })
            .finally(() => {
                onUpdate();
            });
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
                const rawValue = rawInputs[index] ?? String(entry.value ?? '');

                const evaluated = evaluateExpression(rawValue);

                return (
                    <FormControl fullWidth key={key}>
                        <FormLabel htmlFor={`material-${key}`}>
                            {`${entry.materialName ?? ''} ${entry.materialId ? '(г)' : ''}`}
                        </FormLabel>

                        <TextField
                            id={`material-${key}`}
                            fullWidth
                            type="text"
                            margin="normal"
                            placeholder="e.g. 100+10 or 50-5"
                            value={rawValue}
                            onChange={(e) => handleRawInputChange(index, e.target.value)}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />

                        <Typography variant="caption" sx={{ marginLeft: '4px', minHeight: 20 }}>
                            {rawValue.trim() === '' ? (
                                <span style={{ color: '#666' }}>
                                    Поточне значення: {entry.value}
                                </span>
                            ) : evaluated === null ? (
                                <span style={{ color: '#c43' }}>Невірний вираз</span>
                            ) : (
                                <span style={{ color: '#666' }}>= {evaluated}</span>
                            )}
                        </Typography>

                        <input
                            type="hidden"
                            {...register(`entries.${index}.newValue`, {
                                valueAsNumber: true,
                                setValueAs: (v) =>
                                    typeof v === 'string' && v !== '' ? parseFloat(v) || 0 : v,
                            })}
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
