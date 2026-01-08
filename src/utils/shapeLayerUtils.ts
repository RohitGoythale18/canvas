import { Shape } from "@/types";

export const bringForward = (shapes: Shape[]) => {
    const selectedShape = shapes.find(s => s.selected);
    if (!selectedShape) return shapes;

    const currentZ = selectedShape.zIndex;
    // Find the shape with the next higher zIndex
    const nextHigher = shapes
        .filter(s => s.zIndex > currentZ)
        .sort((a, b) => a.zIndex - b.zIndex)[0];

    if (!nextHigher) return shapes; // Already at front

    return shapes.map(shape => {
        if (shape.selected) {
            return { ...shape, zIndex: nextHigher.zIndex };
        } else if (shape.id === nextHigher.id) {
            return { ...shape, zIndex: currentZ };
        }
        return shape;
    });
};

export const sendBackward = (shapes: Shape[]) => {
    const selectedShape = shapes.find(s => s.selected);
    if (!selectedShape) return shapes;

    const currentZ = selectedShape.zIndex;
    // Find the shape with the next lower zIndex
    const nextLower = shapes
        .filter(s => s.zIndex < currentZ)
        .sort((a, b) => b.zIndex - a.zIndex)[0];

    if (!nextLower) return shapes; // Already at back

    return shapes.map(shape => {
        if (shape.selected) {
            return { ...shape, zIndex: nextLower.zIndex };
        } else if (shape.id === nextLower.id) {
            return { ...shape, zIndex: currentZ };
        }
        return shape;
    });
};

export const bringToFront = (shapes: Shape[]) => {
    const selectedShape = shapes.find(s => s.selected);
    if (!selectedShape) return shapes;

    const maxZ = Math.max(...shapes.map(s => s.zIndex));
    return shapes.map(shape =>
        shape.selected ? { ...shape, zIndex: maxZ + 1 } : shape
    );
};

export const sendToBack = (shapes: Shape[]) => {
    const selectedShape = shapes.find(s => s.selected);
    if (!selectedShape) return shapes;

    const minZ = Math.min(...shapes.map(s => s.zIndex));
    return shapes.map(shape =>
        shape.selected ? { ...shape, zIndex: minZ - 1 } : shape
    );
};
