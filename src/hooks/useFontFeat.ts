import { Command, FontFeatures, Shape, UseFontFeatProps } from "@/types";

class FontFeatureCommand implements Command {
    constructor(
        private beforeShapes: Shape[],
        private afterShapes: Shape[],
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>
    ) { }

    execute() {
        this.setShapes(this.afterShapes);
    }

    undo() {
        this.setShapes(this.beforeShapes);
    }
}

export const useFontFeat = ({ shapes, setShapes, executeCommand }: UseFontFeatProps) => {

    const applyFontFeatures = (features: Partial<FontFeatures>) => {
        const before = shapes.map(s => ({ ...s }));

        const after = shapes.map(shape => {
            if (!shape.selected) return shape;

            return {
                ...shape,
                fontFamily: features.fontFamily ?? shape.fontFamily,
                fontSize: features.fontSize ?? shape.fontSize,
                fontStyles: features.fontStyles ?? shape.fontStyles,
                textAlignment: features.alignment ?? shape.textAlignment,
                listType: features.listType ?? shape.listType,
                textColor: features.textColor ?? shape.textColor,
            };
        });

        executeCommand(
            new FontFeatureCommand(before, after, setShapes)
        );
    };

    return {
        applyFontFeatures
    };
};
