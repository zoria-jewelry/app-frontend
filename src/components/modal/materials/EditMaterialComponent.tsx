import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type UpdateMaterialFormData, updateMaterialSchema } from '../../../validation/schemas.ts';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';
import { showToast } from '../../common/Toast.tsx';
import { useEffect, useState } from 'react';
import type { MaterialDto } from '../../../dto/materials.ts';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        width: '1000px',
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

export interface EditMaterialComponentProps {
    handleClose: () => void;
    isOpen: boolean;
    materialId: number;
    onUpdate: () => void;
}

const EditMaterialComponent = (props: EditMaterialComponentProps) => {
    const theme = useTheme();
    const [material, setMaterial] = useState<MaterialDto | undefined>();

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<UpdateMaterialFormData>({
        resolver: zodResolver(updateMaterialSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            name: material?.name ?? '',
        },
    });

    useEffect(() => {
        if (props.isOpen && material) {
            reset({
                name: material.name,
            });
        }
    }, [material, reset, props.isOpen]);

    useEffect(() => {
        if (props.isOpen && props.materialId) {
            MaterialsApiClient.getById(props.materialId)
                .then((foundMaterial) => {
                    if (foundMaterial) {
                        setMaterial(foundMaterial);
                    }
                })
                .catch((error) => {
                    console.error('Failed to fetch material:', error);
                    showToast('Не вдалось завантажити інформацію про матеріал', 'error');
                });
        }
    }, [props.isOpen, props.materialId]);

    const handleClose = (): void => {
        clearErrors();
        reset();
        props.handleClose();
    };

    const onSubmit = (data: UpdateMaterialFormData) => {
        MaterialsApiClient.update(props.materialId, data)
            .then(() => {
                showToast('Матеріал було успішно оновлено');
                handleClose();
                props.onUpdate();
            })
            .catch((error) => {
                showToast('Не вдалось оновити матеріал', 'error');
                console.log(error);
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
                })}
            >
                <CloseIcon />
            </IconButton>

            {/* Form title */}
            <Typography variant="h3" textAlign="center">
                Редагування матеріалу
            </Typography>

            {/* The form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ marginTop: theme.spacing(8) }}
                noValidate
            >
                <FormControl fullWidth>
                    <FormLabel htmlFor="name">Назва</FormLabel>
                    <TextField
                        id="name"
                        placeholder="Золото 585"
                        fullWidth
                        margin="normal"
                        defaultValue=""
                        {...register('name')}
                        error={!!errors.name}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
                    <FormHelperText
                        error={!!errors.name}
                        sx={{ margin: 0, marginBottom: theme.spacing(2), minHeight: '30px' }}
                    >
                        {errors?.name?.message}
                    </FormHelperText>
                </FormControl>
                <FormControl
                    fullWidth
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: theme.spacing(2),
                    }}
                >
                    <Button variant="contained" color="primary" type="submit">
                        Зберегти
                    </Button>
                </FormControl>
            </form>
        </BootstrapDialog>
    );
};

export default EditMaterialComponent;
