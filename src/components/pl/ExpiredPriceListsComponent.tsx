import paperStyles from '../../styles/Paper.module.css';
import commonStyles from '../../styles/Common.module.css';
import {
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
import { PriceListsApiClient } from '../../api/priceListsApiClient';
import type { PriceListBundleEntryDto } from '../../dto/price-lists.ts';
import { toLocalDate } from '../../utils.ts';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ExpiredPriceListDetailsComponent from '../modal/pricelists/ExpiredPriceListDetailsComponent.tsx';

const ExpiredPriceListsComponent = () => {
    const theme = useTheme();

    const [page, setPage] = useState<number>(0);
    const [entries, setEntries] = useState<PriceListBundleEntryDto[]>([]);
    const [total, setTotal] = useState<number>(0);

    const [openedList, setOpenedList] = useState<PriceListBundleEntryDto | null>(null);

    useEffect(() => {
        PriceListsApiClient.getClosed(page).then((closedLists) => {
            if (!closedLists) {
                // TODO: add toast
            } else {
                setEntries(closedLists.entries);
                setTotal(closedLists.total);
            }
        });
    }, [page]);

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
            <Typography variant="h2" sx={{ alignSelf: 'flex-start', textAlign: 'left' }}>
                Завершені прайс-листи
            </Typography>
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
                                    <TableCell>{toLocalDate(entry.startDate)}</TableCell>
                                    <TableCell>{toLocalDate(entry.endDate)}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => setOpenedList(entry)}
                                            size="small"
                                            style={{ padding: 0 }}
                                        >
                                            <RemoveRedEyeIcon />
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
