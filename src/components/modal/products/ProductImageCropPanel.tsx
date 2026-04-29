import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Box, FormControl, FormLabel, Slider, Stack, Typography } from '@mui/material';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { getCroppedImageDataUrl } from '../../../utils/cropImage.ts';

const ASPECT = 1;
const CROP_REGION_ID = 'product-image-crop-region';

export type ProductImageCropPanelHandle = {
    /** Latest crop as JPEG data URL, or `undefined` if there is no image / crop yet. */
    getCroppedDataUrlAsync: () => Promise<string | undefined>;
};

export interface ProductImageCropPanelProps {
    /** Data URL, blob URL, or same-origin / CORS image URL */
    imageSrc: string | null;
    /** Called when the cropped JPEG data URL changes (debounced after crop settles). */
    onCroppedDataUrl: (dataUrl: string) => void;
}

const ProductImageCropPanel = forwardRef<ProductImageCropPanelHandle, ProductImageCropPanelProps>(
    function ProductImageCropPanel({ imageSrc, onCroppedDataUrl }, ref) {
        const [crop, setCrop] = useState({ x: 0, y: 0 });
        const [zoom, setZoom] = useState(1);
        const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
        const croppedAreaPixelsRef = useRef<Area | null>(null);
        const imageSrcRef = useRef<string | null>(null);
        const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
        const onCroppedRef = useRef(onCroppedDataUrl);
        onCroppedRef.current = onCroppedDataUrl;

        /**
         * When `imageSrc` changes, clear crop pixels in the same render (before effects).
         * A previous `useEffect` here ran *after* child `onCropComplete` and wiped the ref.
         */
        const prevImageSrcRef = useRef<string | null>(null);
        if (prevImageSrcRef.current !== imageSrc) {
            prevImageSrcRef.current = imageSrc;
            croppedAreaPixelsRef.current = null;
        }
        imageSrcRef.current = imageSrc;

        const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
            croppedAreaPixelsRef.current = croppedPixels;
            setCroppedAreaPixels(croppedPixels);
        }, []);

        useImperativeHandle(
            ref,
            () => ({
                getCroppedDataUrlAsync: async () => {
                    const src = imageSrcRef.current;
                    if (!src) {
                        return undefined;
                    }
                    let pixels = croppedAreaPixelsRef.current;
                    if (!pixels) {
                        const deadline = Date.now() + 800;
                        while (!pixels && Date.now() < deadline) {
                            await new Promise((r) => setTimeout(r, 40));
                            pixels = croppedAreaPixelsRef.current;
                        }
                    }
                    if (!pixels) {
                        return undefined;
                    }
                    try {
                        return await getCroppedImageDataUrl(src, pixels);
                    } catch {
                        return undefined;
                    }
                },
            }),
            [],
        );

        useEffect(() => {
            if (!imageSrc) {
                setCroppedAreaPixels(null);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                return;
            }
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCroppedAreaPixels(null);
        }, [imageSrc]);

        useEffect(() => {
            if (!imageSrc || !croppedAreaPixels) {
                return;
            }

            const run = () => {
                void getCroppedImageDataUrl(imageSrc, croppedAreaPixels)
                    .then((url) => onCroppedRef.current(url))
                    .catch(() => {
                        /* ignore crop/export errors (e.g. CORS on external URL) */
                    });
            };

            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(run, 120);
            return () => {
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                }
            };
        }, [imageSrc, croppedAreaPixels, zoom]);

        if (!imageSrc) {
            return (
                <FormControl
                    fullWidth
                    sx={{
                        '& .MuiFormLabel-root + *': {
                            marginTop: 0,
                        },
                    }}
                >
                    <FormLabel htmlFor={CROP_REGION_ID}>Перегляд і кадрування</FormLabel>
                    <Box
                        id={CROP_REGION_ID}
                        sx={{
                            mt: 0,
                            width: '100%',
                            aspectRatio: '1 / 1',
                            borderRadius: 2,
                            border: '1px dashed',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: 3,
                            py: 3,
                            bgcolor: 'action.hover',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            Оберіть фото зліва — тут з’явиться перегляд і кадрування
                        </Typography>
                    </Box>
                </FormControl>
            );
        }

        return (
            <FormControl
                fullWidth
                sx={{
                    '& .MuiFormLabel-root + *': {
                        marginTop: 0,
                    },
                }}
            >
                <FormLabel htmlFor={CROP_REGION_ID}>Перегляд і кадрування</FormLabel>
                <Stack spacing={2} sx={{ width: '100%', mt: 0 }}>
                    <Box
                        id={CROP_REGION_ID}
                        sx={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '1 / 1',
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: 'grey.900',
                            mx: 0.5,
                        }}
                    >
                        <Box sx={{ position: 'absolute', inset: 0 }}>
                            <Cropper
                                key={imageSrc}
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={ASPECT}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </Box>
                    </Box>
                    <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                            Масштаб
                        </Typography>
                        <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.05}
                            aria-label="Масштаб зображення"
                            onChange={(_, v) => setZoom(v as number)}
                        />
                    </Stack>
                </Stack>
            </FormControl>
        );
    },
);

ProductImageCropPanel.displayName = 'ProductImageCropPanel';

export default ProductImageCropPanel;
