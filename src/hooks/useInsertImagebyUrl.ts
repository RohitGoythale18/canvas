import { UseInsertImagebyUrlProps } from '@/types';
import { ApplyImageCommand } from './commands/ImageCommands';

export const useInsertImagebyUrl = ({
    shapes,
    setShapes,
    executeCommand,
    setUploadedImageUrl,
    setLoadedImage,
}: UseInsertImagebyUrlProps) => {
    const insertImageByUrl = (url: string) => {
        const selected = shapes.find(s => s.selected);
        if (!selected) {
            alert('Select a shape first');
            return;
        }

        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(img, 0, 0);
                try {
                    const base64 = canvas.toDataURL('image/png');
                    const before = shapes.map(s => ({ ...s }));
                    const after = shapes.map(shape =>
                        shape.selected
                            ? {
                                ...shape,
                                imageElement: img,
                                imageBase64: base64,
                            }
                            : shape
                    );

                    executeCommand(new ApplyImageCommand(before, after, setShapes));
                    setUploadedImageUrl(base64);
                    setLoadedImage(img);
                } catch (e) {
                    console.error("Could not convert image to base64", e);
                    // Fallback to proxy URL if base64 conversion fails
                    const before = shapes.map(s => ({ ...s }));
                    const after = shapes.map(shape =>
                        shape.selected
                            ? {
                                ...shape,
                                imageElement: img,
                                imageUrl: proxyUrl,
                            }
                            : shape
                    );

                    executeCommand(new ApplyImageCommand(before, after, setShapes));
                    setUploadedImageUrl(proxyUrl);
                    setLoadedImage(img);
                }
            }
        };
        img.onerror = () => {
            alert('Failed to load image. The URL might be invalid or the server is blocking our proxy.');
        };
        img.src = proxyUrl;
    };

    return { insertImageByUrl };
};
