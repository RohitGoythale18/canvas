import { UseClearImageProps } from "@/types";
import { ClearImageCommand } from "./commands/ClearImageCommand";

export const useClearImage = ({ shapes, setShapes, executeCommand, setUploadedImageUrl, setLoadedImage, }: UseClearImageProps) => {
    const clearImage = () => {
        const hasSelected = shapes.some(
            s => s.selected && (s.imageElement || s.imageBase64)
        );

        if (!hasSelected) return;

        const before = shapes.map(s => ({ ...s }));

        const after = shapes.map(s =>
            s.selected
                ? {
                    ...s,
                    imageElement: undefined,
                    imageBase64: undefined,
                    imageUrl: undefined,
                    imageId: undefined,
                }
                : s
        );

        executeCommand(
            new ClearImageCommand(before, after, setShapes)
        );

        setUploadedImageUrl(null);
        setLoadedImage(null);
    };

    return { clearImage };
};
