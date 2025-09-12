import { useParams } from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    FormControl,
    FormHelperText,
    FormLabel,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import paperStyles from '../styles/Paper.module.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useForm } from 'react-hook-form';
import { type CompleteOrderFormData, completeOrderSchema } from '../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { toFixedNumber } from '../utils.ts';
import type { CompleteOrderCalculationsDto, OrderDto } from '../dto/orders.ts';
import { OrdersApiClient } from '../api/ordersApiClient.ts';

const CompleteOrderPage = () => {
    const theme = useTheme();

    const params = useParams();
    const orderId: number = Number(params.orderId);

    const [order, setOrder] = useState<OrderDto | undefined>();
    const [orderCalculations, setOrderCalculations] = useState<
        CompleteOrderCalculationsDto | undefined
    >();

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        watch,
        formState: { errors },
    } = useForm<CompleteOrderFormData>({
        resolver: zodResolver(completeOrderSchema),
        reValidateMode: 'onChange',
    });

    const onSubmit = (data: CompleteOrderFormData) => {
        console.log(data);
        // TODO: call API Endpoint
        clearErrors();
        reset();
    };

    const discount = watch('discount') ?? 0;
    const loss = watch('loss') ?? 0;
    const totalMetalWeight = watch('totalMetalWeight') ?? 0;
    const totalMetalWeightWithLoss = useMemo(
        () => totalMetalWeight * (1 + loss / 100),
        [loss, totalMetalWeight],
    );

    const subtotal = useMemo(
        () =>
            (order?.workPrice ?? 0) * totalMetalWeightWithLoss +
            (order?.materialPrice ?? 0) * totalMetalWeight,
        [order, totalMetalWeightWithLoss],
    );
    const total = useMemo(() => subtotal - discount, [subtotal, discount]);

    const enableSections =
        !!loss && !!totalMetalWeight && !!Number(loss) && !!Number(totalMetalWeight);

    useEffect(() => {
        if (orderId) {
            OrdersApiClient.getById(orderId)
                .then(setOrder)
                .catch((err) => {
                    console.log(err);
                    // TODO: add toast
                });
            OrdersApiClient.getCompleteOrderCalculations(orderId)
                .then(setOrderCalculations)
                .catch((err) => {
                    console.log(err);
                    // TODO: add toast
                });
        }
    }, [orderId]);

    useEffect(() => {}, [discount, loss, totalMetalWeight]);

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: theme.spacing(8),
                gap: theme.spacing(4),
            }}
            noValidate
        >
            <Paper className={paperStyles.paper} sx={{ padding: theme.spacing(6) }}>
                <Typography variant="h3">Завершення замовлення №{orderId}</Typography>
            </Paper>

            <Accordion
                defaultExpanded
                disableGutters
                square
                className={paperStyles.paper}
                sx={{ padding: theme.spacing(4) }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography variant="h5">Крок 1. Загальні відомості</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControl fullWidth>
                        <FormLabel htmlFor="discount">Знижка (грн)</FormLabel>
                        <TextField
                            id="discount"
                            placeholder="999"
                            fullWidth
                            margin="normal"
                            type="number"
                            {...register('discount')}
                            error={!!errors.discount}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        <FormHelperText
                            error={!!errors.discount}
                            sx={{ margin: 0, minHeight: '30px' }}
                        >
                            {errors?.discount?.message}
                        </FormHelperText>
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel htmlFor="loss">Угар (%)</FormLabel>
                        <TextField
                            id="loss"
                            placeholder="7.5"
                            fullWidth
                            margin="normal"
                            type="number"
                            {...register('loss')}
                            error={!!errors.loss}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        <FormHelperText error={!!errors.loss} sx={{ margin: 0, minHeight: '30px' }}>
                            {errors?.loss?.message}
                        </FormHelperText>
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel htmlFor="total-metal-weight">
                            Кінцева вага металу у виробах (г)
                        </FormLabel>
                        <TextField
                            id="total-metal-weight"
                            placeholder="42.140"
                            fullWidth
                            margin="normal"
                            {...register('totalMetalWeight')}
                            error={!!errors.totalMetalWeight}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        <FormHelperText
                            error={!!errors.totalMetalWeight}
                            sx={{ margin: 0, minHeight: '30px' }}
                        >
                            {errors?.totalMetalWeight?.message}
                        </FormHelperText>
                    </FormControl>
                </AccordionDetails>
            </Accordion>

            <Accordion
                disableGutters
                square
                className={paperStyles.paper}
                sx={{ padding: theme.spacing(4) }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                    disabled={!enableSections}
                >
                    <Typography variant="h5">Крок 2. Розрахунок вартості</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {enableSections && order && (
                        <>
                            <TableContainer
                                sx={{
                                    overflowX: 'auto',
                                    borderTopLeftRadius: '10px',
                                    borderTopRightRadius: '10px',
                                    boxShadow: 1,
                                }}
                            >
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#e5f3e5' }}>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: '#b7cfd2',
                                                    textAlign: 'center',
                                                    width: '50%',
                                                }}
                                            >
                                                Характеристика
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: '#b7cfd2',
                                                    textAlign: 'center',
                                                    width: '50%',
                                                }}
                                            >
                                                Значення
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    borderRight: `1px solid ${theme.palette.divider}`,
                                                }}
                                            >
                                                Загальна вага виробів без каменів
                                            </TableCell>
                                            <TableCell>
                                                <span style={{ fontWeight: 900 }}>
                                                    {toFixedNumber(totalMetalWeight, 3)} г
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    borderRight: `1px solid ${theme.palette.divider}`,
                                                }}
                                            >
                                                Загальна маса металу у виробах з угаром
                                            </TableCell>
                                            <TableCell>
                                                {`${toFixedNumber(totalMetalWeight, 3)} * (1 + ${loss} ÷ 100) = `}
                                                <span style={{ fontWeight: 900 }}>
                                                    {toFixedNumber(totalMetalWeightWithLoss, 3)} г
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    borderRight: `1px solid ${theme.palette.divider}`,
                                                }}
                                            >
                                                Вартість обробки металу
                                            </TableCell>
                                            <TableCell>
                                                {`${order.workPrice} * ${toFixedNumber(totalMetalWeightWithLoss, 3)} = `}
                                                <span style={{ fontWeight: 900 }}>
                                                    {toFixedNumber(
                                                        order.workPrice * totalMetalWeightWithLoss,
                                                        2,
                                                    )}{' '}
                                                    грн
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    borderRight: `1px solid ${theme.palette.divider}`,
                                                }}
                                            >
                                                Вартість використаного металу
                                            </TableCell>
                                            <TableCell>
                                                {`${toFixedNumber(totalMetalWeightWithLoss, 3)} * ${order.materialPrice} = `}
                                                <span style={{ fontWeight: 900 }}>
                                                    {toFixedNumber(
                                                        totalMetalWeightWithLoss *
                                                            order.materialPrice,
                                                        2,
                                                    )}{' '}
                                                    грн
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box
                                width="100%"
                                display="flex"
                                flexDirection="column"
                                alignItems="flex-end"
                                marginTop={theme.spacing(4)}
                            >
                                <Typography variant="body1">
                                    Сума без знижки – {subtotal} грн
                                </Typography>
                                <Typography variant="body1">Знижка – {discount} грн</Typography>
                                <Typography variant="body1" fontWeight={900}>
                                    Сума зі знижкою – {total} грн
                                </Typography>
                            </Box>
                        </>
                    )}
                </AccordionDetails>
            </Accordion>

            <Accordion
                disableGutters
                square
                className={paperStyles.paper}
                sx={{ padding: theme.spacing(4) }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3a-content"
                    id="panel3a-header"
                    disabled={!enableSections}
                >
                    <Typography variant="h5">Крок 3. Оплата замовлення</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {orderCalculations && (
                        <>
                            <TableContainer
                                sx={{
                                    overflowX: 'auto',
                                    borderTopLeftRadius: '10px',
                                    borderTopRightRadius: '10px',
                                    borderBottomLeftRadius: '10px',
                                    borderBottomRightRadius: '10px',
                                    boxShadow: 1,
                                }}
                            >
                                <Table stickyHeader sx={{ backgroundColor: '#d9d9d9' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: '#d9d9d9',
                                                    padding: theme.spacing(2),
                                                    paddingY: theme.spacing(4),
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight={900}>
                                                    Ресурс
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: '#d9d9d9',
                                                    padding: theme.spacing(2),
                                                    paddingY: theme.spacing(4),
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight={900}>
                                                    Кількість
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: '#d9d9d9',
                                                    padding: theme.spacing(2),
                                                    paddingY: theme.spacing(4),
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight={900}>
                                                    Курс у прайс-листі
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: '#d9d9d9',
                                                    padding: theme.spacing(2),
                                                    paddingY: theme.spacing(4),
                                                    textAlign: 'right',
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight={900}>
                                                    Вартість (грн)
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {orderCalculations.entries.map((entry) => (
                                            <TableRow key={entry.materialId}>
                                                <TableCell sx={{ padding: theme.spacing(2) }}>
                                                    <Typography variant="body2">
                                                        {entry.materialName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ padding: theme.spacing(2) }}>
                                                    <Typography variant="body2">
                                                        {entry.materialCountOwnedByCustomer}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ padding: theme.spacing(2) }}>
                                                    <Typography variant="body2">
                                                        {entry.materialPrice}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ padding: theme.spacing(2) }}>
                                                    <Typography variant="body2" textAlign="right">
                                                        {entry.totalMaterialCost}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Typography
                                variant="body1"
                                fontWeight={900}
                                textAlign="right"
                                marginTop={theme.spacing(4)}
                            >
                                Усього {orderCalculations.allMaterialsCost}
                            </Typography>
                        </>
                    )}
                </AccordionDetails>
            </Accordion>
        </form>
    );
};

export default CompleteOrderPage;
