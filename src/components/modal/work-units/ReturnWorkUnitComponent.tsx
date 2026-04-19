import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { returnWorkUnitSchema, type ReturnWorkUnitFormData } from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import type { WorkUnitDto } from '../../../dto/work-units.ts';
import {
    FORM_HELPER_TEXT_ALIGNED_SX,
    RETURN_METAL_MODAL_PAPER_MAX,
} from '../../../constants/createModalLayout.ts';
import { RhfNumberTextField } from '../../common/RhfNumberTextField.tsx';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        width: RETURN_METAL_MODAL_PAPER_MAX,
        maxWidth: RETURN_METAL_MODAL_PAPER_MAX,
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

export interface ReturnWorkUnitModalProps {
    workUnit: WorkUnitDto;
    open: boolean;
    onClose: () => void;
    onSave: (data: ReturnWorkUnitFormData) => void;
}

const DEFAULT_DESCRIPTION = 'Немає опису наряду';

const ReturnWorkUnitComponent = ({ workUnit, open, onClose, onSave }: ReturnWorkUnitModalProps) => {
    const requiresDescription = !!workUnit.orderId;
    const descriptionValue = requiresDescription
        ? (workUnit.description ?? DEFAULT_DESCRIPTION)
        : undefined;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<ReturnWorkUnitFormData>({
        resolver: zodResolver(returnWorkUnitSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            workUnitId: workUnit.id,
            metalWeight: undefined,
            loss: undefined,
            description: descriptionValue,
        },
    });

    useEffect(() => {
        reset({
            workUnitId: workUnit.id,
            metalWeight: undefined,
            loss: undefined,
            description: descriptionValue,
        });
    }, [workUnit, requiresDescription, descriptionValue, reset]);

    const handleClose = () => {
        reset({
            workUnitId: workUnit.id,
            metalWeight: undefined,
            loss: undefined,
            description: descriptionValue,
        });
        onClose();
    };

    const onSubmit = (data: ReturnWorkUnitFormData) => {
        const payload = requiresDescription
            ? data
            : {
                  workUnitId: data.workUnitId,
                  metalWeight: data.metalWeight,
                  loss: data.loss,
              };
        onSave(payload);
        handleClose();
    };

    const descriptionError = errors.description ? errors.description.message : undefined;

    return (
        <BootstrapDialog onClose={handleClose} aria-labelledby="return-work-unit" open={open}>
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
                    Прийняття
                </Typography>

                <Box mt={4}>
                    <Typography>Метал, (г)</Typography>
                    <RhfNumberTextField
                        name="metalWeight"
                        control={control}
                        emptyBlurFallback={0}
                        fullWidth
                        slotProps={{ htmlInput: { step: 0.001 } }}
                    />
                </Box>

                <Box mt={4}>
                    <Typography>ПН, %</Typography>
                    <RhfNumberTextField
                        name="loss"
                        control={control}
                        emptyBlurFallback={0}
                        fullWidth
                        slotProps={{ htmlInput: { step: 0.01 } }}
                    />
                </Box>

                {requiresDescription && (
                    <Box mt={4}>
                        <Typography>Опис</Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            {...register('description', {
                                required: requiresDescription ? 'Опис є обовʼязковим' : false,
                            })}
                            error={!!descriptionError}
                            helperText={descriptionError}
                            slotProps={{
                                formHelperText: { sx: FORM_HELPER_TEXT_ALIGNED_SX },
                            }}
                        />
                    </Box>
                )}

                <Box mt={8} display="flex" justifyContent="center">
                    <Button variant="contained" color="primary" type="submit">
                        Зберегти
                    </Button>
                </Box>
            </form>
        </BootstrapDialog>
    );
};

export default ReturnWorkUnitComponent;
