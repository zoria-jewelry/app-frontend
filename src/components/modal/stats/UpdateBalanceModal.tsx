import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import type { MaterialDto } from '../../../dto/materials.ts';
import { useEffect, useState } from 'react';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import {
    type UpdateGlobalBalancesFormData,
    updateGlobalBalancesSchema,
} from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from '../../common/Toast.tsx';
import { RhfNumberTextField } from '../../common/RhfNumberTextField.tsx';
import { StatisticsApiClient } from '../../../api/statsApiClient.ts';
import {
    EDIT_MODAL_PAPER_MAX,
    FORM_HELPER_TEXT_ALIGNED_SX,
} from '../../../constants/createModalLayout.ts';

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

export interface UpdateBalanceModalProps {
    onUpdate: () => void;
    isOpen: boolean;
    handleClose: () => void;
}

const UpdateBalanceModal = ({ onUpdate, handleClose, isOpen }: UpdateBalanceModalProps) => {

    const [materials, setMaterials] = useState<MaterialDto[]>([]);

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        control,
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

        StatisticsApiClient.addTransactionInGlobalBalance(filteredData)
            .then(() => {
                showToast('Баланс компанії був успішно оновлений');
                clearErrors();
                onUpdate();
                handleClose();
            })
            .catch((err) => {
                showToast('Не вдалось оновити баланс компанії', 'error');
                console.log(err);
            });
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
                    <RhfNumberTextField
                        name="entries.0.delta"
                        control={control}
                        emptyBlurFallback={0}
                        fullWidth
                        slotProps={{
                            htmlInput: {
                                step: 0.001,
                            },
                        }}
                    />
                </Box>

                {materials.map((material, index) => {
                    const displayIndex = index + 1;

                    return (
                        <Box mt={4} key={material.id}>
                            <Typography>{material.name} (г)</Typography>
                            <RhfNumberTextField
                                name={`entries.${displayIndex}.delta`}
                                control={control}
                                emptyBlurFallback={0}
                                fullWidth
                                slotProps={{
                                    htmlInput: {
                                        step: 0.001,
                                    },
                                }}
                            />
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
                        helperText={errors.description?.message}
                        slotProps={{
                            formHelperText: { sx: FORM_HELPER_TEXT_ALIGNED_SX },
                        }}
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

export default UpdateBalanceModal;
