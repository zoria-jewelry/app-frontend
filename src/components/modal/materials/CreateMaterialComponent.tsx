import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Button, FormControl, FormLabel, TextField, Typography, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type CreateMaterialFormData, createMaterialSchema } from '../../../validation/schemas.ts';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';
import { showToast } from '../../common/Toast.tsx';
import { RhfNumberTextField } from '../../common/RhfNumberTextField.tsx';
import {
    CREATE_MODAL_PAPER_MAX,
    FORM_HELPER_TEXT_ALIGNED_SX,
} from '../../../constants/createModalLayout.ts';

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

export interface CreateMaterialComponentProps {
    handleClose: () => void;
    isOpen: boolean;
    onCreate: () => void;
}

const CreateMaterialComponent = (props: CreateMaterialComponentProps) => {
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        control,
        formState: { errors },
    } = useForm<CreateMaterialFormData>({
        resolver: zodResolver(createMaterialSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            name: '',
            price: 0,
        },
    });

    const handleClose = (): void => {
        clearErrors();
        reset();
        props.handleClose();
    };

    const onSubmit = (data: CreateMaterialFormData) => {
        MaterialsApiClient.create(data)
            .then(props.onCreate)
            .catch((error) => {
                showToast('Не вдалось створити новий матеріал', 'error');
                console.log(error);
            });
        handleClose();
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
                Новий матеріал
            </Typography>

            {/* The form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ marginTop: theme.spacing(4) }}
                noValidate
            >
                <FormControl fullWidth>
                    <FormLabel htmlFor="name">Назва</FormLabel>
                    <TextField
                        id="name"
                        placeholder="Золото 585"
                        fullWidth
                        margin="dense"
                        defaultValue=""
                        {...register('name')}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        slotProps={{
                            formHelperText: { sx: FORM_HELPER_TEXT_ALIGNED_SX },
                        }}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel htmlFor="price">Вартість (грн за г)</FormLabel>
                    <RhfNumberTextField
                        name="price"
                        control={control}
                        emptyBlurFallback={0}
                        id="price"
                        placeholder="1234.00"
                        fullWidth
                        margin="dense"
                        slotProps={{
                            htmlInput: { step: 0.01 },
                        }}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
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

export default CreateMaterialComponent;
