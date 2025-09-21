import {
    Box,
    Button,
    FormHelperText,
    IconButton,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { returnWorkUnitSchema, type ReturnWorkUnitFormData } from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '40%',
        minHeight: '40%',
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
    workUnitId: number;
    open: boolean;
    onClose: () => void;
    onSave: (data: ReturnWorkUnitFormData) => void;
}

const ReturnWorkUnitComponent = ({
    workUnitId,
    open,
    onClose,
    onSave,
}: ReturnWorkUnitModalProps) => {
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ReturnWorkUnitFormData>({
        resolver: zodResolver(returnWorkUnitSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            workUnitId,
            metalWeight: undefined,
            loss: undefined,
        },
    });

    const handleClose = () => {
        reset({
            workUnitId,
            metalWeight: undefined,
            loss: undefined,
        });
        onClose();
    };

    const onSubmit = (data: ReturnWorkUnitFormData) => {
        onSave(data);
        handleClose();
    };

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
                    <TextField
                        type="number"
                        fullWidth
                        {...register('metalWeight', { valueAsNumber: true })}
                        error={!!errors.metalWeight}
                    />
                    <FormHelperText
                        error={true}
                        sx={{
                            margin: 0,
                            marginBottom: theme.spacing(2),
                            minHeight: '30px',
                        }}
                    >
                        {errors.metalWeight ? errors.metalWeight.message : ''}
                    </FormHelperText>
                </Box>

                <Box mt={4}>
                    <Typography>ПН, %</Typography>
                    <TextField
                        type="number"
                        fullWidth
                        {...register('loss', { valueAsNumber: true })}
                        error={!!errors.loss}
                    />
                    <FormHelperText
                        error={true}
                        sx={{
                            margin: 0,
                            marginBottom: theme.spacing(2),
                            minHeight: '30px',
                        }}
                    >
                        {errors.loss ? errors.loss.message : ''}
                    </FormHelperText>
                </Box>

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
