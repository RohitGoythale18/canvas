import { useEffect } from 'react';
import { Shape } from '../types';

interface UseKeyboardShortcutsProps {
    shapes: Shape[];
    onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
    onSaveState?: () => void;
}

export const useKeyboardShortcuts = ({
    shapes,
    onShapesChange,
    onSaveState
}: UseKeyboardShortcutsProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                const hasEditingText = shapes.some(shape => shape.isEditing && shape.type === "text");
                if (!hasEditingText) {
                    onShapesChange(prev => prev.filter(shape => !shape.selected));
                    // Save state after deleting shapes
                    if (onSaveState) {
                        onSaveState();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shapes, onShapesChange, onSaveState]);
};