import { Box, Button, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import UpdateCustomerInfoComponent from '../components/customer/UpdateCustomerInfoComponent.tsx';
import UpdateCustomerBalancesComponent from '../components/customer/UpdateCustomerBalancesComponent.tsx';
import CustomerAuditRecordsComponent from '../components/customer/CustomerAuditRecordsComponent.tsx';
import OrdersTableComponent from '../components/common/OrdersTableComponent.tsx';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import type { OrdersListDto } from '../dto/orders.ts';
import { OrdersApiClient, type OrdersFilterData } from '../api/ordersApiClient.ts';
import SearchBar from '../components/SearchBar.tsx';
import FilterIcon from '@mui/icons-material/TuneOutlined';
import IconButton from '@mui/material/IconButton';
import OrdersFilterModal from '../components/modal/orders/OrdersFilterComponent.tsx';
import CreateOrderComponent from '../components/modal/orders/CreateOrderComponent.tsx';

const CustomerInfoPage = () => {
    const theme = useTheme();

    const [ordersPage, setOrdersPage] = useState<number>(0);
    const [orders, setOrders] = useState<OrdersListDto | undefined>();
    const [orderSearchPhrase, setOrderSearchPhrase] = useState<string>('');

    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const [ordersFilterData, setOrdersFilterData] = useState<OrdersFilterData | undefined>();

    const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState<boolean>(false);

    const params = useParams();
    const customerId: number | null = params.customerId ? Number(params.customerId) : null;

    const isMd = useMediaQuery(theme.breakpoints.down('md')); // < 900px

    const updateOrdersList = useCallback(
        (page: number = ordersPage) => {
            if (customerId) {
                OrdersApiClient.getByCustomerId(
                    customerId,
                    orderSearchPhrase,
                    ordersFilterData,
                    page,
                ).then((orders) => {
                    if (orders) {
                        setOrders(orders);
                    } else {
                        // TODO: add toast?
                    }
                });
            }
        },
        [customerId, orderSearchPhrase, ordersFilterData],
    );

    useEffect(() => {
        updateOrdersList(ordersPage);
    }, [ordersPage, updateOrdersList]);

    useEffect(() => {
        setOrdersPage(0);
        updateOrdersList(0);
    }, [ordersFilterData, updateOrdersList]);

    return (
        <Box width="85%">
            <Box
                height={isMd ? 'fit-content' : '50vh'}
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="space-between"
            >
                <Paper
                    className={`${paperStyles.halfPaper} ${commonStyles.flexColumn}`}
                    style={{
                        width: isMd ? '100%' : '49%',
                        marginBottom: isMd ? theme.spacing(4) : 0,
                        borderRadius: '10px',
                        height: 'inherit',
                    }}
                >
                    <Typography variant="h3" textAlign="left" width="100%">
                        Особисті дані клієнта
                    </Typography>
                    <UpdateCustomerInfoComponent />
                </Paper>
                <Paper
                    className={`${paperStyles.halfPaper} ${commonStyles.flexColumn}`}
                    style={{
                        width: isMd ? '100%' : '49%',
                        borderRadius: '10px',
                        height: 'inherit',
                    }}
                >
                    <Typography variant="h3" textAlign="left" width="100%">
                        Баланси клієнта
                    </Typography>
                    <UpdateCustomerBalancesComponent />
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
                <CustomerAuditRecordsComponent />
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
                        orders={orders}
                        setPage={setOrdersPage}
                        updateCallback={updateOrdersList}
                    />
                )}
            </Paper>

            <OrdersFilterModal
                open={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={setOrdersFilterData}
            />

            <CreateOrderComponent
                handleClose={() => setIsCreateOrderModalOpen(false)}
                isOpen={isCreateOrderModalOpen}
            />
        </Box>
    );
};

export default CustomerInfoPage;
