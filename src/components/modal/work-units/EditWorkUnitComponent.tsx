import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { WorkUnitDto } from '../../../dto/work-units.ts';
import { updateWorkUnitSchema, type UpdateWorkUnitFormData } from '../../../validation/schemas.ts';
import { useEffect } from 'react';
import { EDIT_MODAL_PAPER_MAX, FORM_HELPER_TEXT_ALIGNED_SX } from '../../../constants/createModalLayout.ts';
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

export interface EditWorkUnitComponentProps {
    open: boolean;
    workUnit?: WorkUnitDto;
    onClose: () => void;
    onSave: (data: UpdateWorkUnitFormData) => void;
}

const getWeightValue = (workUnit?: WorkUnitDto): number => {
    if (!workUnit) {
        return 0;
    }

    if (workUnit.returnedDate) {
        return workUnit.metalReturned ?? 0;
    }

    return workUnit.metalIssued ?? 0;
};

const DEFAULT_DESCRIPTION = 'Немає опису наряду';

const EditWorkUnitComponent = ({ open, workUnit, onClose, onSave }: EditWorkUnitComponentProps) => {
    const hasReturn = !!workUnit?.returnedDate;
    const hasOrder = !!workUnit?.orderId;
    const canEditLoss = hasReturn && hasOrder;
    const canEditDescription = hasReturn && hasOrder;
    const descriptionValue = canEditDescription
        ? (workUnit?.description ?? DEFAULT_DESCRIPTION)
        : undefined;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<UpdateWorkUnitFormData>({
        resolver: zodResolver(updateWorkUnitSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            workUnitId: workUnit?.id ?? 0,
            metalWeight: getWeightValue(workUnit),
            loss: canEditLoss ? (workUnit?.loss ?? 0) : undefined,
            description: descriptionValue,
        },
    });

    useEffect(() => {
        if (!workUnit) {
            return;
        }

        reset({
            workUnitId: workUnit.id,
            metalWeight: getWeightValue(workUnit),
            loss: canEditLoss ? (workUnit.loss ?? 0) : undefined,
            description: descriptionValue,
        });
    }, [workUnit, reset, hasReturn, canEditDescription, canEditLoss, descriptionValue]);

    const handleClose = () => {
        reset({
            workUnitId: workUnit?.id ?? 0,
            metalWeight: getWeightValue(workUnit),
            loss: canEditLoss ? (workUnit?.loss ?? 0) : undefined,
            description: descriptionValue,
        });
        onClose();
    };

    const onSubmit = (data: UpdateWorkUnitFormData) => {
        const payload = hasReturn
            ? {
                  ...data,
                  description: canEditDescription ? data.description : undefined,
                  loss: canEditLoss ? data.loss : undefined,
              }
            : {
                  workUnitId: data.workUnitId,
                  metalWeight: data.metalWeight,
              };
        onSave(payload);
        handleClose();
    };

    if (!workUnit) {
        return null;
    }

    return (
        <BootstrapDialog onClose={handleClose} aria-labelledby="edit-work-unit" open={open}>
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
                    Редагування наряду
                </Typography>
                <Typography variant="body1" textAlign="center" color="text.secondary" mt={1}>
                    ID: {workUnit.id}
                </Typography>

                <Box mt={4}>
                    <Typography>
                        {hasReturn ? 'Повернено металу, г' : 'Видано металу, г'}
                    </Typography>
                    <TextField
                        type="number"
                        fullWidth
                        {...register('metalWeight', { valueAsNumber: true })}
                        error={!!errors.metalWeight}
                        helperText={errors.metalWeight?.message}
                        slotProps={{
                            formHelperText: { sx: FORM_HELPER_TEXT_ALIGNED_SX },
                        }}
                    />
                </Box>

                {canEditLoss && (
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
                )}

                {canEditDescription && (
                    <Box mt={4}>
                        <Typography>Опис</Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            {...register('description')}
                            error={!!errors.description}
                            helperText={errors.description?.message}
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

export default EditWorkUnitComponent;
