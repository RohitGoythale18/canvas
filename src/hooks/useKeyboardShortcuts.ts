import { UseKeyboardShortcutsProps } from '@/types';
import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
    shapes,
    onShapesChange,
    permission,
    onUndo,
    onRedo
}: UseKeyboardShortcutsProps) => {
    useEffect(() => {
        const canEdit = permission === 'OWNER' || permission === 'WRITE';

        const handleKeyDown = (e: KeyboardEvent) => {
            // If editing a text shape, ignore global shortcuts
            const hasEditingText = shapes.some(shape => shape.isEditing && shape.type === "text");
            if (hasEditingText) return;

            // Delete -> delete selected shapes
            if (e.key === "Delete") {
                if (!canEdit) return;
                onShapesChange(prev => prev.filter(shape => !shape.selected));
                return;
            }

            // Check if e.key exists before trying to use it
            if (!e.key) return;

            const key = e.key.toLowerCase();
            const meta = e.ctrlKey || e.metaKey;

            // Undo (Ctrl/Cmd + Z)
            if (meta && key === 'z' && !e.shiftKey) {
                if (!canEdit) return;
                e.preventDefault();
                onUndo?.();
                return;
            }

            // Redo (Ctrl/Cmd + Y) OR (Ctrl/Cmd + Shift + Z)
            if (meta && (key === 'y' || (key === 'z' && e.shiftKey))) {
                if (!canEdit) return;
                e.preventDefault();
                onRedo?.();
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shapes, onShapesChange, permission, onUndo, onRedo]);
};