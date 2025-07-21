import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
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
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import type { EmployeeDto } from '../../dto/employees.ts';
import { useEffect, useState } from 'react';
import { EmployeesApiClient } from '../../api/employeesApiClient.ts';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogComponent from './DialogComponent.tsx';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '70%',
        height: '90vh',
        padding: theme.spacing(12),
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(10),
        paddingTop: 0,
    },
}));

export interface EmployeesArchiveComponentProps {
    handleClose: () => void;
    isOpen: boolean;
}

const EmployeesArchiveComponent = (props: EmployeesArchiveComponentProps) => {
    const [entries, setEntries] = useState<EmployeeDto[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(0);

    const [isUnarchiveDialogOpened, setIsUnarchiveDialogOpened] = useState<boolean>(false);
    const [employeeToUnarchive, setEmployeeToUnarchive] = useState<EmployeeDto | null>(null);

    const theme = useTheme();

    const handleUnarchiveClick = (employee: EmployeeDto | null) => {
        setEmployeeToUnarchive(employee);
        setIsUnarchiveDialogOpened(true);
        console.log(`Unarchiving ${employee?.id}`);
        // TODO: call unarchive employee endpoint
    };

    const handleUnarchiveEmployee = (id?: number) => {
        setIsUnarchiveDialogOpened(false);
        console.log(`Unarchive employee ${id}`);
        // TODO: call unarchive endpoint
    };

    const handleClose = () => {
        props.handleClose();
        setPage(0);
    };

    useEffect(() => {
        EmployeesApiClient.getArchived(page).then((employeesList) => {
            if (!employeesList) {
                // TODO: add toast
            } else {
                setEntries(employeesList.entries);
                setTotal(employeesList.total);
            }
        });
    }, [page]);

    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={props.isOpen}
        >
            {/* Close modal icon (X) */}
            <IconButton
                aria-label="close"
                onClick={handleClose}
                size="large"
                sx={(theme) => ({
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon />
            </IconButton>
            <Typography variant="h3">Архів працівників</Typography>

            {/* Archived employees' list */}
            <TableContainer
                style={{
                    minWidth: '350px',
                    overflow: 'auto',
                    marginTop: theme.spacing(4),
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
                            <TableCell
                                width="50px"
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
                                <TableCell width="50px">
                                    <IconButton
                                        size="small"
                                        style={{ padding: 0 }}
                                        onClick={() => handleUnarchiveClick(employee)}
                                    >
                                        <UnarchiveIcon />
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
                    alignSelf: 'center',
                    overflow: 'visible',
                }}
            />

            {/* Unarchive employee modal window */}
            <DialogComponent
                handleClose={() => setIsUnarchiveDialogOpened(false)}
                handleAction={() => handleUnarchiveEmployee(employeeToUnarchive?.id)}
                isOpen={isUnarchiveDialogOpened}
                dialogText={`Ви впевнені, що хочете розархівувати працівника ${employeeToUnarchive?.name}?`}
                actionButtonText="Розрхівувати"
                actionButtonVariant="primary"
            />
        </BootstrapDialog>
    );
};

export default EmployeesArchiveComponent;
