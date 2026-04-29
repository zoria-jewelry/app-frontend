import paperStyles from '../../styles/Paper.module.css';
import commonStyles from '../../styles/Common.module.css';
import {
    Box,
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
import { useEffect, useState, type MouseEvent } from 'react';
import { PriceListsApiClient } from '../../api/priceListsApiClient';
import type { PriceListBundleEntryDto } from '../../dto/price-lists.ts';
import { toTableDate } from '../../utils.ts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ExpiredPriceListDetailsComponent from '../modal/pricelists/ExpiredPriceListDetailsComponent.tsx';
import { showToast } from '../common/Toast.tsx';

export interface ExpiredPriceListsComponentProps {
    refreshTrigger: number;
}

const ExpiredPriceListsComponent = ({ refreshTrigger }: ExpiredPriceListsComponentProps) => {
    const theme = useTheme();

    const [page, setPage] = useState<number>(0);
    const [entries, setEntries] = useState<PriceListBundleEntryDto[]>([]);
    const [total, setTotal] = useState<number>(0);

    const [openedList, setOpenedList] = useState<PriceListBundleEntryDto | null>(null);

    const [actionsMenuAnchor, setActionsMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionsMenuEntry, setActionsMenuEntry] = useState<PriceListBundleEntryDto | null>(null);
    const actionsMenuOpen = Boolean(actionsMenuAnchor && actionsMenuEntry);

    const openActionsMenu = (event: MouseEvent<HTMLElement>, entry: PriceListBundleEntryDto) => {
        setActionsMenuAnchor(event.currentTarget);
        setActionsMenuEntry(entry);
    };

    const closeActionsMenu = () => {
        setActionsMenuAnchor(null);
        setActionsMenuEntry(null);
    };

    useEffect(() => {
        PriceListsApiClient.getClosed(page).then((closedLists) => {
            if (!closedLists) {
                showToast('Не вдалось завантажити дані про закриті прайс листи', 'error');
            } else {
                setEntries(closedLists.entries);
                setTotal(closedLists.total);
            }
        });
    }, [page, refreshTrigger]);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            sx={{
                gap: theme.spacing(4),
                borderRadius: '10px',
                minHeight: '200px',
                paddingBottom: '2rem',
            }}
        >
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
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 600,
                        lineHeight: 1.2,
                        marginBottom: 0.5,
                        wordBreak: 'break-word',
                    }}
                >
                    Завершені прайс-листи
                </Typography>
            </Box>
            <TableContainer
                style={{
                    minWidth: '350px',
                    maxHeight: '500px',
                    overflow: 'auto',
                    boxSizing: 'content-box',
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopLeftRadius: 10 }}
                                width="25%"
                            >
                                ID
                            </TableCell>
                            <TableCell style={{ backgroundColor: '#b7cfd2' }} width="35%">
                                Дата створення
                            </TableCell>
                            <TableCell style={{ backgroundColor: '#b7cfd2' }} width="35%">
                                Дата закінчення
                            </TableCell>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopRightRadius: 10 }}
                                width="5%"
                            ></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries &&
                            entries.map((entry) => (
                                <TableRow key={`closed-pricing-${entry.id}`}>
                                    <TableCell>{entry.id}</TableCell>
                                    <TableCell>{toTableDate(entry.startDate)}</TableCell>
                                    <TableCell>{toTableDate(entry.endDate)}</TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ width: '1%', verticalAlign: 'middle' }}
                                    >
                                        <IconButton
                                            id={`expired-pricelist-actions-trigger-${entry.id}`}
                                            size="medium"
                                            aria-label="Дії з прайс-листом"
                                            aria-haspopup="true"
                                            aria-controls={
                                                actionsMenuOpen
                                                    ? 'expired-pricelist-actions-menu'
                                                    : undefined
                                            }
                                            aria-expanded={
                                                actionsMenuOpen && actionsMenuEntry?.id === entry.id
                                                    ? true
                                                    : false
                                            }
                                            onClick={(e) => openActionsMenu(e, entry)}
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
                id="expired-pricelist-actions-menu"
                anchorEl={actionsMenuAnchor}
                open={actionsMenuOpen}
                onClose={closeActionsMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    list: {
                        dense: true,
                        'aria-labelledby': actionsMenuEntry
                            ? `expired-pricelist-actions-trigger-${actionsMenuEntry.id}`
                            : undefined,
                    },
                }}
            >
                {actionsMenuEntry && (
                    <MenuItem
                        onClick={() => {
                            setOpenedList(actionsMenuEntry);
                            closeActionsMenu();
                        }}
                    >
                        <ListItemIcon>
                            <RemoveRedEyeIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Переглянути" />
                    </MenuItem>
                )}
            </Menu>

            <TablePagination
                count={total}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPageOptions={[]}
                page={page}
                rowsPerPage={10}
                style={{
                    border: 0,
                }}
            />

            <ExpiredPriceListDetailsComponent
                priceListId={openedList?.id}
                handleClose={() => setOpenedList(null)}
                startDate={openedList?.startDate}
                endDate={openedList?.endDate}
            />
        </Paper>
    );
};

export default ExpiredPriceListsComponent;
