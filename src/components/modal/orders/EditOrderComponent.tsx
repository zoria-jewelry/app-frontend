import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import {
    Avatar,
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography,
    useTheme,
    Autocomplete,
    Box,
    Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUpdateOrderSchema, type UpdateOrderFormData } from '../../../validation/schemas.ts';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import type { MaterialDto } from '../../../dto/materials.ts';
import type { EmployeeDto } from '../../../dto/employees.ts';
import type { ProductEntryDto } from '../../../dto/products.ts';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';
import { EmployeesApiClient } from '../../../api/employeesApiClient.ts';
import { ProductsApiClient } from '../../../api/productsApiClient.ts';
import ListItemText from '@mui/material/ListItemText';
import type { OrderDto } from '../../../dto/orders.ts';
import { OrdersApiClient } from '../../../api/ordersApiClient.ts';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(6),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '90vw',
        padding: theme.spacing(12),
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
    },
}));

export interface EditOrderComponentProps {
    orderId: number;
    handleClose: () => void;
    open: boolean;
    callback: () => void;
}

const EditOrderComponent = (props: EditOrderComponentProps) => {
    const theme = useTheme();
    const [order, setOrder] = useState<OrderDto | undefined>();

    const products = order?.products?.map((p) => ({
        productId: p.productId,
        size: p.size,
        count: p.count,
        notes: p.notes ?? undefined,
    }));

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        control,
        formState: { errors },
    } = useForm<UpdateOrderFormData>({
        resolver: zodResolver(createUpdateOrderSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            materialId: order?.materialId,
            workPrice: order?.workPrice,
            products,
            executorsIds: order?.executorsIds,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'products',
    });

    const [materials, setMaterials] = useState<MaterialDto[]>([]);
    const [employees, setEmployees] = useState<EmployeeDto[]>([]);
    const [jewelryProducts, setJewelryProducts] = useState<ProductEntryDto[]>([]);
    const [searchPhrase, setSearchPhrase] = useState('');

    const handleClose = (): void => {
        clearErrors();
        reset();
        props.handleClose();
    };

    const onSubmit = (data: UpdateOrderFormData) => {
        console.log('Submit order update:', data);
        OrdersApiClient.change(props.orderId, data)
            .then(() => {
                // TODO: add toast
                handleClose();
                props.callback();
            })
            .catch((err) => {
                // TODO: add toast
                console.log(err);
            });
    };

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const [materialsData, employeesData, orderData] = await Promise.all([
                    MaterialsApiClient.getAll(),
                    EmployeesApiClient.getAllActive(),
                    OrdersApiClient.getById(props.orderId),
                ]);

                if (cancelled) return;

                if (materialsData) setMaterials(materialsData);
                if (employeesData) setEmployees(employeesData);

                if (orderData) {
                    setOrder(orderData);
                    reset({
                        materialId: orderData.materialId,
                        workPrice: orderData.workPrice,
                        products: orderData.products.map((p) => ({
                            productId: p.productId,
                            size: p.size,
                            count: p.count,
                            notes: p.notes ?? undefined,
                        })),
                        executorsIds: orderData.executorsIds,
                    });
                }
            } catch (err) {
                console.error('Failed to load order data', err);
            }
        }

        loadData();

        return () => {
            cancelled = true;
        };
    }, [props.orderId, reset]);

    useEffect(() => {
        let cancelled = false;

        ProductsApiClient.getAll(searchPhrase).then((data) => {
            if (!cancelled && data) setJewelryProducts(data);
        });

        return () => {
            cancelled = true;
        };
    }, [searchPhrase]);

    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.open}
        >
            <IconButton
                aria-label="close"
                onClick={handleClose}
                size="large"
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>

            <Typography variant="h4" textAlign="center" gutterBottom>
                Редагування замовлення №{props.orderId}
            </Typography>

            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ marginTop: theme.spacing(4) }}
                noValidate
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        width: '100%',
                        overflowX: 'auto',
                    }}
                >
                    <FormControl sx={{ flex: 1, minWidth: 250 }}>
                        <FormLabel>Метал</FormLabel>
                        <Controller
                            control={control}
                            name="materialId"
                            render={({ field }) => (
                                <Autocomplete
                                    value={materials.find((m) => m.id === field.value) || null}
                                    onChange={(_, value) => field.onChange(value?.id)}
                                    options={materials}
                                    getOptionLabel={(option) => option.name}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            )}
                        />
                        <FormHelperText error={!!errors.materialId}>
                            {errors?.materialId?.message as string}
                        </FormHelperText>
                    </FormControl>

                    <FormControl sx={{ flex: 1, minWidth: 250 }}>
                        <FormLabel>Вартість роботи (грн за г)</FormLabel>
                        <TextField
                            type="number"
                            fullWidth
                            {...register('workPrice', { valueAsNumber: true })}
                            error={!!errors.workPrice}
                        />
                        <FormHelperText error={!!errors.workPrice}>
                            {errors?.workPrice?.message}
                        </FormHelperText>
                    </FormControl>
                </Box>

                <Typography variant="h6" mt={8}>
                    Позиції замовлення
                </Typography>

                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    {fields.map((field, index) => (
                        <Box
                            key={field.id}
                            sx={{
                                display: 'flex',
                                gap: 2,
                                alignItems: 'flex-start',
                                width: '100%',
                                minWidth: 700,
                                mt: 2,
                            }}
                        >
                            <Controller
                                control={control}
                                name={`products.${index}.productId`}
                                render={({ field }) => (
                                    <Autocomplete
                                        options={jewelryProducts}
                                        noOptionsText="Нічого не знайдено"
                                        getOptionLabel={(option) => option.name}
                                        onInputChange={(_, value) => setSearchPhrase(value)}
                                        value={
                                            jewelryProducts.find((p) => p.id === field.value) ||
                                            null
                                        }
                                        onChange={(_, value) =>
                                            field.onChange(value ? value.id : undefined)
                                        }
                                        sx={{ flex: 3, minWidth: '40%' }}
                                        renderOption={(props, option) => (
                                            <li {...props} key={option.id}>
                                                {option.pictureUrl ? (
                                                    <Avatar
                                                        src={option.pictureUrl}
                                                        sx={{ width: 50, height: 50, mr: 4 }}
                                                    />
                                                ) : (
                                                    <Avatar
                                                        src="/unknown-product.png"
                                                        sx={{ width: 50, height: 50, mr: 4 }}
                                                    />
                                                )}
                                                {option.name}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Виберіть виріб"
                                                error={!!errors.products?.[index]?.productId}
                                            />
                                        )}
                                    />
                                )}
                            />

                            <TextField
                                type="number"
                                placeholder="Розмір"
                                {...register(`products.${index}.size`, { valueAsNumber: true })}
                                error={!!errors.products?.[index]?.size}
                                sx={{ flex: 0.5, minWidth: 100 }}
                            />

                            <TextField
                                type="number"
                                placeholder="К-ть"
                                {...register(`products.${index}.count`, { valueAsNumber: true })}
                                error={!!errors.products?.[index]?.count}
                                sx={{ flex: 0.5, minWidth: 100 }}
                            />

                            <TextField
                                placeholder="Примітки"
                                {...register(`products.${index}.notes`)}
                                error={!!errors.products?.[index]?.notes}
                                sx={{ flex: 2 }}
                                multiline
                                maxRows={4}
                            />

                            <IconButton onClick={() => remove(index)} sx={{ alignSelf: 'center' }}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <FormHelperText error={!!errors.products}>
                        {errors.products?.root?.message || errors.products?.message}
                    </FormHelperText>
                </Box>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                        append({
                            productId: null,
                            size: null,
                            count: null,
                            notes: '',
                        })
                    }
                    sx={{ mt: 2, mb: 8 }}
                >
                    Додати позицію
                </Button>

                <FormControl fullWidth margin="normal">
                    <FormLabel>Виконавці</FormLabel>
                    <Controller
                        control={control}
                        name="executorsIds"
                        render={({ field, fieldState }) => (
                            <Select
                                {...field}
                                fullWidth
                                multiple
                                value={field.value || []}
                                error={!!fieldState.error}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                        typeof value === 'string'
                                            ? value.split(',').map(Number)
                                            : value,
                                    );
                                }}
                                renderValue={(selected) => {
                                    if (!selected || selected.length === 0) return 'Виконавець';
                                    return employees
                                        .filter((emp) => selected.includes(emp.id))
                                        .map((emp) => emp.name)
                                        .join(', ');
                                }}
                            >
                                {employees.map((emp) => (
                                    <MenuItem key={emp.id} value={emp.id}>
                                        <Checkbox
                                            checked={field.value?.includes(emp.id) || false}
                                        />
                                        <ListItemText primary={emp.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                    <FormHelperText error={!!errors.executorsIds}>
                        {errors?.executorsIds?.message as string}
                    </FormHelperText>
                </FormControl>

                <Box width="100%" display="flex" justifyContent="center">
                    <Button variant="contained" color="primary" type="submit" sx={{ mt: 4 }}>
                        Зберегти зміни
                    </Button>
                </Box>
            </form>
        </BootstrapDialog>
    );
};

export default EditOrderComponent;
