import { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { OrdersApiClient } from '../../../api/ordersApiClient.ts';
import type { OrderDto } from '../../../dto/orders.ts';
import { orderStatusToHumanText, toLocalDateTime } from '../../../utils.ts';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-container': {
        overflowX: 'scroll',
    },
    '& .MuiDialog-paper': {
        minWidth: '1000px',
        display: 'block',
        borderRadius: 20,
        padding: theme.spacing(8),
        margin: theme.spacing(2),
    },
    '& .MuiDialogContent-root': {
        padding: theme.spacing(8),
        overflow: 'visible',
    },
}));

interface OrderDetailsComponentProps {
    id: number;
    open: boolean;
    onClose: () => void;
}

export default function OrderDetailsComponent({ id, open, onClose }: OrderDetailsComponentProps) {
    const [order, setOrder] = useState<OrderDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!open) return;
        setLoading(true);

        OrdersApiClient.getById(id)
            .then((data) => {
                if (!data) {
                    // TODO: show toast
                    return;
                }
                setOrder(data);
            })
            .finally(() => setLoading(false));
    }, [id, open]);

    return (
        <BootstrapDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <IconButton
                aria-label="close"
                onClick={onClose}
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

            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '300px',
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : order ? (
                <DialogContent>
                    <Typography variant="h4" textAlign="center" gutterBottom>
                        Деталі замовлення №{order.id} ({orderStatusToHumanText(order.status)})
                    </Typography>

                    {/* Table with entries */}
                    <TableContainer
                        sx={{
                            overflowX: 'auto',
                            borderRadius: 2,
                            boxShadow: 1,
                            maxHeight: '330px',
                        }}
                    >
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#e5f3e5' }}>
                                    <TableCell sx={{ backgroundColor: '#b7cfd2' }}>Фото</TableCell>
                                    <TableCell sx={{ backgroundColor: '#b7cfd2' }}>
                                        Артикул
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#b7cfd2' }}>Назва</TableCell>
                                    <TableCell sx={{ backgroundColor: '#b7cfd2' }}>
                                        Розмір
                                    </TableCell>
                                    <TableCell sx={{ backgroundColor: '#b7cfd2' }}>К-ть</TableCell>
                                    <TableCell sx={{ backgroundColor: '#b7cfd2' }}>
                                        Примітки
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.entries.map((entry) => (
                                    <TableRow key={entry.productId}>
                                        <TableCell>
                                            {entry.productPictureUrl && (
                                                <img
                                                    src={entry.productPictureUrl}
                                                    alt={entry.productName}
                                                    style={{
                                                        width: 60,
                                                        height: 60,
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>{entry.productArticle}</TableCell>
                                        <TableCell>{entry.productName}</TableCell>
                                        <TableCell>{entry.size}</TableCell>
                                        <TableCell>{entry.count}</TableCell>
                                        <TableCell>{entry.notes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="body2" mt={4}>
                        Дата звернення - {toLocalDateTime(order.creationDate)}
                    </Typography>
                    <Typography variant="body2">
                        Дата виконання -{' '}
                        {order.completionDate ? toLocalDateTime(order.completionDate) : '-'}
                    </Typography>

                    {/* Summary */}
                    <Box mt={4} width="100%">
                        <Typography variant="h5" gutterBottom>
                            Підсумок
                        </Typography>

                        <Box display="flex" gap={2}>
                            {/* Left column */}
                            <Box
                                flex={1}
                                display="grid"
                                gridTemplateColumns="auto 1fr"
                                rowGap={1.5}
                                columnGap={4}
                                alignItems="start"
                            >
                                <Typography variant="body2">Вид металу</Typography>
                                <Typography variant="body2">
                                    <b>{order.materialName}</b>
                                </Typography>

                                {order.loss && (
                                    <>
                                        <Typography variant="body2">Угар</Typography>
                                        <Typography variant="body2">
                                            <b>{order.loss}%</b>
                                        </Typography>
                                    </>
                                )}

                                {order.totalWeight && (
                                    <>
                                        <Typography variant="body2">
                                            Загальна вага виробів
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>{order.totalWeight} г</b>
                                        </Typography>
                                    </>
                                )}

                                {order.totalMetalWeight && (
                                    <>
                                        <Typography variant="body2">
                                            Загальна вага металу у виробах
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>{order.totalMetalWeight} г</b>
                                        </Typography>
                                    </>
                                )}

                                {order.metalWeightWithLoss && (
                                    <>
                                        <Typography variant="body2">
                                            Загальна маса металу у виробах (з угаром)
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>{order.metalWeightWithLoss} г</b>
                                        </Typography>
                                    </>
                                )}
                            </Box>

                            {/* Right column */}
                            <Box
                                flex="0 0 auto"
                                display="grid"
                                gridTemplateColumns="auto 1fr"
                                rowGap={1}
                                columnGap={4}
                                alignItems="start"
                                ml="auto"
                                width="fit-content"
                                height="fit-content"
                            >
                                <Typography variant="body2">Вартість роботи</Typography>
                                <Typography variant="body2">
                                    <b>{order.workPrice} грн/г</b>
                                </Typography>

                                {order.metalWorkPrice && (
                                    <>
                                        <Typography variant="body2">
                                            Вартість обробки металу
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>{order.metalWorkPrice} грн</b>
                                        </Typography>
                                    </>
                                )}

                                {order.totalMetalPrice && (
                                    <>
                                        <Typography variant="body2">
                                            Вартість використаного металу
                                        </Typography>
                                        <Typography variant="body2">
                                            <b>{order.totalMetalPrice} грн</b>
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        </Box>

                        {/* Executers & totals remain below */}
                        <Box
                            mt={8}
                            display="flex"
                            flexDirection={{ xs: 'column', md: 'row' }}
                            gap={8}
                            justifyContent="space-between"
                            alignItems="flex-start"
                        >
                            <Box flex={1}>
                                <Typography variant="h5" gutterBottom>
                                    Виконавці
                                </Typography>
                                {order.executors && order.executors.length > 0 ? (
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                        {order.executors.map((name, id) => (
                                            <li key={id}>
                                                <Typography variant="body2">{`– ${name}`}</Typography>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <Typography variant="body2">Не вказано</Typography>
                                )}
                            </Box>

                            <Box flex={1} width="100%">
                                {order.total && (
                                    <>
                                        <Typography
                                            variant="body2"
                                            sx={{ mt: 2 }}
                                            textAlign="right"
                                        >
                                            Вартість без знижки — <b>{order.subtotal} грн</b>
                                        </Typography>
                                        <Typography variant="body2" textAlign="right">
                                            Знижка — <b>-{order.discount ?? 0} грн</b>
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ mt: 1 }}
                                            textAlign="right"
                                        >
                                            <b>Підсумкова вартість — {order.total} грн</b>
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
            ) : (
                <DialogContent>
                    <Typography color="error">Не вдалося завантажити замовлення</Typography>
                </DialogContent>
            )}
        </BootstrapDialog>
    );
}
