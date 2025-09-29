import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import type { MaterialDto } from '../../../dto/materials.ts';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';
import { saveMaterialSchema, type SaveMaterialFormData } from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '40%',
        minHeight: '40%',
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

export interface SaveMaterialComponentProps {
    open: boolean;
    employeeId: number;
    employeeName: string;
    onClose: () => void;
    onSave: (data: SaveMaterialFormData) => void;
}

const SaveMaterialComponent = ({
    open,
    employeeId,
    employeeName,
    onClose,
    onSave,
}: SaveMaterialComponentProps) => {
    const theme = useTheme();

    const [metals, setMetals] = useState<MaterialDto[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SaveMaterialFormData>({
        resolver: zodResolver(saveMaterialSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            employeeId,
            materialId: 0,
            metalWeight: 0,
        },
    });

    useEffect(() => {
        MaterialsApiClient.getAll().then((ms) => {
            setMetals(ms ?? []);
            if (ms && ms.length > 0) {
                setValue('materialId', ms[0].id);
            }
        });
    }, [setValue]);

    const onSubmit = (data: SaveMaterialFormData) => {
        onSave(data);
        handleClose();
    };

    const handleClose = () => {
        reset({
            employeeId: 0,
            materialId: 0,
            metalWeight: 0,
        });
        onClose();
    };

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
                    Повернення матеріалу без видачі
                </Typography>

                <Typography variant="body1" textAlign="center">
                    Працівник – {employeeName}
                </Typography>

                <Box mt={4}>
                    <Typography>Матеріал</Typography>
                    <FormControl fullWidth error={!!errors.materialId}>
                        <Select
                            fullWidth
                            value={watch('materialId') || ''}
                            onChange={(e) => setValue('materialId', Number(e.target.value))}
                            displayEmpty
                        >
                            <MenuItem value="">Оберіть матеріал</MenuItem>
                            {metals.map((m) => (
                                <MenuItem key={m.id} value={m.id}>
                                    {m.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText
                            error={true}
                            sx={{
                                margin: 0,
                                marginBottom: theme.spacing(2),
                                minHeight: '30px',
                            }}
                        >
                            {errors.materialId ? errors.materialId.message : ''}
                        </FormHelperText>
                    </FormControl>
                </Box>

                <Box mt={4}>
                    <Typography>Вага (г)</Typography>
                    <TextField
                        type="number"
                        fullWidth
                        {...register('metalWeight', { valueAsNumber: true })}
                        error={!!errors.metalWeight}
                    />
                    <FormHelperText
                        error={true}
                        sx={{
                            margin: 0,
                            marginBottom: theme.spacing(2),
                            minHeight: '30px',
                        }}
                    >
                        {errors.metalWeight ? errors.metalWeight.message : ''}
                    </FormHelperText>
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

export default SaveMaterialComponent;
