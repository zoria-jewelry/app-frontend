import {
    Box,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import { type OrderBriefInfoDto, type OrdersListDto, OrderStatus } from '../../dto/orders.ts';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { orderStatusToHumanText, toTableDate } from '../../utils.ts';
import { useState, type MouseEvent } from 'react';
import CancelOrderComponent from '../modal/orders/CancelOrderComponent.tsx';
import OrderDetailsComponent from '../modal/orders/OrderDetailsComponent.tsx';
import EditOrderComponent from '../modal/orders/EditOrderComponent.tsx';
import { useNavigate } from 'react-router-dom';

export interface OrdersTableProps {
    customerId?: number | null;
    orders: OrdersListDto;
    setPage: (page: number) => void;
    onUpdate: () => void;
}

/** Badge colors: blue — in progress, green — completed, grey — canceled */
const orderStatusBadgeSx = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.IN_PROGRESS:
            return {
                bgcolor: '#e3f2fd',
                color: '#0d47a1',
                border: '1px solid #90caf9',
            };
        case OrderStatus.COMPLETED:
            return {
                bgcolor: '#e8f5e9',
                color: '#1b5e20',
                border: '1px solid #a5d6a7',
            };
        case OrderStatus.CANCELED:
            return {
                bgcolor: '#f5f5f5',
                color: '#424242',
                border: '1px solid #e0e0e0',
            };
        default:
            return {};
    }
};

/** «Стан»: badge + «Скасовано» + info icon; tight but not clipped */
const STATUS_COLUMN_WIDTH_PX = 122;

/** «Чек» chip (icon + label + padding) + tight cell padding */
const RECEIPT_COLUMN_WIDTH_PX = 100;

/** ⋮ overflow: medium IconButton (48×48) + horizontal cell padding */
const ACTIONS_COLUMN_WIDTH_PX = 56;

/** Black & white chip (same shape as status); used for receipt link */
const receiptChipSx = {
    bgcolor: '#fafafa',
    color: '#212121',
    border: '1px solid #bdbdbd',
    cursor: 'pointer',
    '&:hover': {
        bgcolor: '#f0f0f0',
        borderColor: '#9e9e9e',
    },
};

const OrdersTableComponent = ({ customerId, orders, setPage, onUpdate }: OrdersTableProps) => {
    const navigate = useNavigate();

    const [orderToCancel, setOrderToCancel] = useState<OrderBriefInfoDto | undefined>();
    const [orderIdForInfoModal, setOrderIdForInfoModal] = useState<number | undefined>();
    const [orderIdForUpdateModal, setOrderIdForUpdateModal] = useState<number | undefined>();
    const [actionsMenuAnchor, setActionsMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionsMenuOrder, setActionsMenuOrder] = useState<OrderBriefInfoDto | null>(null);

    const actionsMenuOpen = Boolean(actionsMenuAnchor && actionsMenuOrder);

    const openActionsMenu = (event: MouseEvent<HTMLElement>, order: OrderBriefInfoDto) => {
        setActionsMenuAnchor(event.currentTarget);
        setActionsMenuOrder(order);
    };

    const closeActionsMenu = () => {
        setActionsMenuAnchor(null);
        setActionsMenuOrder(null);
    };

    const onReceiptRequested = (order: OrderBriefInfoDto) => {
        if (order.receiptUrl) {
            window.open(order.receiptUrl, '_blank');
        }
    };

    const navigateToCompleteOrder = (order: OrderBriefInfoDto) => {
        const query = customerId ? `?customerId=${customerId}` : '';
        navigate(`/complete-order/${order.id}${query}`);
    };

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
                <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{ backgroundColor: '#b7cfd2', width: 56, maxWidth: 56 }}
                                align="center"
                            >
                                ID
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: '#b7cfd2',
                                    width: '48%',
                                    minWidth: 0,
                                }}
                                align="center"
                            >
                                Назва
                            </TableCell>
                            <TableCell
                                sx={{ backgroundColor: '#b7cfd2', width: 56, maxWidth: 64 }}
                                align="center"
                            >
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
                            <TableCell
                                sx={{
                                    backgroundColor: '#b7cfd2',
                                    width: STATUS_COLUMN_WIDTH_PX,
                                    maxWidth: STATUS_COLUMN_WIDTH_PX,
                                    minWidth: STATUS_COLUMN_WIDTH_PX,
                                    whiteSpace: 'nowrap',
                                }}
                                align="center"
                            >
                                Стан
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: '#b7cfd2',
                                    width: RECEIPT_COLUMN_WIDTH_PX,
                                    minWidth: RECEIPT_COLUMN_WIDTH_PX,
                                    maxWidth: RECEIPT_COLUMN_WIDTH_PX,
                                    px: 0.5,
                                    boxSizing: 'border-box',
                                    whiteSpace: 'nowrap',
                                }}
                                align="center"
                            />
                            <TableCell
                                sx={{
                                    backgroundColor: '#b7cfd2',
                                    width: ACTIONS_COLUMN_WIDTH_PX,
                                    minWidth: ACTIONS_COLUMN_WIDTH_PX,
                                    maxWidth: ACTIONS_COLUMN_WIDTH_PX,
                                    px: 0.5,
                                    boxSizing: 'border-box',
                                    whiteSpace: 'nowrap',
                                }}
                                align="center"
                            />
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
                                <TableCell align="center" sx={{ width: 56, maxWidth: 56 }}>
                                    <Typography variant="body2">{order.id}</Typography>
                                </TableCell>

                                {/* Products */}
                                <TableCell sx={{ minWidth: 0, overflow: 'hidden', verticalAlign: 'top' }}>
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
                                <TableCell align="center" sx={{ width: 56, maxWidth: 64 }}>
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
                                        {toTableDate(order.openedAt) ?? '-'}
                                    </Typography>
                                </TableCell>

                                {/* Completion date */}
                                <TableCell align="center">
                                    <Typography variant="body2">
                                        {toTableDate(order.closedAt) ?? '-'}
                                    </Typography>
                                </TableCell>

                                {/* Status (actions are in the overflow menu) */}
                                <TableCell
                                    align="center"
                                    sx={{
                                        verticalAlign: 'middle',
                                        width: STATUS_COLUMN_WIDTH_PX,
                                        maxWidth: STATUS_COLUMN_WIDTH_PX,
                                        minWidth: STATUS_COLUMN_WIDTH_PX,
                                        whiteSpace: 'nowrap',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    {order.status === OrderStatus.CANCELED ? (
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 0.25,
                                                maxWidth: '100%',
                                                px: 1.25,
                                                py: 0.5,
                                                borderRadius: 1,
                                                textAlign: 'center',
                                                ...orderStatusBadgeSx(order.status),
                                            }}
                                        >
                                            <Typography variant="body2" component="span" fontWeight={700}>
                                                {orderStatusToHumanText(order.status)}
                                            </Typography>
                                            <Tooltip
                                                title={
                                                    order.cancellationReason?.trim()
                                                        ? order.cancellationReason
                                                        : 'причина не вказана'
                                                }
                                                enterTouchDelay={0}
                                            >
                                                <IconButton
                                                    size="small"
                                                    aria-label="Причина скасування"
                                                    sx={{
                                                        p: 0.25,
                                                        color: 'inherit',
                                                        opacity: 0.85,
                                                        '&:hover': { opacity: 1 },
                                                    }}
                                                >
                                                    <InfoIcon sx={{ fontSize: '1rem' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'inline-block',
                                                maxWidth: '100%',
                                                px: 1.25,
                                                py: 0.5,
                                                borderRadius: 1,
                                                textAlign: 'center',
                                                ...orderStatusBadgeSx(order.status),
                                            }}
                                        >
                                            <Typography variant="body2" component="div" fontWeight={700}>
                                                {orderStatusToHumanText(order.status)}
                                            </Typography>
                                        </Box>
                                    )}
                                </TableCell>

                                {/* Receipt: chip opens URL (same shape as status, B&W) */}
                                <TableCell
                                    align="center"
                                    sx={{
                                        verticalAlign: 'middle',
                                        width: RECEIPT_COLUMN_WIDTH_PX,
                                        minWidth: RECEIPT_COLUMN_WIDTH_PX,
                                        maxWidth: RECEIPT_COLUMN_WIDTH_PX,
                                        px: 0.5,
                                        boxSizing: 'border-box',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {order.receiptUrl ? (
                                        <Box
                                            component="button"
                                            type="button"
                                            aria-label="Відкрити чек"
                                            onClick={() => onReceiptRequested(order)}
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 0.5,
                                                maxWidth: '100%',
                                                px: 1.25,
                                                py: 0.5,
                                                borderRadius: 1,
                                                font: 'inherit',
                                                ...receiptChipSx,
                                            }}
                                        >
                                            <OpenInNewIcon
                                                sx={{ fontSize: '1rem', flexShrink: 0 }}
                                                aria-hidden
                                            />
                                            <Typography
                                                variant="body2"
                                                component="span"
                                                fontWeight={700}
                                            >
                                                Чек
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            –
                                        </Typography>
                                    )}
                                </TableCell>

                                {/* Actions: overflow menu (…) */}
                                <TableCell
                                    align="center"
                                    sx={{
                                        verticalAlign: 'middle',
                                        width: ACTIONS_COLUMN_WIDTH_PX,
                                        minWidth: ACTIONS_COLUMN_WIDTH_PX,
                                        maxWidth: ACTIONS_COLUMN_WIDTH_PX,
                                        px: 0.5,
                                        boxSizing: 'border-box',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <IconButton
                                        id={`order-actions-trigger-${order.id}`}
                                        size="medium"
                                        aria-label="Дії з замовленням"
                                        aria-haspopup="true"
                                        aria-controls={actionsMenuOpen ? 'order-actions-menu' : undefined}
                                        aria-expanded={
                                            actionsMenuOpen && actionsMenuOrder?.id === order.id
                                                ? true
                                                : false
                                        }
                                        onClick={(e) => openActionsMenu(e, order)}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                id="order-actions-menu"
                anchorEl={actionsMenuAnchor}
                open={actionsMenuOpen}
                onClose={closeActionsMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    list: {
                        dense: true,
                        'aria-labelledby': actionsMenuOrder
                            ? `order-actions-trigger-${actionsMenuOrder.id}`
                            : undefined,
                    },
                }}
            >
                {actionsMenuOrder && (
                    <>
                        {actionsMenuOrder.status === OrderStatus.IN_PROGRESS && (
                            <>
                                <MenuItem
                                    onClick={() => {
                                        navigateToCompleteOrder(actionsMenuOrder);
                                        closeActionsMenu();
                                    }}
                                >
                                    <ListItemIcon>
                                        <CheckCircleOutlineIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Завершити" />
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        setOrderToCancel(actionsMenuOrder);
                                        closeActionsMenu();
                                    }}
                                >
                                    <ListItemIcon>
                                        <CancelOutlinedIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Скасувати" />
                                </MenuItem>
                                <Divider />
                                <MenuItem
                                    onClick={() => {
                                        setOrderIdForUpdateModal(actionsMenuOrder.id);
                                        closeActionsMenu();
                                    }}
                                >
                                    <ListItemIcon>
                                        <EditIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Редагувати" />
                                </MenuItem>
                            </>
                        )}
                        {actionsMenuOrder.status !== OrderStatus.IN_PROGRESS && (
                            <MenuItem
                                onClick={() => {
                                    setOrderIdForInfoModal(actionsMenuOrder.id);
                                    closeActionsMenu();
                                }}
                            >
                                <ListItemIcon>
                                    <InfoIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Деталі" />
                            </MenuItem>
                        )}
                    </>
                )}
            </Menu>

            <TablePagination
                count={orders.total}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPageOptions={[]}
                page={orders.page - 1}
                rowsPerPage={10}
                sx={{ border: 0 }}
            />

            {orderToCancel && (
                <CancelOrderComponent
                    isOpen={!!orderToCancel}
                    orderId={orderToCancel.id}
                    handleClose={() => setOrderToCancel(undefined)}
                    onUpdate={onUpdate}
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
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
};

export default OrdersTableComponent;
