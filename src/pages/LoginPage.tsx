import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Paper,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import paperStyles from '../styles/Paper.module.css';
import { useForm } from 'react-hook-form';
import { type SigninFormData, signinSchema } from '../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';

const LoginPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SigninFormData>({
        resolver: zodResolver(signinSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: SigninFormData) => {
        setIsLoading((prev) => !prev);
        setTimeout(() => {
            setIsLoading((prev) => !prev);
            navigate('/materials'); // TODO: change to '/statistics' for owner and '/work-units' for manager
        }, 3000);
        console.log(data);
        // TODO: call API endpoint and set new auth context
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(90deg, rgba(255, 255, 255) 0%, #b7cfd2 100%)',
            }}
        >
            <Paper
                className={paperStyles.paper}
                sx={{
                    maxWidth: '500px',
                    borderRadius: '25px',
                }}
            >
                <Typography variant="h3" sx={{ textAlign: 'center', marginTop: theme.spacing(8) }}>
                    З поверненням!
                </Typography>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{ padding: theme.spacing(4), margin: 0 }}
                    noValidate
                >
                    <FormControl
                        fullWidth
                        sx={{
                            margin: 0,
                            marginTop: theme.spacing(8),
                        }}
                    >
                        <FormLabel htmlFor="email" sx={{ marginBottom: theme.spacing(2) }}>
                            Електронна адреса
                        </FormLabel>
                        <TextField
                            id="email"
                            type="email"
                            placeholder="zoriia@gmail.com"
                            fullWidth
                            margin="normal"
                            defaultValue=""
                            {...register('email')}
                            error={!!errors.email}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        <FormHelperText
                            error={!!errors.email}
                            sx={{ margin: 0, marginBottom: theme.spacing(2), minHeight: '30px' }}
                        >
                            {errors.email?.message}
                        </FormHelperText>
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel htmlFor="password" sx={{ marginBottom: theme.spacing(2) }}>
                            Пароль
                        </FormLabel>
                        <TextField
                            id="password"
                            type="password"
                            placeholder="••••••••••"
                            fullWidth
                            margin="normal"
                            defaultValue=""
                            {...register('password')}
                            error={!!errors.password}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        <FormHelperText
                            error={!!errors.password}
                            sx={{ margin: 0, minHeight: '30px' }}
                        >
                            {errors.password?.message}
                        </FormHelperText>
                    </FormControl>

                    <FormControl
                        fullWidth
                        style={{
                            margin: 0,
                            marginTop: theme.spacing(2),
                            marginBottom: theme.spacing(16),
                        }}
                    >
                        {isLoading ? (
                            <LoadingButton variant="contained" loading={isLoading} size="large" />
                        ) : (
                            <Button variant="contained" color="primary" type="submit">
                                Увійти
                            </Button>
                        )}
                    </FormControl>
                </form>
            </Paper>
        </Box>
    );
};

export default LoginPage;
