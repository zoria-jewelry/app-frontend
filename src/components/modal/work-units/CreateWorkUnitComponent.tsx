import { useEffect, useLayoutEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    MenuItem,
    Select,
    Typography,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import type { MaterialDto } from '../../../dto/materials.ts';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';
import { OrdersApiClient } from '../../../api/ordersApiClient.ts';
import {
    createWorkUnitSchema,
    type CreateWorkUnitFormData,
    type CreateWorkUnitFormInput,
} from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
    CREATE_MODAL_PAPER_MAX,
    FORM_HELPER_TEXT_ALIGNED_SX,
} from '../../../constants/createModalLayout.ts';
import { RhfNumberTextField } from '../../common/RhfNumberTextField.tsx';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        width: CREATE_MODAL_PAPER_MAX,
        maxWidth: CREATE_MODAL_PAPER_MAX,
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

export interface CreateWorkUnitModalProps {
    open: boolean;
    employeeId: number;
    employeeName: string;
    onClose: () => void;
    onSave: (data: CreateWorkUnitFormData) => void;
}

const CreateWorkUnitComponent = ({
    open,
    employeeId,
    employeeName,
    onClose,
    onSave,
}: CreateWorkUnitModalProps) => {
    const theme = useTheme();

    const [metals, setMetals] = useState<MaterialDto[]>([]);
    const [activeOrderIds, setActiveOrderIds] = useState<number[]>([]);

    const {
        handleSubmit,
        reset,
        setValue,
        watch,
        getValues,
        control,
        formState: { errors },
    } = useForm<CreateWorkUnitFormInput, unknown, CreateWorkUnitFormData>({
        resolver: zodResolver(createWorkUnitSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            employeeId,
            orderId: undefined,
            materialId: 0,
            weight: undefined,
        },
    });

    useEffect(() => {
        setValue('employeeId', employeeId);
    }, [employeeId, setValue]);

    useEffect(() => {
        MaterialsApiClient.getAll().then((ms) => {
            setMetals(ms ?? []);
        });
        OrdersApiClient.getAllActiveIds().then((ids) => setActiveOrderIds(ids ?? []));
    }, []);

    useLayoutEffect(() => {
        if (!open || metals.length === 0) {
            return;
        }
        const id = getValues('materialId');
        if (!id || !metals.some((m) => m.id === id)) {
            setValue('materialId', metals[0].id);
        }
    }, [open, metals, getValues, setValue]);

    const onSubmit = (data: CreateWorkUnitFormData) => {
        onSave(data);
        handleClose();
    };

    const handleClose = () => {
        reset({
            employeeId,
            orderId: undefined,
            materialId: 0,
            weight: undefined,
        });
        onClose();
    };

    const materialIdWatched = watch('materialId');
    const metalSelectValue =
        metals.length === 0
            ? ''
            : metals.some((m) => m.id === materialIdWatched)
              ? materialIdWatched
              : metals[0].id;

    return (
        <BootstrapDialog onClose={handleClose} aria-labelledby="create-work-unit" open={open}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                <Typography variant="h3" textAlign="center">
                    Нова видача
                </Typography>

                <Typography variant="body1" textAlign="center">
                    Працівник – {employeeName}
                </Typography>

                <Box mt={4}>
                    <Typography>Замовлення (№)</Typography>
                    <FormControl fullWidth error={!!errors.orderId}>
                        <Select
                            fullWidth
                            value={watch('orderId') || ''}
                            onChange={(e) =>
                                setValue(
                                    'orderId',
                                    e.target.value ? Number(e.target.value) : undefined,
                                )
                            }
                            displayEmpty
                        >
                            <MenuItem value="">Оберіть замовлення</MenuItem>
                            {activeOrderIds.map((id) => (
                                <MenuItem key={id} value={id}>
                                    {id}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText
                            error={true}
                            sx={{ ...FORM_HELPER_TEXT_ALIGNED_SX, marginBottom: theme.spacing(1) }}
                        >
                            {errors.orderId ? errors.orderId.message : ''}
                        </FormHelperText>
                    </FormControl>
                </Box>

                <Box mt={4}>
                    <Typography>Метал</Typography>
                    <FormControl fullWidth error={!!errors.materialId}>
                        <Select
                            fullWidth
                            disabled={metals.length === 0}
                            value={metalSelectValue}
                            onChange={(e) => setValue('materialId', Number(e.target.value))}
                        >
                            {metals.map((m) => (
                                <MenuItem key={m.id} value={m.id}>
                                    {m.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText
                            error={true}
                            sx={{ ...FORM_HELPER_TEXT_ALIGNED_SX, marginBottom: theme.spacing(1) }}
                        >
                            {errors.materialId ? errors.materialId.message : ''}
                        </FormHelperText>
                    </FormControl>
                </Box>

                <Box mt={4}>
                    <Typography>Вага (г)</Typography>
                    <RhfNumberTextField
                        name="weight"
                        control={control}
                        preserveZero
                        fullWidth
                        slotProps={{ htmlInput: { step: 0.001 } }}
                    />
                </Box>

                <Box mt={8} display="flex" justifyContent="center">
                    <Button variant="contained" color="primary" type="submit">
                        Зберегти
                    </Button>
                </Box>
            </form>
        </BootstrapDialog>
    );
};

export default CreateWorkUnitComponent;
