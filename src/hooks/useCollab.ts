import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Shape, DrawingPath } from '@/types';

export interface CollabState {
    shapes: Shape[];
    drawings: { panelId: string; paths: DrawingPath[] }[];
    canvasConfig: {
        splitMode: string;
        backgroundColor: Record<string, string | { start: string; end: string }>;
    };
}

export const useCollab = (designId: string | null, enabled: boolean = true) => {
    const [isConnected, setIsConnected] = useState(false);
    const [users, setUsers] = useState<Map<number, any>>(new Map());

    // 1. Initialize Y.Doc
    const ydoc = useMemo(() => new Y.Doc(), []);

    // 2. Define Shared Types & UndoManager
    const { yShapes, yDrawings, yConfig, undoManager } = useMemo(() => {
        const shapes = ydoc.getMap<Shape>('shapes');
        const drawings = ydoc.getMap<DrawingPath[]>('drawings');
        const config = ydoc.getMap<any>('config');
        const um = new Y.UndoManager([shapes, drawings, config]);
        return { yShapes: shapes, yDrawings: drawings, yConfig: config, undoManager: um };
    }, [ydoc]);

    const undo = useCallback(() => undoManager.undo(), [undoManager]);
    const redo = useCallback(() => undoManager.redo(), [undoManager]);

    const provider = useMemo(() => {
        if (!designId || !enabled) return null;
        const wsUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'ws://localhost:1234';
        return new WebsocketProvider(wsUrl, designId, ydoc);
    }, [designId, ydoc, enabled]);

    const awareness = useMemo(() => provider?.awareness, [provider]);

    useEffect(() => {
        if (!provider || !awareness) return;

        const onStatus = (event: any) => {
            console.log('Collab Status:', event.status);
            setIsConnected(event.status === 'connected');
        };

        const onChange = () => {
            setUsers(new Map(awareness.getStates()));
        };

        provider.on('status', onStatus);
        awareness.on('change', onChange);

        // Initial sync
        onChange();

        return () => {
            provider.off('status', onStatus);
            awareness.off('change', onChange);
            provider.destroy();
        };
    }, [provider, awareness]);

    const setLocalUser = useCallback((name: string, color: string) => {
        awareness?.setLocalStateField('user', { name, color });
    }, [awareness]);

    const updateCursor = useCallback((x: number, y: number, panelId: string) => {
        awareness?.setLocalStateField('cursor', { x, y, panelId });
    }, [awareness]);

    const setSelection = useCallback((shapeId: string | null) => {
        awareness?.setLocalStateField('selection', shapeId);
    }, [awareness]);

    // Helper to update shapes in Yjs
    const updateYShape = useCallback((shape: Shape) => {
        const { imageElement: _, ...rest } = shape as any;
        yShapes.set(shape.id, { ...rest, selected: false, isEditing: false });
    }, [yShapes]);

    const deleteYShape = useCallback((shapeId: string) => {
        yShapes.delete(shapeId);
    }, [yShapes]);

    // Helper to update drawings for a specific panel
    const updateYDrawing = useCallback((panelId: string, paths: DrawingPath[]) => {
        yDrawings.set(panelId, paths);
    }, [yDrawings]);

    const updateYConfig = useCallback((key: string, value: any) => {
        yConfig.set(key, value);
    }, [yConfig]);

    return {
        ydoc,
        yShapes,
        yDrawings,
        yConfig,
        isConnected,
        users,
        undo,
        redo,
        setLocalUser,
        updateCursor,
        setSelection,
        updateYShape,
        deleteYShape,
        updateYDrawing,
        updateYConfig,
        clientId: ydoc.clientID,
    };
};
