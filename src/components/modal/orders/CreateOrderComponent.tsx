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
import { type CreateOrderFormData, createUpdateOrderSchema } from '../../../validation/schemas.ts';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import type { MaterialDto } from '../../../dto/materials.ts';
import type { EmployeeDto } from '../../../dto/employees.ts';
import type { ProductEntryDto } from '../../../dto/products.ts';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';
import { EmployeesApiClient } from '../../../api/employeesApiClient.ts';
import { ProductsApiClient } from '../../../api/productsApiClient.ts';
import ListItemText from '@mui/material/ListItemText';
import { OrdersApiClient } from '../../../api/ordersApiClient.ts';
import { showToast } from '../../common/Toast.tsx';

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

export interface CreateOrderComponentProps {
    clientId: number;
    handleClose: () => void;
    isOpen: boolean;
    onCreate: () => void;
}

const CreateOrderComponent = (props: CreateOrderComponentProps) => {
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        control,
        formState: { errors },
    } = useForm<CreateOrderFormData>({
        resolver: zodResolver(createUpdateOrderSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            materialId: 0,
            workPrice: 0,
            products: [],
            executorsIds: [],
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

    useEffect(() => {
        MaterialsApiClient.getAll().then((data) => data && setMaterials(data));
        EmployeesApiClient.getAllActive().then((data) => data && setEmployees(data));
    }, []);

    useEffect(() => {
        ProductsApiClient.getAll(searchPhrase).then((data) => data && setJewelryProducts(data));
    }, [searchPhrase]);

    const handleClose = (): void => {
        clearErrors();
        reset();
        props.handleClose();
    };

    const onSubmit = (data: CreateOrderFormData) => {
        data.clientId = props.clientId;
        console.log('Submit:', data);
        OrdersApiClient.create(data)
            .then(() => {
                showToast('Замовлення було успішно створене');
                props.onCreate();
                handleClose();
            })
            .catch((err) => {
                showToast('Не вдалось створити замовлення', 'error');
                console.log(err);
            });
    };

    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.isOpen}
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
                Створення нового замовлення
            </Typography>

            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ marginTop: theme.spacing(4) }}
                noValidate
            >
                {/* Metal + Work price in one row */}
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        width: '100%',
                        overflowX: 'auto',
                    }}
                >
                    {/* Metal */}
                    <FormControl sx={{ flex: 1, minWidth: 250 }}>
                        <FormLabel>Метал</FormLabel>
                        <Controller
                            control={control}
                            name="materialId"
                            render={({ field }) => (
                                <Select {...field} fullWidth>
                                    {materials.map((m) => (
                                        <MenuItem key={m.id} value={m.id}>
                                            {m.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        <FormHelperText error={!!errors.materialId}>
                            {errors?.materialId?.message as string}
                        </FormHelperText>
                    </FormControl>

                    {/* Work price */}
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

                {/* products */}
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
                            {/* Product */}
                            <Controller
                                control={control}
                                name={`products.${index}.productId`}
                                render={({ field }) => (
                                    <Autocomplete
                                        options={jewelryProducts}
                                        noOptionsText="Нічого не знайдено"
                                        getOptionLabel={(option) => option.name}
                                        onInputChange={(_, value) => setSearchPhrase(value)}
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

                            {/* Size */}
                            <TextField
                                type="number"
                                placeholder="Розмір"
                                {...register(`products.${index}.size`, { valueAsNumber: true })}
                                error={!!errors.products?.[index]?.size}
                                sx={{ flex: 0.5, minWidth: 100 }}
                            />

                            {/* Quantity */}
                            <TextField
                                type="number"
                                placeholder="К-ть"
                                {...register(`products.${index}.count`, { valueAsNumber: true })}
                                error={!!errors.products?.[index]?.count}
                                sx={{ flex: 0.5, minWidth: 100 }}
                            />

                            {/* Notes */}
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

                {/* Executors */}
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

                {/* Save button */}
                <Box width="100%" display="flex" justifyContent="center">
                    <Button variant="contained" color="primary" type="submit" sx={{ mt: 4 }}>
                        Зберегти
                    </Button>
                </Box>
            </form>
        </BootstrapDialog>
    );
};

export default CreateOrderComponent;
