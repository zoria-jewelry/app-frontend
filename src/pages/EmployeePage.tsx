import {
    Box,
    Button,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
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
import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import type { EmployeeDto } from '../dto/employees.ts';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import ArchiveIcon from '@mui/icons-material/Inventory2Outlined';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { EmployeesApiClient } from '../api/employeesApiClient.ts';
import DialogComponent from '../components/modal/DialogComponent.tsx';
import EmployeesArchiveComponent from '../components/modal/employees/EmployeesArchiveComponent.tsx';
import CreateEmployeeComponent from '../components/modal/employees/CreateEmployeeComponent.tsx';
import EditEmployeeComponent from '../components/modal/employees/EditEmployeeComponent.tsx';
import { showToast } from '../components/common/Toast.tsx';

const EmployeePage = () => {
    const theme = useTheme();
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [entries, setEntries] = useState<EmployeeDto[]>([]);

    const [employeeToArchive, setEmployeeToArchive] = useState<EmployeeDto | null>(null);
    const [isArchiveDialogOpened, setIsArchiveDialogOpened] = useState<boolean>(false);

    const [isArchiveOpened, setIsArchiveOpened] = useState<boolean>(false);

    const [isCreateComponentOpened, setIsCreateComponentOpened] = useState<boolean>(false);
    const [employeeIdToEdit, setEmployeeIdToEdit] = useState<number | null>(null);

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
                    showToast('Працівник був успішно архівований');
                    if (page === 0) {
                        loadEmployees();
                    } else {
                        setPage(0);
                    }
                })
                .catch(() => {
                    showToast('Не вдалось заархівувати працівника', 'error');
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
                        Працівники
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
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setIsArchiveOpened(true)}
                        size="large"
                        sx={{
                            height: { xs: '48px', sm: '40px' },
                            fontWeight: 600,
                            borderRadius: 2,
                        }}
                    >
                        Відкрити архів
                    </Button>
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
                        Новий працівник
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
                                <TableCell align="center" sx={{ width: '1%', verticalAlign: 'middle' }}>
                                    <IconButton
                                        id={`employee-actions-trigger-${employee.id}`}
                                        size="medium"
                                        aria-label="Дії з працівником"
                                        aria-haspopup="true"
                                        aria-controls={actionsMenuOpen ? 'employee-actions-menu' : undefined}
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
                id="employee-actions-menu"
                anchorEl={actionsMenuAnchor}
                open={actionsMenuOpen}
                onClose={closeActionsMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    list: {
                        dense: true,
                        'aria-labelledby': actionsMenuEmployee
                            ? `employee-actions-trigger-${actionsMenuEmployee.id}`
                            : undefined,
                    },
                }}
            >
                {actionsMenuEmployee && (
                    <>
                        <MenuItem
                            onClick={() => {
                                setEmployeeIdToEdit(actionsMenuEmployee.id);
                                closeActionsMenu();
                            }}
                        >
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Редагувати" />
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleOpenArchiveEmployeeDialog(actionsMenuEmployee);
                                closeActionsMenu();
                            }}
                        >
                            <ListItemIcon>
                                <ArchiveIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Архівувати" />
                        </MenuItem>
                    </>
                )}
            </Menu>

            <TablePagination
                count={total}
                onPageChange={(_, p) => {
                    console.log(`SETTING PAGE ${p}`);
                    setPage(p);
                }}
                rowsPerPageOptions={[]}
                page={page}
                rowsPerPage={10}
                style={{
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
                onArchive={listUpdateCallback}
            />

            {/* Add new employee modal window */}
            <CreateEmployeeComponent
                handleClose={() => setIsCreateComponentOpened(false)}
                isOpen={isCreateComponentOpened}
                onCreate={listUpdateCallback}
            />

            {/* Edit employee modal window */}
            {employeeIdToEdit && (
                <EditEmployeeComponent
                    handleClose={() => setEmployeeIdToEdit(null)}
                    isOpen={!!employeeIdToEdit}
                    employeeId={employeeIdToEdit}
                    onUpdate={listUpdateCallback}
                />
            )}
        </Paper>
    );
};

export default EmployeePage;
