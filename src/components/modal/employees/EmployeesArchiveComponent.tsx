import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import type { EmployeeDto } from '../../../dto/employees.ts';
import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { EmployeesApiClient } from '../../../api/employeesApiClient.ts';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogComponent from '../DialogComponent.tsx';
import { ARCHIVE_TABLE_MODAL_PAPER_MAX } from '../../../constants/createModalLayout.ts';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        width: ARCHIVE_TABLE_MODAL_PAPER_MAX,
        maxWidth: ARCHIVE_TABLE_MODAL_PAPER_MAX,
        boxSizing: 'border-box',
        height: 'auto',
        maxHeight: '90vh',
        padding: theme.spacing(12),
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(10),
        paddingTop: 0,
    },
}));

export interface EmployeesArchiveComponentProps {
    handleClose: () => void;
    isOpen: boolean;
    onArchive: () => void;
}

const EmployeesArchiveComponent = (props: EmployeesArchiveComponentProps) => {
    const [entries, setEntries] = useState<EmployeeDto[]>([]);

    const [isUnarchiveDialogOpened, setIsUnarchiveDialogOpened] = useState<boolean>(false);
    const [employeeToUnarchive, setEmployeeToUnarchive] = useState<EmployeeDto | null>(null);

    const [actionsMenuAnchor, setActionsMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionsMenuEmployee, setActionsMenuEmployee] = useState<EmployeeDto | null>(null);
    const actionsMenuOpen = Boolean(actionsMenuAnchor && actionsMenuEmployee);

    const openActionsMenu = (event: MouseEvent<HTMLElement>, employee: EmployeeDto) => {
        setActionsMenuAnchor(event.currentTarget);
        setActionsMenuEmployee(employee);
    };

    const closeActionsMenu = () => {
        setActionsMenuAnchor(null);
        setActionsMenuEmployee(null);
    };

    const theme = useTheme();

    const loadArchivedEmployees = useCallback(() => {
        EmployeesApiClient.getAllArchived().then((list) => {
            if (list) {
                setEntries(list);
            }
        });
    }, []);

    const handleUnarchiveClick = (employee: EmployeeDto | null) => {
        setEmployeeToUnarchive(employee);
        setIsUnarchiveDialogOpened(true);
    };

    const handleUnarchiveEmployee = (id?: number) => {
        setIsUnarchiveDialogOpened(false);
        console.log(`Unarchive employee ${id}`);
        if (id) {
            EmployeesApiClient.removeFromArchive(id).then(() => {
                loadArchivedEmployees();
                props.onArchive();
            });
        }
    };

    const handleClose = () => {
        props.handleClose();
    };

    useEffect(() => {
        if (props.isOpen) {
            loadArchivedEmployees();
        }
    }, [props.isOpen, loadArchivedEmployees]);

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
                                <TableCell
                                    width="50px"
                                    align="center"
                                    sx={{ verticalAlign: 'middle' }}
                                >
                                    <IconButton
                                        id={`archived-employee-actions-trigger-${employee.id}`}
                                        size="medium"
                                        aria-label="Дії з працівником"
                                        aria-haspopup="true"
                                        aria-controls={
                                            actionsMenuOpen ? 'archived-employee-actions-menu' : undefined
                                        }
                                        aria-expanded={
                                            actionsMenuOpen && actionsMenuEmployee?.id === employee.id
                                                ? true
                                                : false
                                        }
                                        onClick={(e) => openActionsMenu(e, employee)}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                id="archived-employee-actions-menu"
                anchorEl={actionsMenuAnchor}
                open={actionsMenuOpen}
                onClose={closeActionsMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    list: {
                        dense: true,
                        'aria-labelledby': actionsMenuEmployee
                            ? `archived-employee-actions-trigger-${actionsMenuEmployee.id}`
                            : undefined,
                    },
                }}
            >
                {actionsMenuEmployee && (
                    <MenuItem
                        onClick={() => {
                            handleUnarchiveClick(actionsMenuEmployee);
                            closeActionsMenu();
                        }}
                    >
                        <ListItemIcon>
                            <UnarchiveIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Розархівувати" />
                    </MenuItem>
                )}
            </Menu>

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
