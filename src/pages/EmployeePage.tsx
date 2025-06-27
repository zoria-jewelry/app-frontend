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
import { useEffect, useState } from 'react';
import type { EmployeeDto } from '../dto/employees.ts';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import ArchiveIcon from '@mui/icons-material/Inventory2Outlined';
import { EmployeesApiClient } from '../api/employeesApiClient.tsx';
import DialogComponent from '../components/modal/DialogComponent.tsx';
import EmployeesArchiveComponent from '../components/modal/EmployeesArchiveComponent.tsx';

const EmployeePage = () => {
    const theme = useTheme();
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [entries, setEntries] = useState<EmployeeDto[]>([]);

    const [employeeToArchive, setEmployeeToArchive] = useState<EmployeeDto | null>(null);
    const [isArchiveDialogOpened, setIsArchiveDialogOpened] = useState<boolean>(false);

    const [isArchiveOpened, setIsArchiveOpened] = useState<boolean>(false);

    const handleOpenArchiveEmployeeDialog = (employee: EmployeeDto) => {
        setIsArchiveDialogOpened(true);
        setEmployeeToArchive(employee);
    };

    const handleArchiveEmployee = (id?: number) => {
        setIsArchiveDialogOpened(false);
        console.log(`Archive employee ${id}`);
        // TODO: call archive endpoint
    };

    useEffect(() => {
        EmployeesApiClient.get(page).then((employeesList) => {
            if (!employeesList) {
                // TODO: add toast
            } else {
                setEntries(employeesList.entries);
                setTotal(employeesList.total);
            }
        });
    }, [page]);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            style={{ gap: theme.spacing(4), borderRadius: '10px' }}
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
                    >
                        Новий працівник
                    </Button>
                </Grid>
            </Grid>

            {/* Data table */}
            <TableContainer
                style={{
                    minWidth: '350px',
                    maxHeight: '500px',
                    overflow: 'auto',
                    paddingRight: '10px',
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
                onPageChange={(_, p) => setPage(p)}
                rowsPerPageOptions={[]}
                page={page}
                rowsPerPage={10}
                style={{
                    marginTop: theme.spacing(4),
                    border: 0,
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
            />
        </Paper>
    );
};

export default EmployeePage;
