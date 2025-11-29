import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormHelperText,
    FormLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
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
import { useEffect, useState } from 'react';
import { toFixedNumber } from '../utils.ts';
import { paymentTypes, type CompleteOrderCalculationsDto, type OrderDto } from '../dto/orders.ts';
import { OrdersApiClient } from '../api/ordersApiClient.ts';
import SuccessIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { VchasnoApiClient } from '../api/vchasnoApiClient.ts';
import { showToast } from '../components/common/Toast.tsx';

const evaluateExpression = (expr: string): number | null => {
    if (!expr || !expr.toString().trim()) return null;
    const s = expr.toString().trim();

    // Allow numbers, operators (+, -, *, /), decimal points, and any whitespace
    // Use \s directly in the regex pattern (not \\s)
    if (!/^[0-9+\-*/\s.]+$/.test(s)) return null;

    // Remove all whitespace characters (spaces, tabs, etc.)
    const cleaned = s.replace(/\s+/g, '');

    if (cleaned === '') return null;

    try {
        // Split by + and - operators (keeping the operators)
        const parts = cleaned.split(/(?=[+-])/g);
        
        let acc = 0;
        for (const part of parts) {
            if (part === '' || part === '+' || part === '-') continue;
            
            // Handle the sign - remove both + and - prefixes
            let isNegative = part.startsWith('-');
            let partToProcess = part.startsWith('+') || part.startsWith('-') 
                ? part.substring(1) 
                : part;
            
            if (partToProcess === '') continue;
            
            // Split by * and / operators
            const multDivParts = partToProcess.split(/(?=[*/])|(?<=[*/])/g).filter(p => p !== '');
            
            if (multDivParts.length === 0) continue;
            
            let partValue = parseFloat(multDivParts[0]);
            if (Number.isNaN(partValue)) return null;
            
            // Process multiplication and division
            for (let i = 1; i < multDivParts.length; i += 2) {
                if (i + 1 >= multDivParts.length) return null; // Missing operand
                
                const operator = multDivParts[i];
                const operand = parseFloat(multDivParts[i + 1]);
                
                if (Number.isNaN(operand)) return null;
                
                if (operator === '*') {
                    partValue *= operand;
                } else if (operator === '/') {
                    if (operand === 0) return null; // Division by zero
                    partValue /= operand;
                } else {
                    return null; // Invalid operator
                }
            }
            
            // Add or subtract based on sign
            if (isNegative) {
                acc -= partValue;
            } else {
                acc += partValue;
            }
        }
        
        return acc;
    } catch (error) {
        return null;
    }
};

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

    const [isShiftOpen, setIsShiftOpen] = useState<boolean>(false);

    const [paymentType, setPaymentType] = useState<number | string>('');

    const [rawPaymentInputs, setRawPaymentInputs] = useState<Record<number, string>>({});

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

    const paidMoney = Object.keys(rawPaymentInputs).reduce((sum, key) => {
        const evaluated = evaluateExpression(rawPaymentInputs[Number(key)]);
        return sum + (evaluated !== null && evaluated !== undefined ? evaluated : 0);
    }, 0);

    // Calculate amount paid in "Валюта" (currency) only
    const currencyAmount = orderCalculations
        ? (() => {
              const currencyEntry = orderCalculations.entries.find(
                  (entry) => entry.materialName === 'Валюта',
              );
              if (!currencyEntry) return 0;

              const currencyIndex = orderCalculations.entries.findIndex(
                  (entry) => entry.materialId === currencyEntry.materialId,
              );
              if (currencyIndex === -1) return 0;

              const rawValue = rawPaymentInputs[currencyIndex] ?? '0';
              const evaluated = evaluateExpression(rawValue);
              return evaluated !== null && evaluated !== undefined ? evaluated : 0;
          })()
        : 0;

    useEffect(() => {
        console.log('effect');
        if (loss > 0 && totalMetalWeight > 0) {
            console.log('entered');
            OrdersApiClient.getCompleteOrderCalculations(orderId, {
                lossPercentage: Number(toFixedNumber(loss, 2)),
                finalMetalWeight: Number(toFixedNumber(totalMetalWeight, 3)),
                discount: discount != null ? Number(toFixedNumber(discount, 2)) : 0,
                stoneCost: stonesPrice != null ? Number(toFixedNumber(stonesPrice, 2)) : 0,
            })
                .then((data) => {
                    console.log(data);
                    setOrderCalculations(data);
                })
                .catch((err) => {
                    showToast('Не вдалось обчислити вартість замовлення', 'error');
                    console.log(err);
                });
        }
    }, [discount, loss, totalMetalWeight, stonesPrice]);

    const enableSections =
        !!loss && !!totalMetalWeight && !!Number(loss) && !!Number(totalMetalWeight);

    const handleRawPaymentInputChange = (index: number, value: string) => {
        setRawPaymentInputs((prev) => ({ ...prev, [index]: value }));
    };

    const onSubmit = (data: CompleteOrderFormData) => {
        if (orderCalculations && orderId > 0) {
            // Use evaluated values from raw inputs and format to 2 decimal places
            const paymentDataWithEvaluated = data.paymentData.map((p, idx) => {
                const raw = rawPaymentInputs[idx];
                const evaluated = raw !== undefined ? evaluateExpression(raw) : null;
                const finalNumber =
                    evaluated !== null && evaluated !== undefined
                        ? evaluated
                        : (p.amountToPay ?? 0);
                // Format to 2 decimal places to avoid floating point precision issues
                return { ...p, amountToPay: Number(toFixedNumber(finalNumber, 2)) };
            });

            const sum: number = paymentDataWithEvaluated
                .map((p) => p.amountToPay)
                .reduce((a, b) => a + b, 0);
            if (Math.abs(sum - orderCalculations.totalSum) >= 0.01) {
                setOrderPaymentDifference(orderCalculations.totalSum - sum);
                setSelectedOrderPaymentEntries(
                    paymentDataWithEvaluated.map((p) => p.amountToPay).filter((p) => p > 0),
                );
                return;
            }

            // Check if payment type is required (only if "Валюта" amount > 0)
            if (currencyAmount > 0 && paymentType === '') {
                console.log('Payment type is not selected');
                return;
            }

            // Set loading state to prevent double submission
            setIsSubmitting(true);

            // Format all numeric values before sending to backend
            const formattedData = {
                discount: data.discount != null ? Number(toFixedNumber(data.discount, 2)) : 0,
                lossPercentage: Number(toFixedNumber(data.lossPercentage, 2)),
                finalMetalWeight: Number(toFixedNumber(data.finalMetalWeight, 3)),
                stoneCost: data.stoneCost != null ? Number(toFixedNumber(data.stoneCost, 2)) : 0,
                paymentData: paymentDataWithEvaluated,
            };

            OrdersApiClient.completeOrder(orderId, formattedData)
                .then(async () => {
                    showToast('Замовлення було успішно закрите');
                    
                    // Find the "Валюта" payment entry
                    const currencyEntry = orderCalculations.entries.find(
                        (entry) => entry.materialName === 'Валюта',
                    );
                    const currencyPayment = currencyEntry
                        ? paymentDataWithEvaluated.find(
                              (p) => p.materialId === currencyEntry.materialId,
                          )
                        : null;
                    const currencyAmount = currencyPayment?.amountToPay ?? 0;

                    if (currencyAmount > 0) {
                        try {
                            // Format currency amount to 2 decimal places before sending to checkout
                            const formattedCurrencyAmount = Number(toFixedNumber(currencyAmount, 2));
                            const receiptUrl: string = await VchasnoApiClient.checkout(
                                formattedCurrencyAmount,
                                Number(paymentType),
                            );
                            await OrdersApiClient.addReceipt(orderId, receiptUrl);
                        } catch (err) {
                            showToast(
                                `Не вдалось додати чек до замовлення. Негайно зверніться до адміністратора`,
                                'error',
                            );
                            console.log(err);
                        }
                    }
                    clearErrors();
                    reset();
                    navigate(customerId ? `/customers/${customerId}` : '/orders');
                })
                .catch((err) => {
                    showToast(`Не вдалось створити чек до замовлення`, 'error');
                    console.log(err);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    };

    useEffect(() => {
        if (orderId) {
            OrdersApiClient.getById(orderId)
                .then(setOrder)
                .catch((err) => {
                    showToast('Не вдалось завантажити дані замовлення', 'error');
                    console.log(err);
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
            
            const raw: Record<number, string> = {};
            (orderCalculations.entries ?? []).forEach((_entry, idx) => {
                raw[idx] = '0';
            });
            setRawPaymentInputs(raw);
        }
    }, [orderCalculations]);

    useEffect(() => {
        VchasnoApiClient.isShiftActive()
            .then(setIsShiftOpen)
            .catch((err) => {
                showToast(
                    `Не вдалось дізнатись, чи була розпочата зміна. Перевірте, чи запущений застосунок Vchasno Kasa, або зверніться до адміністратора`,
                    'error',
                );
                console.log(err);
            });
    }, []);

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
                                                Загальна маса металу у виробах
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
                                                {`${toFixedNumber(orderCalculations?.metalMassWithLoss, 3)} * ${toFixedNumber(order.materialPrice, 2)} = `}
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
                                            const rawValue = rawPaymentInputs[index] ?? '0';
                                            const evaluated = evaluateExpression(rawValue);
                                            
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
                                                                {entry?.materialName !== 'Валюта' &&
                                                                    entry?.materialPrice != null &&
                                                                    typeof entry.materialPrice === 'number' && (
                                                                        <span
                                                                            style={{
                                                                                marginLeft: '8px',
                                                                                color: '#666',
                                                                                fontSize: '0.875rem',
                                                                                fontWeight: 'normal',
                                                                            }}
                                                                        >
                                                                            (1 г = {toFixedNumber(entry.materialPrice, 2)} грн)
                                                                        </span>
                                                                    )}
                                                            </FormLabel>
                                                            <TextField
                                                                id={`material-${field.materialId}`}
                                                                placeholder="наприклад: 100*2 або 50+10"
                                                                fullWidth
                                                                margin="normal"
                                                                type="text"
                                                                value={rawValue}
                                                                onChange={(e) =>
                                                                    handleRawPaymentInputChange(
                                                                        index,
                                                                        e.target.value,
                                                                    )
                                                                }
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
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    marginLeft: '4px',
                                                                    minHeight: 20,
                                                                }}
                                                            >
                                                                {rawValue.trim() === '' ? (
                                                                    <span style={{ color: '#666' }}>
                                                                        Поточне значення: {toFixedNumber(0, 2)}
                                                                    </span>
                                                                ) : evaluated === null ? (
                                                                    <span style={{ color: '#c43' }}>
                                                                        Невірний вираз
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#666' }}>
                                                                        = {toFixedNumber(evaluated, 2)}
                                                                    </span>
                                                                )}
                                                            </Typography>
                                                            <input
                                                                type="hidden"
                                                                {...register(
                                                                    `paymentData.${index}.amountToPay`,
                                                                    {
                                                                        valueAsNumber: true,
                                                                        setValueAs: (v) =>
                                                                            typeof v === 'string' &&
                                                                            v !== ''
                                                                                ? parseFloat(v) || 0
                                                                                : v,
                                                                    },
                                                                )}
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

                            {currencyAmount > 0 && (
                                <>
                                    <Typography variant="body1" sx={{ mt: 2 }}>
                                        Вкажіть тип оплати
                                    </Typography>

                                    <FormControl fullWidth sx={{ mt: 3 }}>
                                        <InputLabel id="payment-type-label">Тип оплати</InputLabel>
                                        <Select
                                            labelId="payment-type-label"
                                            value={paymentType}
                                            label="Тип оплати"
                                            onChange={(e) => setPaymentType(Number(e.target.value))}
                                        >
                                            {paymentTypes.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </>
                            )}

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
                                            ? `${toFixedNumber(orderCalculations.totalSum, 2)}${selectedOrderPaymentEntries.map((p) => ` – ${toFixedNumber(p, 2)}`).join('')} = ${toFixedNumber(orderPaymentDifference, 2)} грн`
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
                                    disabled={
                                        isSubmitting ||
                                        (currencyAmount > 0 &&
                                            (paymentType == null || paymentType === '' || !isShiftOpen))
                                    }
                                    startIcon={
                                        isSubmitting ? (
                                            <CircularProgress size={18} color="inherit" />
                                        ) : undefined
                                    }
                                >
                                    Закрити замовлення
                                </Button>
                            </Box>
                            <FormHelperText error={true} sx={{ textAlign: 'center' }}>
                                {currencyAmount > 0 &&
                                    !isShiftOpen &&
                                    `Відкрийте зміну, щоб закрити замовлення`}
                            </FormHelperText>
                        </>
                    )}
                </AccordionDetails>
            </Accordion>
        </form>
    );
};

export default CompleteOrderPage;
