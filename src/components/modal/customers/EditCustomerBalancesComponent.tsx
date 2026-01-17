import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { useForm } from 'react-hook-form';
import {
    updateCustomerBalancesSchema,
    type UpdateCustomerBalancesFormData,
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
import type { CustomerBalanceEntryDto } from '../../../dto/customers.ts';
import { CustomersApiClient } from '../../../api/customersApiClient.ts';
import { showToast } from '../../common/Toast.tsx';
import { useCallback, useEffect, useState } from 'react';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '40%',
        maxHeight: '80vh',
        padding: theme.spacing(12),
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(10),
        paddingTop: 0,
    },
}));

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

export interface EditCustomerBalancesComponentProps {
    isOpen: boolean;
    handleClose: () => void;
    customerId: number;
    onUpdate: () => void;
}

const EditCustomerBalancesComponent = (props: EditCustomerBalancesComponentProps) => {
    const theme = useTheme();
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
        if (!props.isOpen || !props.customerId) return;

        CustomersApiClient.getCustomerBalanceById(props.customerId).then((balancesResp) => {
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
    }, [props.isOpen, props.customerId, reset]);

    useEffect(() => {
        fetchCustomerBalances();
    }, [fetchCustomerBalances]);

    const handleRawInputChange = (index: number, value: string) => {
        setRawInputs((prev) => ({ ...prev, [index]: value }));
    };

    const handleClose = (): void => {
        clearErrors();
        reset();
        setRawInputs({});
        props.handleClose();
    };

    const onSubmit = (data: UpdateCustomerBalancesFormData) => {
        if (!props.customerId) return;

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

        CustomersApiClient.updateCustomerBalance(props.customerId, {
            description: data.description,
            entries: payloadEntries,
        })
            .then(() => {
                showToast('Баланс клієнта був успішно оновлений');
                clearErrors();
                handleClose();
                props.onUpdate();
            })
            .catch((err) => {
                console.error(err);
                showToast('Не вдалось оновити баланс клієнта', 'error');
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
                    zIndex: 1,
                })}
            >
                <CloseIcon />
            </IconButton>

            {/* Form title */}
            <Typography variant="h3" textAlign="center">
                Оновлення балансу
            </Typography>

            {/* The form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ marginTop: theme.spacing(8) }}
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
                        marginTop: theme.spacing(10),
                    }}
                >
                    <Button variant="contained" color="primary" type="submit">
                        Оновити баланс
                    </Button>
                </FormControl>
            </form>
        </BootstrapDialog>
    );
};

export default EditCustomerBalancesComponent;
