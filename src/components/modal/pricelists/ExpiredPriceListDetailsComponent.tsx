import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { useEffect, useState } from 'react';
import { PriceListsApiClient } from '../../../api/priceListsApiClient.ts';
import type { PriceListEntryDto } from '../../../dto/price-lists.ts';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { toLocalDate } from '../../../utils.ts';
import { showToast } from '../../common/Toast.tsx';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        minWidth: '50%',
        minHeight: '80%',
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

export interface ExpiredPriceListDetailsProps {
    priceListId?: number;
    startDate?: Date;
    endDate?: Date;
    handleClose: () => void;
}

const ExpiredPriceListDetailsComponent = (props: ExpiredPriceListDetailsProps) => {
    const theme = useTheme();

    const [entries, setEntries] = useState<PriceListEntryDto[]>([]);

    useEffect(() => {
        if (props.priceListId) {
            PriceListsApiClient.getPriceListDetails(props.priceListId).then((priceList) => {
                if (!priceList) {
                    showToast('Не вдалось завантажити дані прайс листа', 'error');
                } else {
                    setEntries(priceList.entries);
                }
            });
        }
    }, [props.priceListId]);

    return (
        <BootstrapDialog
            onClose={props.handleClose}
            aria-labelledby="customized-dialog-title"
            open={!!props.priceListId}
        >
            {/* Close modal icon (X) */}
            <IconButton
                aria-label="close"
                onClick={props.handleClose}
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

            <Typography variant="h3">{`Деталі прайс листа №${props.priceListId ?? ''}`}</Typography>
            <Typography variant="body1">
                {`${toLocalDate(props.startDate)} – ${toLocalDate(props.endDate)}`}
            </Typography>

            {/* Archived employees' list */}
            <TableContainer
                style={{
                    minWidth: '350px',
                    maxHeight: '450px',
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
                            >
                                Назва матеріалу
                            </TableCell>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopRightRadius: 10 }}
                                sx={{ textAlign: 'right' }}
                            >
                                Вартість (грн за г)
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries?.map((material) => (
                            <TableRow
                                key={`price-list-${props.priceListId}-entry-${material.materialName}`}
                            >
                                <TableCell>
                                    <Typography variant="body2">{material.materialName}</Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2">
                                        {material.materialPrice}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </BootstrapDialog>
    );
};

export default ExpiredPriceListDetailsComponent;
