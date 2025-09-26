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
                    flexDirection={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    width="100%"
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
                            Замовлення
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        gap={{ xs: 2, sm: 1.5, md: 2 }}
                        width={{ xs: '100%', md: 'auto' }}
                        minWidth={{ xs: 'auto', sm: 'fit-content' }}
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
        </Box>
    );
};

export default OrdersPage;
