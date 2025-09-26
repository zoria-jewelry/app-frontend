import { Box, IconButton, Paper, Typography, useTheme } from '@mui/material';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import FilterIcon from '@mui/icons-material/TuneOutlined';
import SearchBar from '../components/SearchBar.tsx';
import { useCallback, useEffect, useState } from 'react';
import OrdersTableComponent from '../components/common/OrdersTableComponent.tsx';
import OrdersFilterModal from '../components/modal/orders/OrdersFilterComponent.tsx';
import type { OrdersListDto } from '../dto/orders.ts';
import { OrdersApiClient, type OrdersFilterData } from '../api/ordersApiClient.ts';

const OrdersPage = () => {
    const theme = useTheme();

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [orderSearchPhrase, setOrderSearchPhrase] = useState('');
    const [ordersFilterData, setOrdersFilterData] = useState<OrdersFilterData | undefined>();

    const [orders, setOrders] = useState<OrdersListDto | undefined>();
    const [ordersPage, setOrdersPage] = useState<number>(0);

    const updateOrdersList = useCallback(
        (page: number = ordersPage) => {
            OrdersApiClient.getAll(orderSearchPhrase, ordersFilterData, page).then((orders) => {
                if (orders) {
                    setOrders(orders);
                } else {
                    // TODO: add toast?
                }
            });
        },
        [orderSearchPhrase, ordersFilterData],
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
            <Paper
                className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
                sx={{
                    gap: theme.spacing(4),
                    width: '100%',
                    marginTop: theme.spacing(4),
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
                    </Box>
                </Box>

                {orders && (
                    <OrdersTableComponent
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
        </Box>
    );
};

export default OrdersPage;
