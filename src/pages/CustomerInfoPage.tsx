import { Box, Button, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import UpdateCustomerInfoComponent from '../components/customer/UpdateCustomerInfoComponent.tsx';
import UpdateCustomerBalancesComponent from '../components/customer/UpdateCustomerBalancesComponent.tsx';
import CustomerAuditRecordsComponent from '../components/customer/CustomerAuditRecordsComponent.tsx';
import OrdersTableComponent from '../components/common/OrdersTableComponent.tsx';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { OrdersListDto } from '../dto/orders.ts';
import { OrdersApiClient, type OrdersFilterData } from '../api/ordersApiClient.ts';
import SearchBar from '../components/SearchBar.tsx';
import FilterIcon from '@mui/icons-material/TuneOutlined';
import IconButton from '@mui/material/IconButton';
import OrdersFilterModal from '../components/modal/OrdersFilterComponent.tsx';
import CreateOrderComponent from '../components/modal/CreateOrderComponent.tsx';

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

    useEffect(() => {
        setOrdersPage(0);
    }, [ordersFilterData]);

    useEffect(() => {
        if (customerId) {
            OrdersApiClient.getByCustomerId(
                customerId,
                orderSearchPhrase,
                ordersFilterData,
                ordersPage,
            ).then((orders) => {
                if (orders) {
                    setOrders(orders);
                } else {
                    // TODO: add toast?
                }
            });
        }
    }, [ordersPage, orderSearchPhrase, customerId]);

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
                    overflow: 'scroll',
                    alignItems: 'stretch',
                    paddingBottom: theme.spacing(4),
                }}
            >
                <Typography variant="h3" textAlign="left" width="100%">
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
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                    flexWrap="wrap"
                    gap={2}
                >
                    <Typography variant="h3" textAlign="left">
                        Замовлення
                    </Typography>

                    <Box
                        display="flex"
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        gap={2}
                        width={{ xs: '100%', sm: 'auto' }}
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
                            sx={{ minWidth: { sm: '200px' } }}
                        >
                            Нове замовлення
                        </Button>
                    </Box>
                </Box>

                {orders && <OrdersTableComponent orders={orders} setPage={setOrdersPage} />}
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
