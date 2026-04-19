import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

export interface ProductImageDropzoneProps {
    /** Matches `<label htmlFor={id}>` from the parent `FormLabel`. */
    inputId: string;
    /** Called with the first image file from click or drop. */
    onImageFile: (file: File) => void;
    /** When false (e.g. dialog closed), clears the displayed file name. */
    isActive?: boolean;
}

/**
 * Dashed drop area with drag-over highlight; hidden file input for accessibility and click-to-browse.
 * Inner content uses `pointer-events: none` so drag enter/leave do not flicker across child nodes.
 */
const ProductImageDropzone = ({ inputId, onImageFile, isActive = true }: ProductImageDropzoneProps) => {
    const theme = useTheme();
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isActive) {
            setSelectedFileName(null);
        }
    }, [isActive]);

    const applyFile = useCallback(
        (file: File | undefined) => {
            if (!file || !file.type.startsWith('image/')) {
                return;
            }
            setSelectedFileName(file.name);
            onImageFile(file);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        },
        [onImageFile],
    );

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!e.dataTransfer.types?.includes('Files')) {
            return;
        }
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types?.includes('Files')) {
            e.dataTransfer.dropEffect = 'copy';
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            applyFile(file);
        },
        [applyFile],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            applyFile(file);
        },
        [applyFile],
    );

    const borderColor = isDragging ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.26);
    const bgColor = isDragging
        ? alpha(theme.palette.primary.main, 0.07)
        : theme.palette.common.white;

    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept="image/*"
                hidden
                onChange={handleInputChange}
            />
            <Box
                component="label"
                htmlFor={inputId}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                sx={{
                    display: 'block',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor,
                    bgcolor: bgColor,
                    transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow'], {
                        duration: theme.transitions.duration.shorter,
                    }),
                    ...(isDragging && {
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}`,
                    }),
                    '&:focus-within': {
                        outline: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                        outlineOffset: 2,
                    },
                }}
            >
                <Box
                    sx={{
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        minHeight: 140,
                        px: 3,
                        py: 3,
                        width: '100%',
                    }}
                >
                    {selectedFileName ? (
                        <ImageOutlinedIcon
                            sx={{
                                fontSize: 40,
                                color: 'primary.main',
                            }}
                        />
                    ) : (
                        <CloudUploadOutlinedIcon
                            sx={{
                                fontSize: 40,
                                color: isDragging ? 'primary.main' : 'text.secondary',
                                transition: theme.transitions.create('color', {
                                    duration: theme.transitions.duration.shorter,
                                }),
                            }}
                        />
                    )}
                    <Typography
                        variant="body2"
                        color={isDragging ? 'primary' : selectedFileName ? 'text.primary' : 'text.secondary'}
                        textAlign="center"
                        title={selectedFileName ?? undefined}
                        sx={{
                            fontWeight: selectedFileName || isDragging ? 600 : 400,
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                        }}
                    >
                        {selectedFileName ?? 'Перетягніть зображення сюди'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                        {selectedFileName
                            ? 'Натисніть або перетягніть інше зображення, щоб замінити'
                            : 'або натисніть, щоб обрати файл (PNG, JPG, WebP…)'}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default ProductImageDropzone;
