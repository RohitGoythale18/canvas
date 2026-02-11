import { Command, FontFeatures, Shape, UseFontFeatProps } from "@/types";
import * as Y from "yjs";

class FontFeatureCommand implements Command {
    constructor(
        private beforeShapes: Shape[],
        private afterShapes: Shape[],
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
        private yShapes?: Y.Map<Shape>
    ) { }

    execute() {
        if (this.yShapes) {
            this.yShapes.doc?.transact(() => {
                this.afterShapes.forEach(s => {
                    const { imageElement: _, ...rest } = s as any;
                    this.yShapes?.set(s.id, { ...rest, selected: false });
                });
            });
        } else {
            this.setShapes(this.afterShapes);
        }
    }

    undo() {
        if (this.yShapes) {
            this.yShapes.doc?.transact(() => {
                this.beforeShapes.forEach(s => {
                    const { imageElement: _, ...rest } = s as any;
                    this.yShapes?.set(s.id, rest);
                });
            });
        } else {
            this.setShapes(this.beforeShapes);
        }
    }
}

export const useFontFeat = ({ shapes, setShapes, executeCommand, yShapes }: UseFontFeatProps) => {

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
            new FontFeatureCommand(before, after, setShapes, yShapes)
        );
    };

    return {
        applyFontFeatures
    };
};
