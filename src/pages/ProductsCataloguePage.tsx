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
import { useEffect, useState } from 'react';
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

    const handleArchiveProduct = (id?: number) => {
        setProductToArchive(null);
        console.log(`Archive product ${id}`);
        // TODO: call archive endpoint
    };

    useEffect(() => {
        ProductsApiClient.getAll(searchPhrase).then((products) => {
            if (!products) {
                // TODO: add toast
            } else {
                setEntries(products);
            }
        });
    }, [searchPhrase]);

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
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                width="100%"
                marginBottom={theme.spacing(2)}
            >
                <Typography variant="h2">Каталог виробів</Typography>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{
                            marginTop: theme.spacing(isXs ? 2 : 0),
                            marginRight: theme.spacing(2),
                        }}
                        onClick={() => setIsArchiveOpened(true)}
                    >
                        Відкрити архів
                    </Button>
                    <SearchBar consumer={setSearchPhrase} />
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ marginTop: theme.spacing(isXs ? 2 : 0) }}
                        onClick={() => setIsCreateProductModalOpen(true)}
                    >
                        НОВИЙ ВИРІБ
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
            />
        </Paper>
    );
};

export default ProductsCataloguePage;
