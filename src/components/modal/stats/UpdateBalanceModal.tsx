import { styled, useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import type { MaterialDto } from '../../../dto/materials.ts';
import { useEffect, useState } from 'react';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';
import { Box, Button, FormHelperText, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import {
    type UpdateGlobalBalancesFormData,
    updateGlobalBalancesSchema,
} from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from '../../common/Toast.tsx';

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

export interface UpdateBalanceModalProps {
    onUpdate: () => void;
    isOpen: boolean;
    handleClose: () => void;
}

const UpdateBalanceModal = ({ onUpdate, handleClose, isOpen }: UpdateBalanceModalProps) => {
    const theme = useTheme();

    const [materials, setMaterials] = useState<MaterialDto[]>([]);

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<UpdateGlobalBalancesFormData>({
        resolver: zodResolver(updateGlobalBalancesSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            description: '',
            entries: [],
        },
    });

    const onSubmit = (data: UpdateGlobalBalancesFormData) => {
        const filteredEntries = data.entries.filter((entry) => entry.delta !== 0);

        if (filteredEntries.length === 0) {
            showToast('Внесіть зміну хоча б в одному полі, щоб продовжити', 'error');
            return;
        }

        const filteredData = {
            ...data,
            entries: filteredEntries,
        };

        console.log('Submitting global balance update:', filteredData);
        clearErrors();
        // TODO: Implement API call to update global balances
        onUpdate();
        handleClose();
    };

    useEffect(() => {
        MaterialsApiClient.getAll()
            .then((data) => {
                const materialsData = data ?? [];
                setMaterials(materialsData);

                const entries = [
                    { materialId: null, delta: 0 },
                    ...materialsData.map((material) => ({
                        materialId: material.id,
                        delta: 0,
                    })),
                ];

                reset({
                    description: '',
                    entries: entries,
                });
            })
            .catch((err) => {
                showToast('Не вдалось оновити баланс компанії', 'error');
                console.log(err);
            });
    }, [reset]);

    return (
        <BootstrapDialog onClose={handleClose} aria-labelledby="create-work-unit" open={isOpen}>
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
                    Оновлення балансу
                </Typography>

                <Box mt={4}>
                    <Typography>Валюта (грн)</Typography>
                    <TextField
                        type="number"
                        fullWidth
                        slotProps={{
                            htmlInput: {
                                step: 0.001,
                            },
                        }}
                        {...register('entries.0.delta', {
                            valueAsNumber: true,
                            setValueAs: (value) => parseFloat(value) || 0,
                        })}
                        error={!!errors.entries?.[0]?.delta}
                    />
                    <FormHelperText
                        error={!!errors.entries?.[0]?.delta}
                        sx={{
                            margin: 0,
                            marginBottom: theme.spacing(2),
                            minHeight: '30px',
                        }}
                    >
                        {errors.entries?.[0]?.delta?.message || ''}
                    </FormHelperText>
                </Box>

                {materials.map((material, index) => {
                    const displayIndex = index + 1;

                    return (
                        <Box mt={4} key={material.id}>
                            <Typography>{material.name} (г)</Typography>
                            <TextField
                                type="number"
                                fullWidth
                                slotProps={{
                                    htmlInput: {
                                        step: 0.001,
                                    },
                                }}
                                {...register(`entries.${displayIndex}.delta`, {
                                    valueAsNumber: true,
                                    setValueAs: (value) => parseFloat(value) || 0,
                                })}
                                error={!!errors.entries?.[displayIndex]?.delta}
                            />
                            <FormHelperText
                                error={!!errors.entries?.[displayIndex]?.delta}
                                sx={{
                                    margin: 0,
                                    marginBottom: theme.spacing(2),
                                    minHeight: '30px',
                                }}
                            >
                                {errors.entries?.[displayIndex]?.delta?.message || ''}
                            </FormHelperText>
                        </Box>
                    );
                })}

                <Box mt={4}>
                    <Typography>Опис</Typography>
                    <TextField
                        type="text"
                        fullWidth
                        multiline
                        minRows={4}
                        {...register('description')}
                        error={!!errors.description}
                    />
                    <FormHelperText
                        error={true}
                        sx={{
                            margin: 0,
                            marginBottom: theme.spacing(2),
                            minHeight: '30px',
                        }}
                    >
                        {errors.description ? errors.description.message : ''}
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

export default UpdateBalanceModal;
