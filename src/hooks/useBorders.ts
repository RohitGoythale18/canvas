import { Command, Shape, UseBordersProps } from "@/types";
import * as Y from "yjs";

class BorderCommand implements Command {
    constructor(
        private before: Shape[],
        private after: Shape[],
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>,
        private yShapes?: Y.Map<Shape>
    ) { }

    execute() {
        if (this.yShapes) {
            this.yShapes.doc?.transact(() => {
                this.after.forEach(s => {
                    const { imageElement: _, ...rest } = s as any;
                    this.yShapes?.set(s.id, { ...rest, selected: false });
                });
            });
        } else {
            this.setShapes(this.after);
        }
    }

    undo() {
        if (this.yShapes) {
            this.yShapes.doc?.transact(() => {
                this.before.forEach(s => {
                    const { imageElement: _, ...rest } = s as any;
                    this.yShapes?.set(s.id, rest);
                });
            });
        } else {
            this.setShapes(this.before);
        }
    }
}

export const useBorders = ({ shapes, setShapes, executeCommand, yShapes }: UseBordersProps) => {

    const applyBorder = (border: {
        type: 'solid' | 'dashed' | 'dotted';
        size: number;
        color: string;
    }) => {
        const before = shapes.map(s => ({ ...s }));

        const after = shapes.map(shape =>
            shape.selected
                ? {
                    ...shape,
                    borderType: border.type,
                    borderSize: border.size,
                    borderColor: border.color,
                }
                : shape
        );

        executeCommand(
            new BorderCommand(before, after, setShapes, yShapes)
        );
    };

    return { applyBorder };
};
