import { Command, Shape, UseBordersProps } from "@/types";

class BorderCommand implements Command {
    constructor(
        private before: Shape[],
        private after: Shape[],
        private setShapes: React.Dispatch<React.SetStateAction<Shape[]>>
    ) { }

    execute() {
        this.setShapes(this.after);
    }

    undo() {
        this.setShapes(this.before);
    }
}

export const useBorders = ({ shapes, setShapes, executeCommand, }: UseBordersProps) => {

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
            new BorderCommand(before, after, setShapes)
        );
    };

    return { applyBorder };
};
