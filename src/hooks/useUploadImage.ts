import { UseUploadImageProps } from '@/types';
import { ApplyImageCommand } from './commands/ImageCommands';

export const useUploadImage = ({ shapes, setShapes, executeCommand, setUploadedImageUrl, setLoadedImage, }: UseUploadImageProps) => {
    const applyImageToSelectedShape = (
        img: HTMLImageElement,
        base64: string
    ) => {
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

        executeCommand(
            new ApplyImageCommand(before, after, setShapes)
        );
    };

    const uploadImage = (base64: string) => {
        const selected = shapes.find(s => s.selected);
        if (!selected) {
            alert('Select a shape first');
            return;
        }

        const img = new Image();
        img.onload = () => {
            applyImageToSelectedShape(img, base64);
            setUploadedImageUrl(base64);
            setLoadedImage(img);
        };

        img.src = base64;
    };

    return {
        uploadImage,
        applyImageToSelectedShape,
    };
};
