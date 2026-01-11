import { Shape, UseShapeLayerProps } from "@/types";
import { LayerCommand } from "./commands/LayerCommands";

const bringForward = (shapes: Shape[]) => {
    const selectedShape = shapes.find(s => s.selected);
    if (!selectedShape) return shapes;

    const currentZ = selectedShape.zIndex;
    const nextHigher = shapes
        .filter(s => s.zIndex > currentZ)
        .sort((a, b) => a.zIndex - b.zIndex)[0];

    if (!nextHigher) return shapes;

    return shapes.map(shape => {
        if (shape.selected) {
            return { ...shape, zIndex: nextHigher.zIndex };
        }
        if (shape.id === nextHigher.id) {
            return { ...shape, zIndex: currentZ };
        }
        return shape;
    });
};

const sendBackward = (shapes: Shape[]) => {
    const selectedShape = shapes.find(s => s.selected);
    if (!selectedShape) return shapes;

    const currentZ = selectedShape.zIndex;
    const nextLower = shapes
        .filter(s => s.zIndex < currentZ)
        .sort((a, b) => b.zIndex - a.zIndex)[0];

    if (!nextLower) return shapes;

    return shapes.map(shape => {
        if (shape.selected) {
            return { ...shape, zIndex: nextLower.zIndex };
        }
        if (shape.id === nextLower.id) {
            return { ...shape, zIndex: currentZ };
        }
        return shape;
    });
};

const bringToFront = (shapes: Shape[]) => {
    const selectedShape = shapes.find(s => s.selected);
    if (!selectedShape) return shapes;

    const maxZ = Math.max(...shapes.map(s => s.zIndex));
    return shapes.map(shape =>
        shape.selected ? { ...shape, zIndex: maxZ + 1 } : shape
    );
};

const sendToBack = (shapes: Shape[]) => {
    const selectedShape = shapes.find(s => s.selected);
    if (!selectedShape) return shapes;

    const minZ = Math.min(...shapes.map(s => s.zIndex));
    return shapes.map(shape =>
        shape.selected ? { ...shape, zIndex: minZ - 1 } : shape
    );
};

export const useShapeLayer = ({ shapes, setShapes, executeCommand, }: UseShapeLayerProps) => {

    const runLayerCommand = (computeNext: (s: Shape[]) => Shape[]) => {
        const before = shapes.map(s => ({ ...s }));
        const after = computeNext(before);

        executeCommand(
            new LayerCommand(before, after, setShapes)
        );
    };

    return {
        bringForwardCmd: () => runLayerCommand(bringForward),
        sendBackwardCmd: () => runLayerCommand(sendBackward),
        bringToFrontCmd: () => runLayerCommand(bringToFront),
        sendToBackCmd: () => runLayerCommand(sendToBack),
    };
};
