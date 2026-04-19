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
import { saveMaterialSchema, type SaveMaterialFormData } from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
    EDIT_MODAL_PAPER_MAX,
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
        width: EDIT_MODAL_PAPER_MAX,
        maxWidth: EDIT_MODAL_PAPER_MAX,
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
        handleSubmit,
        reset,
        setValue,
        watch,
        getValues,
        control,
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
        });
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

    useEffect(() => {
        setValue('employeeId', employeeId);
    }, [employeeId, setValue]);

    const onSubmit = (data: SaveMaterialFormData) => {
        onSave(data);
        handleClose();
    };

    const handleClose = () => {
        reset({
            employeeId,
            materialId: 0,
            metalWeight: 0,
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
                        name="metalWeight"
                        control={control}
                        emptyBlurFallback={0}
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

export default SaveMaterialComponent;
