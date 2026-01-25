import { UseClearImageProps } from "@/types";
import { ClearImageCommand } from "./commands/ClearImageCommand";

export const useClearImage = ({ shapes, setShapes, executeCommand, setUploadedImageUrl, setLoadedImage, }: UseClearImageProps) => {
    const clearImage = () => {
        const hasSelected = shapes.some(s => s.selected);
        if (!hasSelected) return;

        const before = shapes.map(s => ({ ...s }));

        const after = shapes.flatMap(s => {
            if (!s.selected) return [s];

            const hasImage = s.imageElement || s.imageBase64 || s.imageUrl;
            if (hasImage) {
                return [{
                    ...s,
                    imageElement: undefined,
                    imageBase64: undefined,
                    imageUrl: undefined,
                    imageId: undefined,
                }];
            }
            return []; // Remove shape if it doesn't have an image
        });

        executeCommand(
            new ClearImageCommand(before, after, setShapes)
        );

        setUploadedImageUrl(null);
        setLoadedImage(null);
    };

    return { clearImage };
};
