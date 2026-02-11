import { Command } from "@/types";
import { useRef, useCallback } from "react";

export const useUndoRedo = (yUndo?: () => void, yRedo?: () => void) => {
    const undoStack = useRef<Command[]>([]);
    const redoStack = useRef<Command[]>([]);

    const executeCommand = useCallback((command: Command) => {
        command.execute();
        // If we have Yjs undo, we don't need to track it in our local stack
        // because Yjs UndoManager handles it automatically.
        if (!yUndo) {
            undoStack.current.push(command);
            redoStack.current = [];
        }
    }, [yUndo]);

    const undo = useCallback(() => {
        if (yUndo) {
            yUndo();
            return;
        }
        const command = undoStack.current.pop();
        if (!command) return;

        command.undo();
        redoStack.current.push(command);
    }, [yUndo]);

    const redo = useCallback(() => {
        if (yRedo) {
            yRedo();
            return;
        }
        const command = redoStack.current.pop();
        if (!command) return;

        command.execute();
        undoStack.current.push(command);
    }, [yRedo]);

    return {
        executeCommand,
        undo,
        redo,
        canUndo: () => undoStack.current.length > 0,
        canRedo: () => redoStack.current.length > 0,
    };
};
