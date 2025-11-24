import { useEffect } from 'react';
import { Shape } from '../types';

interface UseKeyboardShortcutsProps {
    shapes: Shape[];
    onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
    onSaveState?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
}

export const useKeyboardShortcuts = ({
    shapes,
    onShapesChange,
    onSaveState,
    onUndo,
    onRedo
}: UseKeyboardShortcutsProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // If editing a text shape, ignore global shortcuts
            const hasEditingText = shapes.some(shape => shape.isEditing && shape.type === "text");
            if (hasEditingText) return;

            // Delete / Backspace -> delete selected shapes
            if (e.key === "Delete" || e.key === "Backspace") {
                onShapesChange(prev => prev.filter(shape => !shape.selected));
                if (onSaveState) onSaveState();
                return;
            }

            const key = e.key.toLowerCase();
            const meta = e.ctrlKey || e.metaKey;

            // Undo (Ctrl/Cmd + Z)
            if (meta && key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (onUndo) onUndo();
                return;
            }

            // Redo (Ctrl/Cmd + Y) OR (Ctrl/Cmd + Shift + Z)
            if (meta && (key === 'y' || (key === 'z' && e.shiftKey))) {
                e.preventDefault();
                if (onRedo) onRedo();
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shapes, onShapesChange, onSaveState, onUndo, onRedo]);
};
