import {
    Box,
    Button,
    Grid,
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
    useMediaQuery,
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

    const isXs = useMediaQuery(theme.breakpoints.down('sm')); // <600px

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
            {/* Page name and button */}
            <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                style={{ gap: theme.spacing(4) }}
            >
                <Grid>
                    <Typography variant="h2">Клієнти</Typography>
                </Grid>
                <Grid>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <SearchBar consumer={setSearchPhrase} />
                        <Button
                            variant="contained"
                            color="primary"
                            style={{ marginBottom: theme.spacing(1) }}
                            sx={{ marginTop: theme.spacing(isXs ? 2 : 0) }}
                            onClick={() => setIsCreateComponentOpened(true)}
                        >
                            Додати клієнта
                        </Button>
                    </Box>
                </Grid>
            </Grid>

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
