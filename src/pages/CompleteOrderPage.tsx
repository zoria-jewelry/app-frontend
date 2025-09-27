import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Paper,
    Radio,
    RadioGroup,
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
import { type Resolver, useFieldArray, useForm } from 'react-hook-form';
import { type CompleteOrderFormData, completeOrderSchema } from '../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ChangeEvent, useEffect, useState } from 'react';
import { toFixedNumber } from '../utils.ts';
import type { CompleteOrderCalculationsDto, OrderDto } from '../dto/orders.ts';
import { OrdersApiClient } from '../api/ordersApiClient.ts';
import SuccessIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

const CompleteOrderPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const params = useParams();
    const orderId: number = Number(params.orderId);

    const [searchParams] = useSearchParams();
    const customerId = searchParams.get('customerId');

    const [order, setOrder] = useState<OrderDto | undefined>();
    const [orderCalculations, setOrderCalculations] = useState<
        CompleteOrderCalculationsDto | undefined
    >();
    const [orderPaymentDifference, setOrderPaymentDifference] = useState<number | undefined>();
    const [selectedOrderPaymentEntries, setSelectedOrderPaymentEntries] = useState<number[]>([]);

    const [paymentMethod, setPaymentMethod] = useState<string>('');

    const handleChangePaymentMethod = (event: ChangeEvent<HTMLInputElement>) => {
        setPaymentMethod(event.target.value);
    };

    const resolver = zodResolver(completeOrderSchema) as Resolver<CompleteOrderFormData>;

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        watch,
        control,
        formState: { errors },
    } = useForm<CompleteOrderFormData>({
        resolver,
        reValidateMode: 'onChange',
    });

    const { fields } = useFieldArray({
        control,
        name: 'paymentData',
    });

    const discount = watch('discount') || 0;
    const loss = watch('lossPercentage') || 0;
    const totalMetalWeight = watch('finalMetalWeight') || 0;
    const stonesPrice = watch('stoneCost') || 0;

    useEffect(() => {
        if (loss > 0 && totalMetalWeight > 0) {
            OrdersApiClient.getCompleteOrderCalculations(orderId, {
                lossPercentage: loss,
                finalMetalWeight: totalMetalWeight,
                discount,
                stoneCost: stonesPrice,
            })
                .then(setOrderCalculations)
                .catch((err) => {
                    // TODO: add toast
                    console.log(err);
                });
        }
    }, [discount, loss, totalMetalWeight, stonesPrice]);

    const enableSections =
        !!loss && !!totalMetalWeight && !!Number(loss) && !!Number(totalMetalWeight);

    const onSubmit = (data: CompleteOrderFormData) => {
        if (orderCalculations && orderId > 0) {
            const sum: number = data.paymentData.map((p) => p.amountToPay).reduce((a, b) => a + b);
            if (Math.abs(sum - orderCalculations.totalSum) >= 0.01) {
                setOrderPaymentDifference(orderCalculations.totalSum - sum);
                setSelectedOrderPaymentEntries(
                    data.paymentData.map((p) => p.amountToPay).filter((p) => p > 0),
                );
                return;
            }

            OrdersApiClient.completeOrder(orderId, data)
                .then(() => {
                    // TODO: add toast
                    clearErrors();
                    reset();
                    navigate(customerId ? `/customers/${customerId}` : '/orders');
                })
                .catch((err) => {
                    // TODO: add toast
                    console.log(err);
                });
        }
    };

    useEffect(() => {
        if (orderId) {
            OrdersApiClient.getById(orderId)
                .then(setOrder)
                .catch((err) => {
                    console.log(err);
                    // TODO: add toast
                });
        }
    }, [orderId]);

    useEffect(() => {
        if (orderCalculations) {
            reset({
                ...watch(),
                paymentData: (orderCalculations.entries ?? []).map((entry) => ({
                    materialId: entry.materialId,
                    amountToPay: 0,
                })),
            });
        }
    }, [orderCalculations]);

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
            <Paper className={paperStyles.paper} sx={{ padding: theme.spacing(4) }}>
                <Box
                    display="flex"
                    flexDirection={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    width="100%"
                    gap={{ xs: 3, sm: 2, md: 4 }}
                    sx={{
                        padding: { xs: 2, sm: 3 },
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        flex={1}
                        minWidth={0}
                        sx={{ textAlign: { xs: 'center', md: 'left' } }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 600,
                                lineHeight: 1.2,
                                marginBottom: 0.5,
                                wordBreak: 'break-word',
                            }}
                        >
                            Завершення замовлення №{orderId}
                        </Typography>
                    </Box>
                </Box>
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
                            {...register('discount', { valueAsNumber: true })}
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
                            {...register('lossPercentage', { valueAsNumber: true })}
                            error={!!errors.lossPercentage}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        <FormHelperText
                            error={!!errors.lossPercentage}
                            sx={{ margin: 0, minHeight: '30px' }}
                        >
                            {errors?.lossPercentage?.message}
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
                            type="number"
                            {...register('finalMetalWeight', { valueAsNumber: true })}
                            error={!!errors.finalMetalWeight}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        <FormHelperText
                            error={!!errors.finalMetalWeight}
                            sx={{ margin: 0, minHeight: '30px' }}
                        >
                            {errors?.finalMetalWeight?.message}
                        </FormHelperText>
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel htmlFor="total-stones-price">
                            Загальна вартість камінців у виробах (грн)
                        </FormLabel>
                        <TextField
                            id="total-stones-price"
                            placeholder="5400.00"
                            fullWidth
                            margin="normal"
                            type="number"
                            {...register('stoneCost', { valueAsNumber: true })}
                            error={!!errors.stoneCost}
                            sx={{
                                margin: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        <FormHelperText
                            error={!!errors.stoneCost}
                            sx={{ margin: 0, minHeight: '30px' }}
                        >
                            {errors?.stoneCost?.message}
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
                                                    {toFixedNumber(
                                                        orderCalculations?.metalMassWithLoss ?? 0,
                                                        3,
                                                    )}{' '}
                                                    г
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
                                                {`${order.workPrice} * ${toFixedNumber(orderCalculations?.metalMassWithLoss ?? 0, 3)} = `}
                                                <span style={{ fontWeight: 900 }}>
                                                    {toFixedNumber(
                                                        orderCalculations?.workCost ?? 0,
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
                                                {`${toFixedNumber(totalMetalWeight, 3)} * ${toFixedNumber(order.materialPrice, 2)} = `}
                                                <span style={{ fontWeight: 900 }}>
                                                    {toFixedNumber(
                                                        orderCalculations?.usedMetalCost ?? 0,
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
                                                Вартість камінців
                                            </TableCell>
                                            <TableCell>
                                                <span style={{ fontWeight: 900 }}>
                                                    {toFixedNumber(
                                                        orderCalculations?.stoneCost ?? 0,
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
                                    Сума без знижки –{' '}
                                    {toFixedNumber(orderCalculations?.sumWithoutDiscount ?? 0, 2)}{' '}
                                    грн
                                </Typography>
                                <Typography variant="body1">
                                    Знижка – {toFixedNumber(orderCalculations?.discount ?? 0, 2)}{' '}
                                    грн
                                </Typography>
                                <Typography variant="body1" fontWeight={900}>
                                    Сума зі знижкою –{' '}
                                    {toFixedNumber(orderCalculations?.totalSum ?? 0, 2)} грн
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
                    sx={{ backgroundColor: 'white' }}
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
                                    backgroundColor: '#d9d9d9',
                                }}
                            >
                                <Table stickyHeader>
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
                                        {(orderCalculations.entries ?? []).map((entry) => (
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
                                                        {toFixedNumber(entry.totalMaterialCost, 2)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Typography
                                    variant="body1"
                                    fontWeight={900}
                                    textAlign="right"
                                    marginTop={theme.spacing(4)}
                                    marginBottom={theme.spacing(4)}
                                    paddingRight={theme.spacing(2)}
                                >
                                    Усього {toFixedNumber(orderCalculations.allMaterialsCost, 2)}
                                </Typography>
                            </TableContainer>

                            <Paper
                                elevation={3}
                                className={paperStyles.paper}
                                sx={{
                                    backgroundColor: orderCalculations.clientIsAbleToFullyPay
                                        ? theme.palette.success.main
                                        : theme.palette.warning.main,
                                    color: orderCalculations.clientIsAbleToFullyPay
                                        ? theme.palette.success.main
                                        : theme.palette.warning.contrastText,
                                    width: '100%',
                                    my: theme.spacing(4),
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    px: theme.spacing(4),
                                    py: theme.spacing(2),
                                    borderRadius: 2,
                                }}
                            >
                                {orderCalculations.clientIsAbleToFullyPay ? (
                                    <SuccessIcon
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            flexShrink: 0,
                                            mr: theme.spacing(2),
                                            color: 'darkgreen',
                                        }}
                                    />
                                ) : (
                                    <WarningIcon
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            flexShrink: 0,
                                            mr: theme.spacing(2),
                                        }}
                                    />
                                )}
                                <Typography variant="body1" fontWeight={500}>
                                    {orderCalculations.clientIsAbleToFullyPay
                                        ? 'Клієнт може повністю сплатити замовлення'
                                        : 'У клієнта недостатньо ресурсів для сплати замовлення'}
                                </Typography>
                            </Paper>

                            <Typography
                                variant="body1"
                                marginBottom={theme.spacing(2)}
                                marginTop={theme.spacing(12)}
                            >
                                Вибір ресурсів для сплати замовлення
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ paddingX: 0, borderBottom: 'none' }}>
                                                <Typography textAlign="center">
                                                    Ресурс (грн)
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    paddingX: 0,
                                                    width: '160px',
                                                    borderBottom: 'none',
                                                }}
                                            >
                                                <Typography textAlign="center">
                                                    Доступно (грн)
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {fields.map((field, index) => {
                                            const entry = orderCalculations?.entries.find(
                                                (e) => e.materialId === field.materialId,
                                            );
                                            return (
                                                <TableRow key={entry?.materialId}>
                                                    <TableCell
                                                        sx={{ borderBottom: 'none', padding: 0 }}
                                                    >
                                                        <FormControl key={field.id} fullWidth>
                                                            <FormLabel
                                                                htmlFor={`material-${field.materialId}`}
                                                            >
                                                                {entry?.materialName}
                                                            </FormLabel>
                                                            <TextField
                                                                id={`material-${field.materialId}`}
                                                                placeholder="999"
                                                                fullWidth
                                                                margin="normal"
                                                                type="number"
                                                                {...register(
                                                                    `paymentData.${index}.amountToPay`,
                                                                    { valueAsNumber: true },
                                                                )}
                                                                error={
                                                                    !!errors.paymentData?.[index]
                                                                        ?.amountToPay
                                                                }
                                                                sx={{
                                                                    margin: 0,
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: '6px',
                                                                    },
                                                                }}
                                                            />
                                                            <FormHelperText
                                                                error={
                                                                    !!errors.paymentData?.[index]
                                                                        ?.amountToPay
                                                                }
                                                                sx={{
                                                                    margin: 0,
                                                                    minHeight: '30px',
                                                                }}
                                                            >
                                                                {
                                                                    errors.paymentData?.[index]
                                                                        ?.amountToPay?.message
                                                                }
                                                            </FormHelperText>
                                                        </FormControl>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{ borderBottom: 'none', padding: 0 }}
                                                    >
                                                        <Typography textAlign="right">
                                                            {toFixedNumber(
                                                                entry?.totalMaterialCost,
                                                                2,
                                                            )}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <RadioGroup value={paymentMethod} onChange={handleChangePaymentMethod}>
                                <FormControlLabel
                                    value="card"
                                    control={<Radio />}
                                    label="Сплачено карткою"
                                />
                                <FormControlLabel
                                    value="cash"
                                    control={<Radio />}
                                    label="Сплачено готівкою"
                                />
                            </RadioGroup>

                            {orderPaymentDifference && !!orderCalculations && (
                                <Paper
                                    elevation={3}
                                    className={paperStyles.paper}
                                    sx={{
                                        backgroundColor: theme.palette.warning.main,
                                        color: theme.palette.warning.contrastText,
                                        width: '100%',
                                        my: theme.spacing(4),
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        px: theme.spacing(4),
                                        py: theme.spacing(2),
                                        borderRadius: 2,
                                    }}
                                >
                                    <WarningIcon
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            flexShrink: 0,
                                            mr: theme.spacing(2),
                                        }}
                                    />
                                    <Typography variant="body1">
                                        {orderPaymentDifference > 0
                                            ? 'Обрана сума оплати менша за вартість замовлення. Необхідно додати '
                                            : 'Обрана сума оплати перевищує вартість замовлення. Необхідно прибрати '}
                                        <span style={{ fontWeight: 900 }}>
                                            {toFixedNumber(Math.abs(orderPaymentDifference), 2)}
                                        </span>{' '}
                                        грн
                                        <br />
                                        {selectedOrderPaymentEntries.length
                                            ? `${toFixedNumber(orderCalculations.totalSum, 2)}${selectedOrderPaymentEntries.map((p) => ` – ${p.toFixed(2)}`).join('')} = ${orderPaymentDifference.toFixed(2)} грн`
                                            : `Жоден матеріал ще не був обраний для оплати`}
                                    </Typography>
                                </Paper>
                            )}

                            <Box
                                width="100%"
                                display="flex"
                                justifyContent="center"
                                marginY={theme.spacing(4)}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={!paymentMethod}
                                >
                                    Закрити замовлення
                                </Button>
                            </Box>
                        </>
                    )}
                </AccordionDetails>
            </Accordion>
        </form>
    );
};

export default CompleteOrderPage;
