import {
    Box,
    Button,
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
import { useCallback, useEffect, useState } from 'react';
import { PriceListsApiClient } from '../../api/priceListsApiClient.ts';
import type { PriceListEntryDto } from '../../dto/price-lists.ts';
import { toLocalDate } from '../../utils.ts';
import CreatePriceListComponent from '../modal/pricelists/CreatePriceListComponent.tsx';
import { showToast } from '../common/Toast.tsx';

export interface CurrentPriceListComponentProps {
    onPriceListCreated: () => void;
}

const CurrentPriceListComponent = ({ onPriceListCreated }: CurrentPriceListComponentProps) => {
    const theme = useTheme();

    const [entries, setEntries] = useState<PriceListEntryDto[]>([]);
    const [activeListId, setActiveListId] = useState<number | undefined>(undefined);
    const [activeListStartDate, setActiveListStartDate] = useState<Date | undefined>(undefined);

    const [isCreationFormOpened, setIsCreationFormOpened] = useState<boolean>(false);

    const fetchCurrentPriceList = useCallback(() => {
        PriceListsApiClient.getActiveListDetails().then((priceList) => {
            if (!priceList) {
                showToast('Не вдалось завантажити поточний прайс лист', 'error');
            } else {
                setEntries(priceList.entries);
                setActiveListId(priceList.id);
                setActiveListStartDate(priceList.startDate);
            }
        });
    }, []);

    const handlePriceListCreated = useCallback(() => {
        fetchCurrentPriceList();
        onPriceListCreated();
    }, [onPriceListCreated, fetchCurrentPriceList]);

    useEffect(() => {
        fetchCurrentPriceList();
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
                    {activeListId
                        ? `Поточний прайс-лист №${activeListId} (від ${activeListStartDate && toLocalDate(activeListStartDate)})`
                        : 'Поточний прайс лист'}
                </Typography>

                <Button
                    onClick={() => setIsCreationFormOpened(true)}
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                        minWidth: { xs: '100%', sm: '200px', md: '250px' },
                        height: { xs: '48px', sm: '40px' },
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: 2,
                        '&:hover': { boxShadow: 4, transform: 'translateY(-1px)' },
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    Новий прайс-лист
                </Button>
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
                                        {entry.materialPrice}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <CreatePriceListComponent
                isOpen={isCreationFormOpened}
                handleClose={() => setIsCreationFormOpened(false)}
                onCreate={handlePriceListCreated}
            />
        </Paper>
    );
};

export default CurrentPriceListComponent;
