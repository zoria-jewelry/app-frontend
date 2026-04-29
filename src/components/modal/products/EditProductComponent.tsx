import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import { useForm } from 'react-hook-form';
import { type UpdateProductFormData, updateProductSchema } from '../../../validation/schemas.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { ProductsApiClient } from '../../../api/productsApiClient.ts';
import { showToast } from '../../common/Toast.tsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductEntryDto } from '../../../dto/products.ts';
import {
    FORM_HELPER_TEXT_ALIGNED_SX,
    PRODUCT_CREATE_EDIT_MODAL_PAPER_MAX,
} from '../../../constants/createModalLayout.ts';
import ProductImageCropPanel, {
    type ProductImageCropPanelHandle,
} from './ProductImageCropPanel.tsx';
import ProductImageDropzone from './ProductImageDropzone.tsx';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(10),
        marginTop: theme.spacing(8),
    },
    '& .MuiPaper-root': {
        borderRadius: 20,
        width: PRODUCT_CREATE_EDIT_MODAL_PAPER_MAX,
        maxWidth: PRODUCT_CREATE_EDIT_MODAL_PAPER_MAX,
        boxSizing: 'border-box',
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

export interface EditProductComponentProps {
    isOpen: boolean;
    handleClose: () => void;
    productId: number;
    onUpdate: () => void;
}

const EditProductComponent = (props: EditProductComponentProps) => {
    const theme = useTheme();
    const [product, setProduct] = useState<ProductEntryDto | undefined>();
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const cropPanelRef = useRef<ProductImageCropPanelHandle>(null);

    const {
        register,
        handleSubmit,
        clearErrors,
        reset,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<UpdateProductFormData>({
        resolver: zodResolver(updateProductSchema),
        reValidateMode: 'onSubmit',
        defaultValues: {
            name: product?.name ?? '',
            article: product?.article ?? '',
            pictureBase64: undefined,
        },
    });

    useEffect(() => {
        if (props.isOpen && product) {
            reset({
                name: product.name,
                article: product.article,
                pictureBase64: undefined,
            });
        }
    }, [product, reset, props.isOpen]);

    /**
     * Load picture as a data URL when `fetch` succeeds (same-origin or remote with CORS, e.g. S3 bucket rules).
     * Otherwise fall back to the raw URL — preview may work, but canvas export needs CORS or a new upload.
     */
    useEffect(() => {
        if (!props.isOpen) {
            return;
        }
        if (!product?.pictureUrl) {
            setCropImageSrc(null);
            return;
        }
        const raw = product.pictureUrl;
        if (raw.startsWith('data:')) {
            setCropImageSrc(raw);
            return;
        }
        let cancelled = false;
        const absoluteUrl =
            raw.startsWith('http://') || raw.startsWith('https://')
                ? raw
                : new URL(raw, window.location.origin).href;

        const blobToDataUrl = (blob: Blob) =>
            new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

        void (async () => {
            try {
                const r = await fetch(absoluteUrl, { credentials: 'include', mode: 'cors' });
                if (!r.ok) {
                    throw new Error('fetch failed');
                }
                const blob = await r.blob();
                const dataUrl = await blobToDataUrl(blob);
                if (!cancelled) {
                    setCropImageSrc(dataUrl);
                }
            } catch {
                if (!cancelled) {
                    setCropImageSrc(raw);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [props.isOpen, product?.pictureUrl]);

    useEffect(() => {
        if (props.isOpen && props.productId) {
            ProductsApiClient.getById(props.productId)
                .then((foundProduct) => {
                    if (foundProduct) {
                        setProduct(foundProduct);
                    }
                })
                .catch((error) => {
                    console.error('Failed to fetch product:', error);
                    showToast('Не вдалось завантажити інформацію про виріб', 'error');
                });
        }
    }, [props.isOpen, props.productId]);

    const handleClose = (): void => {
        clearErrors();
        reset();
        setCropImageSrc(null);
        props.handleClose();
    };

    const onCroppedDataUrl = useCallback(
        (dataUrl: string) => {
            setValue('pictureBase64', dataUrl, { shouldValidate: true });
        },
        [setValue],
    );

    const handlePhotoFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setCropImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const onSubmit = async (data: UpdateProductFormData) => {
        const freshCrop = await cropPanelRef.current?.getCroppedDataUrlAsync();
        const trimmedFresh = typeof freshCrop === 'string' ? freshCrop.trim() : '';
        if (trimmedFresh.length > 0) {
            setValue('pictureBase64', trimmedFresh, { shouldDirty: true, shouldValidate: true });
        }
        const pictureBase64 = trimmedFresh || getValues('pictureBase64')?.trim() || undefined;

        const payload: UpdateProductFormData = {
            name: data.name,
            article: data.article,
            ...(pictureBase64 ? { pictureBase64 } : {}),
        };

        ProductsApiClient.update(props.productId, payload)
            .then(() => {
                showToast('Виріб було успішно оновлено');
                handleClose();
                props.onUpdate();
            })
            .catch((error) => {
                showToast('Не вдалось оновити виріб', 'error');
                console.log(error);
            });
    };

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

            {/* Form title */}
            <Typography variant="h3" textAlign="center">
                Редагування виробу
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <input type="hidden" {...register('pictureBase64')} />
                <Box sx={{ mt: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: { xs: 3, md: 6 },
                            alignItems: 'flex-start',
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <FormControl fullWidth>
                                <FormLabel htmlFor="name">Назва</FormLabel>
                                <TextField
                                    id="name"
                                    placeholder="Обручка з діамантами"
                                    fullWidth
                                    margin="dense"
                                    defaultValue=""
                                    {...register('name')}
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    slotProps={{
                                        formHelperText: { sx: FORM_HELPER_TEXT_ALIGNED_SX },
                                    }}
                                    sx={{
                                        margin: 0,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '6px',
                                        },
                                    }}
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <FormLabel htmlFor="article">Артикул</FormLabel>
                                <TextField
                                    id="article"
                                    placeholder="1102-10015/1(2,0)"
                                    fullWidth
                                    margin="dense"
                                    defaultValue=""
                                    {...register('article')}
                                    error={!!errors.article}
                                    helperText={errors.article?.message}
                                    slotProps={{
                                        formHelperText: { sx: FORM_HELPER_TEXT_ALIGNED_SX },
                                    }}
                                    sx={{
                                        margin: 0,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '6px',
                                        },
                                    }}
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <FormLabel
                                    htmlFor="photo"
                                    sx={{
                                        color: theme.palette.text.primary,
                                        '&.Mui-focused': {
                                            color: theme.palette.text.primary,
                                        },
                                    }}
                                >
                                    Фото виробу (залиште порожнім, щоб не змінювати)
                                </FormLabel>
                                <ProductImageDropzone
                                    inputId="photo"
                                    onImageFile={handlePhotoFile}
                                    isActive={props.isOpen}
                                />
                            </FormControl>
                        </Box>
                        <Box
                            sx={{
                                width: { xs: '100%', md: 380 },
                                flexShrink: 0,
                                ml: { md: 2 },
                                pl: { md: 4 },
                                pr: { md: 3 },
                                py: { xs: 2, md: 0 },
                                px: { xs: 2, md: 0 },
                            }}
                        >
                            <ProductImageCropPanel
                                ref={cropPanelRef}
                                imageSrc={cropImageSrc}
                                onCroppedDataUrl={onCroppedDataUrl}
                            />
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: { xs: 4, md: 5 },
                        }}
                    >
                        <Button variant="contained" color="primary" type="submit" size="large">
                            Зберегти
                        </Button>
                    </Box>
                </Box>
            </form>
        </BootstrapDialog>
    );
};

export default EditProductComponent;
