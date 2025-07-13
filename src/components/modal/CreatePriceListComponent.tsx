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
import z from 'zod';
import { useEffect, useRef, useState } from 'react';
import { PriceListsApiClient } from '../../api/priceListsApiClient.ts';
import { toLocalDate } from '../../utils.ts';
import type { PriceListEntryDto } from '../../dto/price-lists.ts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '60%',
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

export interface CreatePriceListComponentProps {
    isOpen: boolean;
    handleClose: () => void;
}

const CreatePriceListComponent = (props: CreatePriceListComponentProps) => {
    const theme = useTheme();
    const [entries, setEntries] = useState<PriceListEntryDto[]>([]);
    // Keep schema as reference since it's dynamic.....
    const schemaRef = useRef<z.ZodObject<Record<string, z.ZodString>>>(z.object({}));

    useEffect(() => {
        PriceListsApiClient.getActiveListDetails().then((priceList) => {
            if (priceList) {
                setEntries(priceList.entries);

                /**
                 *
                 * Dynamically create validation schema...
                 *
                 * */
                const newDefaults: Record<string, string> = {};
                const newShape: Record<string, z.ZodString> = {};

                priceList.entries.forEach((entry) => {
                    const key = String(entry.materialId);
                    newDefaults[key] = String(entry.materialPrice);
                    newShape[key] = z
                        .string('Введіть число')
                        .refine((val) => !isNaN(Number(val)), { message: 'Неправильний формат' })
                        .refine((val) => Number(val) > 0, {
                            message: 'Вартість повинна бути більшою за 0',
                        });
                });

                reset(newDefaults);

                schemaRef.current = z.object(newShape);
            }
        });
    }, []);

    type CreatePriceListDto = z.infer<typeof schemaRef.current>;

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<CreatePriceListDto>({
        resolver: async (values, context, options) =>
            await zodResolver(schemaRef.current)(values, context, options),
        reValidateMode: 'onSubmit',
        defaultValues: {},
    });

    const handleClose = () => {
        reset();
        clearErrors();
        props.handleClose();
    };

    const onSubmit = (data: { [key: string]: string }) => {
        console.log(data);
        handleClose();
    };

    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.isOpen}
        >
            {/* Close icon */}
            <IconButton
                aria-label="close"
                onClick={handleClose}
                size="large"
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>

            <Typography variant="h3" textAlign="center">
                {`Новий прайс-лист (від ${toLocalDate(new Date())})`}
            </Typography>

            {/* Price list creation form body */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ marginTop: theme.spacing(8) }}
                noValidate
            >
                {/* Each price list entry, fetched from the backend */}
                {entries.map((entry) => {
                    const key = String(entry.materialId);
                    return (
                        <FormControl fullWidth key={key}>
                            <FormLabel htmlFor={`material-${key}`}>
                                {`${entry.materialName} (грн за г)`}
                            </FormLabel>
                            <TextField
                                id={`material-${key}`}
                                fullWidth
                                type="number"
                                margin="normal"
                                slotProps={{
                                    htmlInput: {
                                        step: 0.01,
                                    },
                                }}
                                {...register(key)}
                                error={!!errors[key]}
                                sx={{
                                    margin: 0,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '6px',
                                    },
                                }}
                            />
                            <FormHelperText
                                error={!!errors[key]}
                                sx={{
                                    margin: 0,
                                    marginBottom: theme.spacing(2),
                                    minHeight: '30px',
                                }}
                            >
                                {errors?.[key]?.message}
                            </FormHelperText>
                        </FormControl>
                    );
                })}

                <FormControl
                    fullWidth
                    sx={{
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

export default CreatePriceListComponent;
