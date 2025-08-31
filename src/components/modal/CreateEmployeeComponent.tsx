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
import { type CreateEmployeeFormData, createEmployeeSchema } from '../../validation/schemas.ts';
import { EmployeesApiClient } from '../../api/employeesApiClient.ts';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        width: '800px',
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
    callback: () => void;
}

const CreateEmployeeComponent = (props: CreateEmployeeComponentProps) => {
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<CreateEmployeeFormData>({
        resolver: zodResolver(createEmployeeSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            name: '',
            phone: '',
        },
    });

    const handleClose = (): void => {
        clearErrors();
        reset();
        props.handleClose();
    };

    const onSubmit = (data: CreateEmployeeFormData) => {
        console.log(data);
        EmployeesApiClient.create(data).then(() => {
            props.callback();
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
                Новий працівник
            </Typography>

            {/* The form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ marginTop: theme.spacing(8) }}
                noValidate
            >
                <FormControl fullWidth>
                    <FormLabel htmlFor="full-name">ПІБ</FormLabel>
                    <TextField
                        id="full-name"
                        placeholder="Шевченко Тарас Григорович"
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
                    <FormLabel htmlFor="phone-number">Номер телефону</FormLabel>
                    <TextField
                        id="phone-number"
                        placeholder="+380961234567"
                        fullWidth
                        margin="normal"
                        defaultValue=""
                        {...register('phone')}
                        error={!!errors.phone}
                        sx={{
                            margin: 0,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
                    <FormHelperText error={!!errors.phone} sx={{ margin: 0, minHeight: '30px' }}>
                        {errors?.phone?.message}
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

export default CreateEmployeeComponent;
