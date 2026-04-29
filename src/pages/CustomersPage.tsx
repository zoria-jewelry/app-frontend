import {
    Box,
    Button,
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
import { useNavigate } from 'react-router-dom';
import CreateCustomerComponent from '../components/modal/customers/CreateCustomerComponent.tsx';
import SearchBar from '../components/SearchBar.tsx';
import { showToast } from '../components/common/Toast.tsx';

const CustomersPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [entries, setEntries] = useState<CustomerDto[]>([]);

    const [searchPhrase, setSearchPhrase] = useState<string>('');

    const [isCreateComponentOpened, setIsCreateComponentOpened] = useState<boolean>(false);

    const fetchCustomers = useCallback(async () => {
        CustomersApiClient.get(page, searchPhrase)
            .then((customersList) => {
                if (!customersList) {
                    showToast('Не вдалось завантажити реєстр працівників', 'error');
                } else {
                    setEntries(customersList.entries);
                    setTotal(customersList.total);
                }
            })
            .catch((err) => {
                showToast('Не вдалось завантажити реєстр працівників', 'error');
                console.log(err);
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
            style={{ gap: theme.spacing(4), borderRadius: '10px' }}
            sx={{ alignItems: 'stretch' }}
        >
            {/* Page header */}
            <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
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
                    sx={{ textAlign: { xs: 'center', sm: 'left' } }}
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
                    flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent={{ xs: 'stretch', sm: 'flex-end' }}
                    gap={{ xs: 2, sm: 1.5, md: 2 }}
                    width={{ xs: '100%', sm: 'auto' }}
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
                            minWidth: { xs: '100%', sm: '170px', md: '200px' },
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

            {/* Table + pagination share tight vertical spacing (Paper gap would sit between them otherwise) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0.5 }}>
                <TableContainer
                    style={{
                        minWidth: '350px',
                        width: '100%',
                        maxHeight: '55vh',
                        overflowX: 'auto',
                        overflowY: 'auto',
                        boxSizing: 'content-box',
                    }}
                >
                    <Table
                        stickyHeader
                        sx={{
                            tableLayout: 'fixed',
                            width: '100%',
                            '& thead .MuiTableCell-root': {
                                textAlign: 'center',
                            },
                            '& thead .MuiTableCell-root:nth-of-type(1), & tbody .MuiTableCell-root:nth-of-type(1)':
                                {
                                    width: 26,
                                    maxWidth: 26,
                                    minWidth: 26,
                                    px: 0.5,
                                    textAlign: 'center',
                                },
                            '& thead .MuiTableCell-root:nth-of-type(2), & tbody .MuiTableCell-root:nth-of-type(2)':
                                {
                                    width: '24%',
                                    maxWidth: 260,
                                },
                            '& thead .MuiTableCell-root:nth-of-type(3), & tbody .MuiTableCell-root:nth-of-type(3)':
                                {
                                    width: 136,
                                    maxWidth: 136,
                                    textAlign: 'center',
                                },
                            '& thead .MuiTableCell-root:nth-of-type(4), & tbody .MuiTableCell-root:nth-of-type(4)':
                                {
                                    width: 72,
                                    maxWidth: 72,
                                    minWidth: 72,
                                    textAlign: 'center',
                                    whiteSpace: 'normal',
                                },
                            '& tbody .MuiTableCell-root:nth-of-type(2)': {
                                textAlign: 'left',
                            },
                            '& tbody .MuiTableCell-root': {
                                py: 2,
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    style={{ backgroundColor: '#b7cfd2', borderTopLeftRadius: 10 }}
                                >
                                    ID
                                </TableCell>
                                <TableCell style={{ backgroundColor: '#b7cfd2' }}>ПІБ</TableCell>
                                <TableCell style={{ backgroundColor: '#b7cfd2' }}>
                                    Номер телефону
                                </TableCell>
                                <TableCell
                                    sx={{
                                        backgroundColor: '#b7cfd2',
                                        borderTopRightRadius: 10,
                                        whiteSpace: 'normal',
                                        lineHeight: 1.25,
                                        py: 0.75,
                                    }}
                                >
                                    К-ть невиконаних замовлень
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {entries?.map((customer) => (
                                <TableRow
                                    key={customer.id}
                                    hover
                                    onClick={() => navigate(`/customers/${customer.id}`)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            navigate(`/customers/${customer.id}`);
                                        }
                                    }}
                                    tabIndex={0}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>
                                        <Typography variant="body2">{customer.id}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ overflow: 'hidden', maxWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            noWrap
                                            title={customer.fullName}
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {customer.fullName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{customer.phone}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {customer.activeOrders}
                                        </Typography>
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
                    sx={{
                        border: 0,
                        overflow: 'visible',
                        mt: 0,
                        pt: 0,
                    }}
                />
            </Box>

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
