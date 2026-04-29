import type { Area } from 'react-easy-crop';

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (e) => reject(e));
        if (url.startsWith('http://') || url.startsWith('https://')) {
            image.crossOrigin = 'anonymous';
        }
        image.src = url;
    });
}

/**
 * Renders the cropped region as a JPEG data URL (for product upload).
 * Optionally downscales so the longest side is at most `maxOutputSize` px.
 */
export async function getCroppedImageDataUrl(
    imageSrc: string,
    pixelCrop: Area,
    maxOutputSize = 1200,
): Promise<string> {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
    }

    const { width, height, x, y } = pixelCrop;
    const maxSide = Math.max(width, height);
    const scale = maxSide > maxOutputSize ? maxOutputSize / maxSide : 1;
    const outW = Math.round(width * scale);
    const outH = Math.round(height * scale);

    canvas.width = outW;
    canvas.height = outH;
    ctx.drawImage(image, x, y, width, height, 0, 0, outW, outH);
    return canvas.toDataURL('image/jpeg', 0.92);
}
