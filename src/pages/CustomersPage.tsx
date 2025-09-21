import {
    Box,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { CustomerDto } from '../dto/customers.ts';
import { CustomersApiClient } from '../api/customersApiClient.ts';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import InfoIcon from '@mui/icons-material/InfoOutline';
import { useNavigate } from 'react-router-dom';
import CreateCustomerComponent from '../components/modal/customers/CreateCustomerComponent.tsx';
import SearchBar from '../components/SearchBar.tsx';

const CustomersPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [entries, setEntries] = useState<CustomerDto[]>([]);

    const [searchPhrase, setSearchPhrase] = useState<string>('');

    const [isCreateComponentOpened, setIsCreateComponentOpened] = useState<boolean>(false);

    const fetchCustomers = useCallback(async () => {
        CustomersApiClient.get(page, searchPhrase).then((customersList) => {
            if (!customersList) {
                // TODO: add toast
            } else {
                setEntries(customersList.entries);
                setTotal(customersList.total);
            }
        });
    }, [page, searchPhrase]);

    useEffect(() => {
        setPage(0);
    }, [searchPhrase]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            style={{ gap: theme.spacing(4), borderRadius: '10px', maxHeight: '80vh' }}
        >
            {/* Page header */}
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
                        Клієнти
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
                    <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        width="100%"
                        gap={1}
                        flex={1}
                    >
                        <SearchBar consumer={setSearchPhrase} />
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsCreateComponentOpened(true)}
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
                        Додати клієнта
                    </Button>
                </Box>
            </Box>

            {/* Data table */}
            <TableContainer
                style={{
                    minWidth: '350px',
                    overflow: 'auto',
                    boxSizing: 'content-box',
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopLeftRadius: 10 }}
                                width="80px"
                            >
                                ID
                            </TableCell>
                            <TableCell style={{ backgroundColor: '#b7cfd2' }} width="400px">
                                ПІБ
                            </TableCell>
                            <TableCell style={{ backgroundColor: '#b7cfd2' }} width="200px">
                                Номер телефону
                            </TableCell>
                            <TableCell style={{ backgroundColor: '#b7cfd2', textAlign: 'center' }}>
                                К-ть невиконаних замовлень
                            </TableCell>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopRightRadius: 10 }}
                            ></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries?.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell>
                                    <Typography variant="body2">{customer.id}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{customer.fullName}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{customer.phone}</Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2">{customer.activeOrders}</Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => navigate(`/customers/${customer.id}`)}
                                        size="small"
                                        style={{ padding: 0 }}
                                    >
                                        <InfoIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                count={total}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPageOptions={[]}
                page={page}
                rowsPerPage={10}
                style={{
                    marginTop: theme.spacing(4),
                    border: 0,
                    overflow: 'visible',
                }}
            />

            {/* Add new customer modal window */}
            <CreateCustomerComponent
                handleClose={() => {
                    fetchCustomers();
                    setIsCreateComponentOpened(false);
                }}
                isOpen={isCreateComponentOpened}
            />
        </Paper>
    );
};

export default CustomersPage;
