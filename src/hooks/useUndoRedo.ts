import { Command } from "@/types";
import { useRef, useCallback } from "react";

export const useUndoRedo = () => {
    const undoStack = useRef<Command[]>([]);
    const redoStack = useRef<Command[]>([]);

    const executeCommand = useCallback((command: Command) => {
        command.execute();
        undoStack.current.push(command);
        redoStack.current = [];
    }, []);

    const undo = useCallback(() => {
        const command = undoStack.current.pop();
        if (!command) return;

        command.undo();
        redoStack.current.push(command);
    }, []);

    const redo = useCallback(() => {
        const command = redoStack.current.pop();
        if (!command) return;

        command.execute();
        undoStack.current.push(command);
    }, []);

    return {
        executeCommand,
        undo,
        redo,
        canUndo: () => undoStack.current.length > 0,
        canRedo: () => redoStack.current.length > 0,
    };
};
