import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Control } from 'react-hook-form';
import type { WorkUnitDto } from '../../../dto/work-units.ts';
import {
    updateWorkUnitSchema,
    type UpdateWorkUnitFormData,
    type UpdateWorkUnitFormInput,
} from '../../../validation/schemas.ts';
import { useEffect } from 'react';
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

/** Blank field when stored weight is 0; still allow typing 0 via `preserveZero`. */
const getWeightValueForForm = (workUnit?: WorkUnitDto): number | undefined => {
    if (!workUnit) {
        return undefined;
    }
    const v = getWeightValue(workUnit);
    return v === 0 ? undefined : v;
};

const getLossForForm = (
    workUnit: WorkUnitDto | undefined,
    canEdit: boolean,
): number | undefined => {
    if (!canEdit || !workUnit) {
        return undefined;
    }
    const l = workUnit.loss;
    if (l === null || l === undefined) {
        return undefined;
    }
    return l === 0 ? undefined : l;
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
    } = useForm<UpdateWorkUnitFormInput, unknown, UpdateWorkUnitFormInput>({
        resolver: zodResolver(updateWorkUnitSchema, undefined, { raw: true }),
        reValidateMode: 'onSubmit',
        defaultValues: {
            workUnitId: workUnit?.id ?? 0,
            metalWeight: getWeightValueForForm(workUnit),
            loss: getLossForForm(workUnit, canEditLoss),
            description: descriptionValue,
        },
    });

    useEffect(() => {
        if (!open || !workUnit) {
            return;
        }

        const canEditLossInner = !!workUnit.returnedDate && !!workUnit.orderId;
        const canEditDescriptionInner = !!workUnit.returnedDate && !!workUnit.orderId;
        const descriptionInner = canEditDescriptionInner
            ? (workUnit.description ?? DEFAULT_DESCRIPTION)
            : undefined;

        reset({
            workUnitId: workUnit.id,
            metalWeight: getWeightValueForForm(workUnit),
            loss: getLossForForm(workUnit, canEditLossInner),
            description: descriptionInner,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset on open / work unit id; not on workUnit reference churn
    }, [open, workUnit?.id, reset]);

    const handleClose = () => {
        reset({
            workUnitId: workUnit?.id ?? 0,
            metalWeight: getWeightValueForForm(workUnit),
            loss: getLossForForm(workUnit, canEditLoss),
            description: descriptionValue,
        });
        onClose();
    };

    const onSubmit = (data: UpdateWorkUnitFormInput) => {
        const metalWeight = (data.metalWeight as number | undefined) ?? 0;
        const lossValue = (data.loss as number | undefined) ?? 0;
        const payload: UpdateWorkUnitFormData = hasReturn
            ? {
                  workUnitId: data.workUnitId,
                  metalWeight,
                  description: canEditDescription ? data.description : undefined,
                  loss: canEditLoss ? lossValue : undefined,
              }
            : {
                  workUnitId: data.workUnitId,
                  metalWeight,
              };
        onSave(payload);
        handleClose();
    };

    if (!workUnit) {
        return null;
    }

    const numberControl = control as Control<UpdateWorkUnitFormInput>;

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
                    <RhfNumberTextField
                        name="metalWeight"
                        control={numberControl}
                        preserveZero
                        fullWidth
                        slotProps={{
                            htmlInput: { step: 0.001 },
                            formHelperText: { sx: FORM_HELPER_TEXT_ALIGNED_SX },
                        }}
                    />
                </Box>

                {canEditLoss && (
                    <Box mt={4}>
                        <Typography>ПН, %</Typography>
                        <RhfNumberTextField
                            name="loss"
                            control={numberControl}
                            preserveZero
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
