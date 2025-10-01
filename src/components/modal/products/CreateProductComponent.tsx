import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { useForm } from 'react-hook-form';
import { type CreateProductFormData, createProductSchema } from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    OutlinedInput,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import type { ChangeEvent } from 'react';
import { ProductsApiClient } from '../../../api/productsApiClient.ts';
import { showToast } from '../../common/Toast.tsx';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '40%',
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

export interface CreateProductComponentProps {
    isOpen: boolean;
    handleClose: () => void;
    onCreate: () => void;
}

const CreateProductComponent = (props: CreateProductComponentProps) => {
    const theme = useTheme();
    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        setValue,
        formState: { errors },
    } = useForm<CreateProductFormData>({
        resolver: zodResolver(createProductSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            name: '',
            article: '',
            pictureBase64: undefined,
        },
    });

    const handleClose = (): void => {
        clearErrors();
        reset();
        props.handleClose();
    };

    const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setValue('pictureBase64', base64String, { shouldValidate: true });
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = (data: CreateProductFormData) => {
        console.log(data);
        ProductsApiClient.create(data)
            .then(() => {
                handleClose();
                props.onCreate();
            })
            .catch((error) => {
                showToast('Не вдалось додати новий продукт у каталог', 'error');
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
                Новий виріб
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
                        placeholder="Обручка з діамантами"
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
                    <FormLabel htmlFor="article">Артикул</FormLabel>
                    <TextField
                        id="article"
                        placeholder="1102-10015/1(2,0)"
                        fullWidth
                        margin="normal"
                        defaultValue=""
                        {...register('article')}
                        error={!!errors.article}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
                    <FormHelperText
                        error={!!errors.article}
                        sx={{ margin: 0, marginBottom: theme.spacing(2), minHeight: '30px' }}
                    >
                        {errors?.article?.message}
                    </FormHelperText>
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel
                        htmlFor="photo"
                        sx={{
                            color: theme.palette.text.primary,
                            '&.Mui-focused': {
                                color: theme.palette.text.primary,
                            },
                        }}
                    >
                        Фото виробу
                    </FormLabel>
                    <OutlinedInput
                        id="photo"
                        type="file"
                        fullWidth
                        inputProps={{ accept: 'image/*' }}
                        onChange={handlePhotoChange}
                    />
                </FormControl>
                <FormControl
                    fullWidth
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: theme.spacing(10),
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

export default CreateProductComponent;
