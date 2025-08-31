import {
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
    useTheme,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { EmployeeDto } from '../dto/employees.ts';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import ArchiveIcon from '@mui/icons-material/Inventory2Outlined';
import { EmployeesApiClient } from '../api/employeesApiClient.ts';
import DialogComponent from '../components/modal/DialogComponent.tsx';
import EmployeesArchiveComponent from '../components/modal/EmployeesArchiveComponent.tsx';
import CreateEmployeeComponent from '../components/modal/CreateEmployeeComponent.tsx';

const EmployeePage = () => {
    const theme = useTheme();
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [entries, setEntries] = useState<EmployeeDto[]>([]);

    const [employeeToArchive, setEmployeeToArchive] = useState<EmployeeDto | null>(null);
    const [isArchiveDialogOpened, setIsArchiveDialogOpened] = useState<boolean>(false);

    const [isArchiveOpened, setIsArchiveOpened] = useState<boolean>(false);

    const [isCreateComponentOpened, setIsCreateComponentOpened] = useState<boolean>(false);

    const loadEmployees = useCallback(() => {
        EmployeesApiClient.get(page).then((employeesList) => {
            if (employeesList) {
                setEntries(employeesList.entries);
                setTotal(employeesList.total);
            }
        });
    }, [page]);

    const handleOpenArchiveEmployeeDialog = (employee: EmployeeDto) => {
        setIsArchiveDialogOpened(true);
        setEmployeeToArchive(employee);
    };

    const handleArchiveEmployee = (id?: number) => {
        setIsArchiveDialogOpened(false);
        if (id) {
            EmployeesApiClient.moveToArchive(id)
                .then(() => {
                    if (page === 0) {
                        loadEmployees();
                    } else {
                        setPage(0);
                    }
                })
                .catch(() => {
                    // TODO: add toast
                });
        }
    };

    const listUpdateCallback = () => {
        if (page === 0) {
            loadEmployees();
        } else {
            setPage(0);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, [page, loadEmployees]);

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
                    <Typography variant="h2">Працівники</Typography>
                </Grid>
                <Grid>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setIsArchiveOpened(true)}
                        style={{ marginRight: theme.spacing(4), marginBottom: theme.spacing(1) }}
                    >
                        Відкрити архів
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ marginBottom: theme.spacing(1) }}
                        onClick={() => setIsCreateComponentOpened(true)}
                    >
                        Новий працівник
                    </Button>
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
                            <TableCell style={{ backgroundColor: '#b7cfd2' }} width="600px">
                                ПІБ
                            </TableCell>
                            <TableCell style={{ backgroundColor: '#b7cfd2' }} width="200px">
                                Номер телефону
                            </TableCell>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopRightRadius: 10 }}
                            ></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries?.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>
                                    <Typography variant="body2">{employee.id}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{employee.name}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{employee.phone}</Typography>
                                </TableCell>
                                <TableCell
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <IconButton
                                        onClick={() => handleOpenArchiveEmployeeDialog(employee)}
                                        size="small"
                                        style={{ padding: 0 }}
                                    >
                                        <ArchiveIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                count={total}
                onPageChange={(_, p) => {
                    console.log(`SETTING PAGE ${p}`);
                    setPage(p);
                }}
                rowsPerPageOptions={[]}
                page={page}
                rowsPerPage={3}
                style={{
                    marginTop: theme.spacing(4),
                    border: 0,
                    overflow: 'visible',
                }}
            />

            {/* Archive user modal window */}
            <DialogComponent
                handleClose={() => setIsArchiveDialogOpened(false)}
                handleAction={() => handleArchiveEmployee(employeeToArchive?.id)}
                isOpen={isArchiveDialogOpened}
                dialogText={`Ви впевнені, що хочете архівувати працівника ${employeeToArchive?.name}?`}
                actionButtonText="Архівувати"
                actionButtonVariant="error"
            />

            {/* Employees archive modal window */}
            <EmployeesArchiveComponent
                handleClose={() => setIsArchiveOpened(false)}
                isOpen={isArchiveOpened}
                callback={listUpdateCallback}
            />

            {/* Add new employee modal window */}
            <CreateEmployeeComponent
                handleClose={() => setIsCreateComponentOpened(false)}
                isOpen={isCreateComponentOpened}
                callback={listUpdateCallback}
            />
        </Paper>
    );
};

export default EmployeePage;
