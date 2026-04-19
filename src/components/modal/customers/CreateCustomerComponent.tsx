import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { Button, FormControl, FormLabel, TextField, Typography, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';
import { type CreateCustomerFormData, createCustomerSchema } from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { CustomersApiClient } from '../../../api/customersApiClient.ts';
import { showToast } from '../../common/Toast.tsx';
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

export interface CreateEmployeeComponentProps {
    handleClose: () => void;
    isOpen: boolean;
}

const CreateCustomerComponent = (props: CreateEmployeeComponentProps) => {
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<CreateCustomerFormData>({
        resolver: zodResolver(createCustomerSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            fullName: '',
            phone: '',
        },
    });

    const handleClose = (): void => {
        clearErrors();
        reset();
        props.handleClose();
    };

    const onSubmit = (data: CreateCustomerFormData) => {
        CustomersApiClient.create(data)
            .then(() => {
                showToast('Новий клієнт був успішно доданий');
            })
            .catch((err) => {
                showToast('Не вдалось додати клієнта', 'error');
                console.log(err);
            })
            .finally(() => {
                handleClose();
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
                Додавання клієнта
            </Typography>

            {/* The form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ marginTop: theme.spacing(4) }}
                noValidate
            >
                <FormControl fullWidth>
                    <FormLabel htmlFor="full-name">ПІБ</FormLabel>
                    <TextField
                        id="full-name"
                        placeholder="Шевченко Тарас Григорович"
                        fullWidth
                        margin="dense"
                        defaultValue=""
                        {...register('fullName')}
                        error={!!errors.fullName}
                        helperText={errors.fullName?.message}
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
                    <FormLabel htmlFor="phone-number">Номер телефону</FormLabel>
                    <TextField
                        id="phone-number"
                        placeholder="+380961234567"
                        fullWidth
                        margin="dense"
                        defaultValue=""
                        {...register('phone')}
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
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
                <FormControl
                    fullWidth
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: theme.spacing(2),
                    }}
                >
                    <Button variant="contained" color="primary" type="submit">
                        Додати клієнта
                    </Button>
                </FormControl>
            </form>
        </BootstrapDialog>
    );
};

export default CreateCustomerComponent;
