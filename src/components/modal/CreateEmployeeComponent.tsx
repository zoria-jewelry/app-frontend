import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
}

const schema = z.object({
    fullName: z.string().nonempty('Це поле є обовʼязковим'),
    phoneNumber: z
        .string()
        .nonempty('Це поле є обовʼязковим')
        .regex(/^\s*(\+38)?\d{10}\s*$/im, { message: 'Неправильний формат' }),
});

type FormData = z.infer<typeof schema>;

const CreateEmployeeComponent = (props: CreateEmployeeComponentProps) => {
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            fullName: '',
            phoneNumber: '',
        },
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
        // TODO: call API Endpoint
        handleClose();
    };

    const handleClose = (): void => {
        clearErrors();
        reset();
        props.handleClose();
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
            <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: theme.spacing(8) }}>
                <FormControl fullWidth>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            height: '28px',
                        }}
                    >
                        <FormLabel htmlFor="full-name">ПІБ</FormLabel>
                        <FormHelperText
                            error={!!errors.fullName}
                            sx={{ margin: 0, textAlign: 'right' }}
                        >
                            {errors?.fullName?.message}
                        </FormHelperText>
                    </Box>
                    <TextField
                        id="full-name"
                        placeholder="Шевченко Тарас Григорович"
                        fullWidth
                        margin="normal"
                        defaultValue=""
                        {...register('fullName')}
                        error={!!errors.fullName}
                        sx={{
                            margin: 0,
                            marginBottom: theme.spacing(4),
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                            },
                        }}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            height: '28px',
                        }}
                    >
                        <FormLabel htmlFor="phone-number">Номер телефону</FormLabel>
                        <FormHelperText
                            error={!!errors.phoneNumber}
                            sx={{ margin: 0, textAlign: 'right' }}
                        >
                            {errors?.phoneNumber?.message}
                        </FormHelperText>
                    </Box>
                    <TextField
                        id="phone-number"
                        placeholder="+380961234567"
                        fullWidth
                        margin="normal"
                        defaultValue=""
                        {...register('phoneNumber')}
                        error={!!errors.phoneNumber}
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
                        marginTop: theme.spacing(8),
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
