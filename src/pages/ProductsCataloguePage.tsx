import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Paper,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Inventory2Outlined';
import { useCallback, useEffect, useState } from 'react';
import type { ProductEntryDto } from '../dto/products.ts';
import { ProductsApiClient } from '../api/productsApiClient.ts';
import SearchBar from '../components/SearchBar.tsx';
import CreateProductComponent from '../components/modal/products/CreateProductComponent.tsx';
import DialogComponent from '../components/modal/DialogComponent.tsx';
import ProductsArchiveComponent from '../components/modal/products/ProductsArchiveComponent.tsx';

const ProductsCataloguePage = () => {
    const theme = useTheme();

    const [entries, setEntries] = useState<ProductEntryDto[]>([]);
    const [searchPhrase, setSearchPhrase] = useState<string>('');

    const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState<boolean>(false);

    const [isArchiveOpened, setIsArchiveOpened] = useState<boolean>(false);
    const [productToArchive, setProductToArchive] = useState<ProductEntryDto | null>(null);

    const isXs = useMediaQuery(theme.breakpoints.down('sm')); // <600px
    const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600–900px
    const isMd = useMediaQuery(theme.breakpoints.up('md')); // >900px

    let cardPercentWidth = '100%';
    if (isXs)
        cardPercentWidth = '100%'; // 1 per row
    else if (isSm)
        cardPercentWidth = '48%'; // 2 per row
    else if (isMd) cardPercentWidth = '31.5%'; // 3 per row

    const loadProducts = useCallback(() => {
        ProductsApiClient.getAll(searchPhrase)
            .then((productsList) => {
                if (productsList) {
                    setEntries(productsList);
                } else {
                    // TODO: add toast
                }
            })
            .catch((error) => {
                console.log(error);
                // TODO: add toast
            });
    }, [searchPhrase]);

    const handleArchiveProduct = (id?: number) => {
        if (id) {
            setProductToArchive(null);
            ProductsApiClient.moveToArchive(id)
                .then(loadProducts)
                .catch((error) => {
                    console.log(error);
                    // TODO: add toast
                });
        }
    };

    useEffect(() => {
        loadProducts();
    }, [searchPhrase, loadProducts]);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            style={{
                gap: theme.spacing(4),
                borderRadius: '10px',
                padding: '2rem',
                maxHeight: '85vh',
            }}
        >
            {/* Header */}
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
                <Box
                    display="flex"
                    flexDirection="column"
                    flex={1}
                    minWidth={0}
                    sx={{ textAlign: { xs: 'center', md: 'left' } }}
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
                        Каталог виробів
                    </Typography>
                </Box>

                <Box
                    display="flex"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    gap={{ xs: 2, sm: 1.5, md: 2 }}
                    width={{ xs: '100%', md: 'auto' }}
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
                    <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        width="100%"
                        gap={1}
                        flex={1}
                    >
                        <SearchBar consumer={setSearchPhrase} />
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsCreateProductModalOpen(true)}
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
                        Новий виріб
                    </Button>
                </Box>
            </Box>

            {/* Cards container */}
            <Box
                display="flex"
                flexWrap="wrap"
                gap={theme.spacing(5)}
                justifyContent="flex-start"
                overflow="scroll"
                padding={theme.spacing(1)}
                width="100%"
            >
                {entries.map((p) => (
                    <Box
                        key={p.id}
                        sx={{
                            // width: cardPercentWidth,
                            flexBasis: cardPercentWidth,
                            display: 'flex',
                        }}
                    >
                        <Card
                            sx={{
                                width: '100%',
                                boxShadow: 3,
                                borderRadius: 3,
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                p: 2,
                            }}
                        >
                            <IconButton
                                onClick={() => setProductToArchive(p)}
                                sx={{
                                    backgroundColor: 'white',
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                }}
                            >
                                <ArchiveIcon />
                            </IconButton>
                            <CardMedia
                                component="img"
                                sx={{
                                    height: 300,
                                    width: '100%',
                                    objectFit: 'contain',
                                }}
                                image={p.pictureUrl ?? '/unknown_product.png'}
                                title="Зображення виробу"
                            />
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="body1" fontWeight={700}>
                                    {p.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    АРТ: {p.article}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>

            <CreateProductComponent
                isOpen={isCreateProductModalOpen}
                handleClose={() => setIsCreateProductModalOpen(false)}
                callback={loadProducts}
            />

            {productToArchive && (
                <DialogComponent
                    handleClose={() => setProductToArchive(null)}
                    handleAction={() => handleArchiveProduct(productToArchive?.id)}
                    isOpen={!!productToArchive}
                    dialogText={`Ви впевнені, що хочете архівувати виріб "${productToArchive?.name}"?`}
                    actionButtonText="Архівувати"
                    actionButtonVariant="error"
                />
            )}

            <ProductsArchiveComponent
                handleClose={() => setIsArchiveOpened(false)}
                isOpen={isArchiveOpened}
                callback={loadProducts}
            />
        </Paper>
    );
};

export default ProductsCataloguePage;
