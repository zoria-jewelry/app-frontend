import { Box, Button, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import CustomerAuditRecordsComponent from '../components/customer/CustomerAuditRecordsComponent.tsx';
import OrdersTableComponent from '../components/common/OrdersTableComponent.tsx';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import type { OrdersListDto } from '../dto/orders.ts';
import type { CustomerDto, CustomerBalanceDto } from '../dto/customers.ts';
import { OrdersApiClient, type OrdersFilterData } from '../api/ordersApiClient.ts';
import { CustomersApiClient } from '../api/customersApiClient.ts';
import SearchBar from '../components/SearchBar.tsx';
import FilterIcon from '@mui/icons-material/TuneOutlined';
import IconButton from '@mui/material/IconButton';
import OrdersFilterModal from '../components/modal/orders/OrdersFilterComponent.tsx';
import CreateOrderComponent from '../components/modal/orders/CreateOrderComponent.tsx';
import EditCustomerInfoComponent from '../components/modal/customers/EditCustomerInfoComponent.tsx';
import EditCustomerBalancesComponent from '../components/modal/customers/EditCustomerBalancesComponent.tsx';
import { showToast } from '../components/common/Toast.tsx';
import { toFixedNumber } from '../utils.ts';

const CustomerInfoPage = () => {
    const theme = useTheme();

    const [ordersPage, setOrdersPage] = useState<number>(0);
    const [orders, setOrders] = useState<OrdersListDto | undefined>();
    const [orderSearchPhrase, setOrderSearchPhrase] = useState<string>('');

    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const [ordersFilterData, setOrdersFilterData] = useState<OrdersFilterData | undefined>();

    const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState<boolean>(false);

    const [isEditCustomerInfoModalOpen, setIsEditCustomerInfoModalOpen] = useState<boolean>(false);
    const [isEditCustomerBalancesModalOpen, setIsEditCustomerBalancesModalOpen] =
        useState<boolean>(false);

    const [customerInfo, setCustomerInfo] = useState<CustomerDto | undefined>();
    const [customerBalances, setCustomerBalances] = useState<CustomerBalanceDto | undefined>();

    const params = useParams();
    const customerId: number | null = params.customerId ? Number(params.customerId) : null;

    const isMd = useMediaQuery(theme.breakpoints.down('md')); // < 900px

    const [refresher, setRefresher] = useState<number>(0);

    const updateOrdersList = useCallback(
        (page: number = ordersPage) => {
            if (customerId) {
                OrdersApiClient.getByCustomerId(
                    customerId,
                    orderSearchPhrase,
                    ordersFilterData,
                    page,
                )
                    .then((orders) => {
                        if (orders) {
                            setOrders(orders);
                        } else {
                            showToast('Не вдалось завантажити замовлення клієнта', 'error');
                        }
                    })
                    .catch((err) => {
                        showToast('Не вдалось завантажити замовлення клієнта', 'error');
                        console.log(err);
                    });
            }
        },
        [customerId, orderSearchPhrase, ordersFilterData],
    );

    useEffect(() => {
        if (updateOrdersList && ordersPage) {
            updateOrdersList(ordersPage);
        }
    }, [ordersPage, updateOrdersList]);

    useEffect(() => {
        setOrdersPage(0);
        updateOrdersList(0);
    }, [ordersFilterData, updateOrdersList]);

    const fetchCustomerInfo = useCallback(() => {
        if (!customerId) return;
        CustomersApiClient.getInfoById(customerId).then((info) => {
            if (info) {
                setCustomerInfo(info);
            }
        });
    }, [customerId]);

    const fetchCustomerBalances = useCallback(() => {
        if (!customerId) return;
        CustomersApiClient.getCustomerBalanceById(customerId).then((balances) => {
            if (balances) {
                setCustomerBalances(balances);
            }
        });
    }, [customerId]);

    useEffect(() => {
        fetchCustomerInfo();
        fetchCustomerBalances();
    }, [fetchCustomerInfo, fetchCustomerBalances, refresher]);

    return (
        <Box width="85%">
            <Box
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="space-between"
                gap={theme.spacing(2)}
            >
                <Paper
                    className={`${paperStyles.halfPaper} ${commonStyles.flexColumn}`}
                    style={{
                        width: isMd ? '100%' : '49%',
                        marginBottom: isMd ? theme.spacing(4) : 0,
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                        marginBottom={theme.spacing(3)}
                        paddingBottom={theme.spacing(2)}
                        borderBottom={`2px solid ${theme.palette.divider}`}
                    >
                        <Typography variant="h3" textAlign="left">
                            Особисті дані клієнта
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setIsEditCustomerInfoModalOpen(true)}
                        >
                            Редагувати
                        </Button>
                    </Box>
                    <Box display="flex" flexDirection="column" width="100%" gap={theme.spacing(3)}>
                        <Box
                            sx={{
                                padding: theme.spacing(2),
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                borderRadius: '8px',
                                border: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                                gap={theme.spacing(1)}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        color: theme.palette.text.secondary,
                                        minWidth: { xs: '100%', sm: 'auto' },
                                    }}
                                >
                                    ПІБ
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, fontSize: '1rem' }}
                                >
                                    {customerInfo?.fullName || '—'}
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                padding: theme.spacing(2),
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                borderRadius: '8px',
                                border: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                                gap={theme.spacing(1)}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        color: theme.palette.text.secondary,
                                        minWidth: { xs: '100%', sm: 'auto' },
                                    }}
                                >
                                    Номер телефону
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, fontSize: '1rem' }}
                                >
                                    {customerInfo?.phone || '—'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
                <Paper
                    className={`${paperStyles.halfPaper} ${commonStyles.flexColumn}`}
                    style={{
                        width: isMd ? '100%' : '49%',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                        marginBottom={theme.spacing(3)}
                        paddingBottom={theme.spacing(2)}
                        borderBottom={`2px solid ${theme.palette.divider}`}
                    >
                        <Typography variant="h3" textAlign="left">
                            Баланси клієнта
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setIsEditCustomerBalancesModalOpen(true)}
                        >
                            Оновити
                        </Button>
                    </Box>
                    <Box
                        display="flex"
                        flexDirection="column"
                        width="100%"
                        gap={theme.spacing(1.5)}
                    >
                        {customerBalances?.entries && customerBalances.entries.length > 0 ? (
                            customerBalances.entries.map((entry) => (
                                <Box
                                    key={entry.materialId}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{
                                        padding: theme.spacing(1.5, 2),
                                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                        borderRadius: '6px',
                                        border: `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            color: theme.palette.text.secondary,
                                        }}
                                    >
                                        {entry.materialName}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#000000',
                                            fontSize: '1rem',
                                            minWidth: 'fit-content',
                                            marginLeft: theme.spacing(2),
                                        }}
                                    >
                                        {toFixedNumber(
                                            entry.value,
                                            entry.materialId === null ? 2 : 3,
                                        )}{' '}
                                        {entry.materialId === null ? '₴' : 'г'}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ padding: theme.spacing(2) }}
                            >
                                Немає даних
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Box>
            <Paper
                className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
                sx={{
                    gap: theme.spacing(4),
                    width: '100%',
                    marginTop: theme.spacing(4),
                    maxHeight: '40vh',
                    borderRadius: '10px',
                    alignItems: 'stretch',
                    paddingBottom: theme.spacing(4),
                }}
            >
                <Typography
                    variant="h3"
                    textAlign="left"
                    width="100%"
                    marginLeft={theme.spacing(2)}
                >
                    Історія змін
                </Typography>
                <CustomerAuditRecordsComponent refresher={refresher} />
            </Paper>
            <Paper
                className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
                sx={{
                    gap: theme.spacing(4),
                    width: '100%',
                    marginTop: theme.spacing(4),
                    minHeight: '40vh',
                }}
            >
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
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 600,
                            lineHeight: 1.2,
                            marginBottom: 0.5,
                            wordBreak: 'break-word',
                        }}
                    >
                        Замовлення
                    </Typography>

                    <Box
                        display="flex"
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        gap={{ xs: 2, sm: 1.5, md: 2 }}
                        width={{ xs: '100%', md: 'auto' }}
                        minWidth={{ xs: 'auto', sm: 'fit-content' }}
                    >
                        <Box
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            width="100%"
                            gap={1}
                            flex={1}
                        >
                            <IconButton
                                size="large"
                                onClick={() => setIsFilterModalOpen(true)}
                                aria-label="Filter"
                            >
                                <FilterIcon />
                            </IconButton>
                            <SearchBar consumer={setOrderSearchPhrase} />
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setIsCreateOrderModalOpen(true)}
                            size="large"
                            sx={{
                                minWidth: { xs: '100%', sm: '200px', md: '250px' },
                                height: { xs: '48px', sm: '40px' },
                                fontWeight: 600,
                                borderRadius: 2,
                                boxShadow: 2,
                                '&:hover': { boxShadow: 4, transform: 'translateY(-1px)' },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            Нове замовлення
                        </Button>
                    </Box>
                </Box>

                {orders && (
                    <OrdersTableComponent
                        customerId={customerId}
                        orders={orders}
                        setPage={setOrdersPage}
                        onUpdate={updateOrdersList}
                    />
                )}
            </Paper>

            <OrdersFilterModal
                open={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={setOrdersFilterData}
            />

            {customerId && (
                <CreateOrderComponent
                    clientId={customerId}
                    handleClose={() => setIsCreateOrderModalOpen(false)}
                    isOpen={isCreateOrderModalOpen}
                    onCreate={updateOrdersList}
                />
            )}

            {customerId && (
                <EditCustomerInfoComponent
                    isOpen={isEditCustomerInfoModalOpen}
                    handleClose={() => setIsEditCustomerInfoModalOpen(false)}
                    customerId={customerId}
                    onUpdate={() => setRefresher((v) => v + 1)}
                />
            )}

            {customerId && (
                <EditCustomerBalancesComponent
                    isOpen={isEditCustomerBalancesModalOpen}
                    handleClose={() => setIsEditCustomerBalancesModalOpen(false)}
                    customerId={customerId}
                    onUpdate={() => setRefresher((v) => v + 1)}
                />
            )}
        </Box>
    );
};

export default CustomerInfoPage;
