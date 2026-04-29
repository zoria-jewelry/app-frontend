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
import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogComponent from '../DialogComponent.tsx';
import type { ProductEntryDto } from '../../../dto/products.ts';
import { ProductsApiClient } from '../../../api/productsApiClient.ts';
import { showToast } from '../../common/Toast.tsx';
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

export interface ProductsArchiveComponentProps {
    handleClose: () => void;
    isOpen: boolean;
    onArchive: () => void;
}

const ProductsArchiveComponent = (props: ProductsArchiveComponentProps) => {
    const [entries, setEntries] = useState<ProductEntryDto[]>([]);

    const [isUnarchiveDialogOpened, setIsUnarchiveDialogOpened] = useState<boolean>(false);
    const [productToUnarchive, setProductToUnarchive] = useState<ProductEntryDto | null>(null);

    const [actionsMenuAnchor, setActionsMenuAnchor] = useState<null | HTMLElement>(null);
    const [actionsMenuProduct, setActionsMenuProduct] = useState<ProductEntryDto | null>(null);
    const actionsMenuOpen = Boolean(actionsMenuAnchor && actionsMenuProduct);

    const openActionsMenu = (event: MouseEvent<HTMLElement>, product: ProductEntryDto) => {
        setActionsMenuAnchor(event.currentTarget);
        setActionsMenuProduct(product);
    };

    const closeActionsMenu = () => {
        setActionsMenuAnchor(null);
        setActionsMenuProduct(null);
    };

    const theme = useTheme();

    const handleUnarchiveClick = (product: ProductEntryDto | null) => {
        setProductToUnarchive(product);
        setIsUnarchiveDialogOpened(true);
    };

    const loadArchivedProducts = useCallback(() => {
        ProductsApiClient.getArchived().then((products) => {
            if (!products) {
                showToast('Не вдалось завантажити архівовані продукти', 'error');
            } else {
                setEntries(products);
            }
        });
    }, []);

    const handleUnarchiveProduct = (id?: number) => {
        console.log(`Unarchive product ${id}`);
        if (id) {
            setIsUnarchiveDialogOpened(false);
            ProductsApiClient.removeFromArchive(id)
                .then(() => {
                    showToast('Продукт був успішно розархівований');
                    loadArchivedProducts();
                    props.onArchive();
                })
                .catch((error) => {
                    showToast('Не вдалось розархівувати продукт', 'error');
                    console.log(error);
                });
        }
    };

    const handleClose = () => {
        props.handleClose();
    };

    useEffect(() => {
        if (props.isOpen) {
            loadArchivedProducts();
        }
    }, [props.isOpen, loadArchivedProducts]);

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
            <Typography variant="h3">Архів виробів</Typography>

            {/* Archived products' list */}
            <TableContainer
                style={{
                    minWidth: '350px',
                    // maxHeight: '450px',
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
                                width="200px"
                            >
                                Фото
                            </TableCell>
                            <TableCell style={{ backgroundColor: '#b7cfd2' }} width="400px">
                                Назва
                            </TableCell>
                            <TableCell style={{ backgroundColor: '#b7cfd2' }} width="200px">
                                Артикул
                            </TableCell>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopRightRadius: 10 }}
                                width="30px"
                            ></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries?.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <img
                                        src={product.pictureUrl ?? '/unknown_product.png'}
                                        alt={`Зображення ${product.name}`}
                                        style={{
                                            width: '100px',
                                            height: 'auto',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{product.name}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{product.article}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                                    <IconButton
                                        id={`archived-product-actions-trigger-${product.id}`}
                                        size="medium"
                                        aria-label="Дії з виробом"
                                        aria-haspopup="true"
                                        aria-controls={
                                            actionsMenuOpen
                                                ? 'archived-product-actions-menu'
                                                : undefined
                                        }
                                        aria-expanded={
                                            actionsMenuOpen && actionsMenuProduct?.id === product.id
                                                ? true
                                                : false
                                        }
                                        onClick={(e) => openActionsMenu(e, product)}
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
                id="archived-product-actions-menu"
                anchorEl={actionsMenuAnchor}
                open={actionsMenuOpen}
                onClose={closeActionsMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    list: {
                        dense: true,
                        'aria-labelledby': actionsMenuProduct
                            ? `archived-product-actions-trigger-${actionsMenuProduct.id}`
                            : undefined,
                    },
                }}
            >
                {actionsMenuProduct && (
                    <MenuItem
                        onClick={() => {
                            handleUnarchiveClick(actionsMenuProduct);
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

            {/* Unarchive product modal window */}
            <DialogComponent
                handleClose={() => setIsUnarchiveDialogOpened(false)}
                handleAction={() => handleUnarchiveProduct(productToUnarchive?.id)}
                isOpen={isUnarchiveDialogOpened}
                dialogText={`Ви впевнені, що хочете розархівувати виріб ${productToUnarchive?.name}?`}
                actionButtonText="Розрхівувати"
                actionButtonVariant="primary"
            />
        </BootstrapDialog>
    );
};

export default ProductsArchiveComponent;
