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
import DialogComponent from '../components/DialogComponent.tsx';

const EmployeePage = () => {
    const theme = useTheme();
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [entries, setEntries] = useState<EmployeeDto[]>([]);

    const [employeeToArchiveId, setEmployeeToArchiveId] = useState<number | null>(null);
    const [isArchiveDialogOpened, setIsArchiveDialogOpened] = useState<boolean>(false);

    const handleOpenArchiveEmployeeDialog = (id: number) => {
        setIsArchiveDialogOpened(true);
        setEmployeeToArchiveId(id);
    };

    const handleArchiveEmployee = (id: number | null) => {
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
                    <Button variant="contained" color="primary">
                        Новий працівник
                    </Button>
                </Grid>
            </Grid>

            {/* Data table */}
            <TableContainer style={{ minWidth: '350px', borderRadius: '10px', overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>ПІБ</TableCell>
                            <TableCell>Номер телефону</TableCell>
                            <TableCell width={4}></TableCell>
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
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleOpenArchiveEmployeeDialog(employee.id)}
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
            <DialogComponent
                handleClose={() => setIsArchiveDialogOpened(false)}
                handleAction={() => handleArchiveEmployee(employeeToArchiveId)}
                isOpen={isArchiveDialogOpened}
                dialogText="Ви впевнені, що хочете архівувати працівника?"
                actionButtonText="Архівувати"
            />
        </Paper>
    );
};

export default EmployeePage;
