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
import { type CreateMaterialFormData, createMaterialSchema } from '../../../validation/schemas.ts';
import { MaterialsApiClient } from '../../../api/materialsApiClient.ts';

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

export interface CreateMaterialComponentProps {
    handleClose: () => void;
    isOpen: boolean;
    callback: () => void;
}

const CreateMaterialComponent = (props: CreateMaterialComponentProps) => {
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
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
            .then(props.callback)
            .catch((error) => {
                console.log(error);
                // TODO: add toast
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
                <FormControl fullWidth>
                    <FormLabel htmlFor="price">Вартість (грн за г)</FormLabel>
                    <TextField
                        id="price"
                        placeholder="1234.00"
                        type="number"
                        fullWidth
                        margin="normal"
                        defaultValue=""
                        {...register('price', { valueAsNumber: true })}
                        error={!!errors.price}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
                    <FormHelperText error={!!errors.price} sx={{ margin: 0, minHeight: '30px' }}>
                        {errors?.price?.message}
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

export default CreateMaterialComponent;
