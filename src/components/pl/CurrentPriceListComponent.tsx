import {
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import paperStyles from '../../styles/Paper.module.css';
import commonStyles from '../../styles/Common.module.css';
import { useEffect, useState } from 'react';
import { PriceListsApiClient } from '../../api/priceListsApiClient.ts';
import type { PriceListEntryDto } from '../../dto/price-lists.ts';
import { toFixedNumber, toLocalDate } from '../../utils.ts';
import CreatePriceListComponent from '../modal/CreatePriceListComponent.tsx';

const CurrentPriceListComponent = () => {
    const theme = useTheme();

    const [entries, setEntries] = useState<PriceListEntryDto[]>([]);
    const [activeListId, setActiveListId] = useState<number | undefined>(undefined);
    const [activeListStartDate, setActiveListStartDate] = useState<Date | undefined>(undefined);

    const [isCreationFormOpened, setIsCreationFormOpened] = useState<boolean>(false);

    useEffect(() => {
        PriceListsApiClient.getActiveListDetails().then((priceList) => {
            if (!priceList) {
                // Add error toast
            } else {
                setEntries(priceList.entries);
                setActiveListId(priceList.id);
                setActiveListStartDate(priceList.startDate);
            }
        });
    }, []);

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
            <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                style={{ gap: theme.spacing(4) }}
            >
                <Grid>
                    <Typography variant="h2">
                        {`Поточний прайс-лист №${activeListId} (від ${activeListStartDate && toLocalDate(activeListStartDate)})`}
                    </Typography>
                </Grid>
                <Grid>
                    <Button
                        style={{ marginBottom: theme.spacing(1) }}
                        onClick={() => setIsCreationFormOpened(true)}
                        variant="contained"
                        color="primary"
                    >
                        Новий прайс-лист
                    </Button>
                </Grid>
            </Grid>

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
                                width="80%"
                            >
                                Назва матеріалу
                            </TableCell>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopRightRadius: 10 }}
                                width="20%"
                                sx={{ textAlign: 'right' }}
                            >
                                Вартість (грн за г)
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries &&
                            entries.map((entry) => (
                                <TableRow key={`current-pricing-entry-${entry.materialName}`}>
                                    <TableCell>{entry.materialName}</TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        {toFixedNumber(entry.materialPrice, 2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <CreatePriceListComponent
                isOpen={isCreationFormOpened}
                handleClose={() => setIsCreationFormOpened(false)}
            />
        </Paper>
    );
};

export default CurrentPriceListComponent;
