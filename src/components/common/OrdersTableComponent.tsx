import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';
import { type OrderBriefInfoDto, type OrdersListDto, OrderStatus } from '../../dto/orders.ts';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import { orderStatusToHumanText, toLocalDateTime } from '../../utils.ts';
import { useState } from 'react';
import CancelOrderComponent from '../modal/orders/CancelOrderComponent.tsx';
import OrderDetailsComponent from '../modal/orders/OrderDetailsComponent.tsx';
import EditOrderComponent from '../modal/orders/EditOrderComponent.tsx';
import { useNavigate } from 'react-router-dom';

export interface OrdersTableProps {
    orders: OrdersListDto;
    setPage: (page: number) => void;
    updateCallback: () => void;
}

const OrdersTableComponent = ({ orders, setPage, updateCallback }: OrdersTableProps) => {
    const navigate = useNavigate();

    const [orderToCancel, setOrderToCancel] = useState<OrderBriefInfoDto | undefined>();
    const [orderIdForInfoModal, setOrderIdForInfoModal] = useState<number | undefined>();
    const [orderIdForUpdateModal, setOrderIdForUpdateModal] = useState<number | undefined>();

    return (
        <>
            <TableContainer
                sx={{
                    minWidth: 350,
                    overflowX: 'auto',
                    borderRadius: 2,
                    boxShadow: 1,
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }} align="center">
                                ID
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }} align="center">
                                Назва
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }} align="center">
                                К-ть
                            </TableCell>
                            <TableCell
                                sx={{ backgroundColor: '#b7cfd2' }}
                                align="center"
                                width="190px"
                            >
                                Дата звернення
                            </TableCell>
                            <TableCell
                                sx={{ backgroundColor: '#b7cfd2' }}
                                align="center"
                                width="190px"
                            >
                                Дата виконання
                            </TableCell>
                            <TableCell sx={{ backgroundColor: '#b7cfd2' }} align="center">
                                Стан
                            </TableCell>
                            <TableCell
                                sx={{ backgroundColor: '#b7cfd2' }}
                                align="center"
                                width="60px"
                            >
                                Дії
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders?.entries.map((order) => (
                            <TableRow
                                key={order.id}
                                hover
                                sx={{
                                    '& td, & th': {
                                        border: '1px solid rgba(224, 224, 224, 1)',
                                    },
                                }}
                            >
                                <TableCell align="center">
                                    <Typography variant="body2">{order.id}</Typography>
                                </TableCell>

                                {/* Products */}
                                <TableCell>
                                    {order.entries.map((entry) => (
                                        <Typography
                                            key={`product-name-${entry.productId}-${order.id}`}
                                            variant="body2"
                                            noWrap
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {entry.productName}
                                        </Typography>
                                    ))}
                                </TableCell>

                                {/* Counts */}
                                <TableCell align="center">
                                    {order.entries.map((entry) => (
                                        <Typography
                                            key={`product-count-${entry.productId}-${order.id}`}
                                            variant="body2"
                                        >
                                            {entry.count}
                                        </Typography>
                                    ))}
                                </TableCell>

                                {/* Request date */}
                                <TableCell align="center">
                                    <Typography variant="body2">
                                        {toLocalDateTime(order.openedAt) ?? '-'}
                                    </Typography>
                                </TableCell>

                                {/* Completion date */}
                                <TableCell align="center">
                                    <Typography variant="body2">
                                        {toLocalDateTime(order.closedAt) ?? '-'}
                                    </Typography>
                                </TableCell>

                                {/* Status */}
                                <TableCell align="center">
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                        gap={1}
                                    >
                                        <Typography variant="body2">
                                            <b>{orderStatusToHumanText(order.status)}</b>
                                            <br />
                                            {order.status === OrderStatus.CANCELED &&
                                                ` (${order.cancellationReason ?? 'причина не вказана'})`}
                                        </Typography>

                                        {order.status === OrderStatus.IN_PROGRESS && (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() =>
                                                        navigate(`/complete-order/${order.id}`)
                                                    }
                                                >
                                                    Завершити
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    onClick={() => setOrderToCancel(order)}
                                                >
                                                    Скасувати
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                </TableCell>

                                {/* Actions */}
                                <TableCell align="center">
                                    {order.status === OrderStatus.IN_PROGRESS ? (
                                        <IconButton
                                            size="large"
                                            onClick={() => setOrderIdForUpdateModal(order.id)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            size="large"
                                            onClick={() => setOrderIdForInfoModal(order.id)}
                                        >
                                            <InfoIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                count={orders.total}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPageOptions={[]}
                page={orders.page - 1}
                rowsPerPage={10}
                sx={{ mt: 2, border: 0 }}
            />

            {orderToCancel && (
                <CancelOrderComponent
                    isOpen={!!orderToCancel}
                    orderId={orderToCancel.id}
                    handleClose={() => setOrderToCancel(undefined)}
                />
            )}

            {orderIdForInfoModal && (
                <OrderDetailsComponent
                    id={orderIdForInfoModal}
                    open={!!orderIdForInfoModal}
                    onClose={() => setOrderIdForInfoModal(undefined)}
                />
            )}

            {orderIdForUpdateModal && (
                <EditOrderComponent
                    orderId={orderIdForUpdateModal}
                    handleClose={() => setOrderIdForUpdateModal(undefined)}
                    open={!!orderIdForUpdateModal}
                    callback={updateCallback}
                />
            )}
        </>
    );
};

export default OrdersTableComponent;
