import { useCallback, useEffect, useState } from 'react';
import type { Board, CanvasData, SnackbarState } from '@/types';


export function useBoards(initialUserId?: string | null) {
    const [boards, setBoards] = useState<Board[]>([]);
    const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
    const [effectiveUserId, setEffectiveUserId] = useState<string | null>(
        initialUserId ?? null
    );
    const [loadingUser, setLoadingUser] = useState(false);

    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });

    const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    useEffect(() => {
        if (initialUserId) setEffectiveUserId(initialUserId);
    }, [initialUserId]);

    useEffect(() => {
        let mounted = true;

        const obtainDummyUser = async () => {
            if (effectiveUserId) return;
            setLoadingUser(true);

            try {
                const envDummy =
                    typeof window !== 'undefined'
                        ? (window as unknown as { NEXT_PUBLIC_DUMMY_USER_ID?: string }).NEXT_PUBLIC_DUMMY_USER_ID
                        : undefined;

                if (envDummy) {
                    if (mounted) setEffectiveUserId(envDummy);
                    showSnackbar('Using dummy user from env', 'success');
                    return;
                }

                const res = await fetch('/api/users/dummy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ email: 'user@gmail.com' }),
                });

                if (!res.ok) throw new Error(await res.text());

                const json = await res.json();
                const id = json?.id ?? json?.userId;

                if (!id) throw new Error('Dummy endpoint returned nothing');

                if (mounted) {
                    setEffectiveUserId(id);
                    showSnackbar('Using dummy user (dev)', 'success');
                }
            } catch (err) {
                console.error(err);
                if (mounted)
                    showSnackbar('Could not obtain dummy user — actions disabled', 'error');
            } finally {
                if (mounted) setLoadingUser(false);
            }
        };

        if (!effectiveUserId) obtainDummyUser();

        return () => {
            mounted = false;
        };
    }, [effectiveUserId, showSnackbar]);

    const refreshBoards = useCallback(async () => {
        try {
            const res = await fetch('/api/boards', { credentials: 'same-origin' });
            if (!res.ok) throw new Error(await res.text());

            const remoteBoards = await res.json();

            const normalized: Board[] = (remoteBoards || []).map((b: unknown) => {
                const board = b as {
                    id: string;
                    name: string;
                    description?: string;
                    createdAt?: string;
                    designs?: unknown[];
                    design?: unknown[];
                };

                const designs = (board.designs || board.design || []) as {
                    id: string;
                    title?: string;
                    thumbnailUrl?: string;
                    createdAt?: string;
                    data?: {
                        images?: { url?: string; storageKey?: string }[];
                        [key: string]: unknown;
                    };
                }[];

                return {
                    id: board.id,
                    name: board.name,
                    description: board.description ?? "",
                    createdAt: board.createdAt ?? new Date().toISOString(),
                    pins: designs.map((d, idx) => ({
                        id: d.id,
                        title: d.title ?? `Design ${idx + 1}`,
                        imageUrl:
                            d.thumbnailUrl ??
                            d.data?.images?.[0]?.url ??
                            d.data?.images?.[0]?.storageKey ??
                            "",
                        canvasData: d.data ?? {},
                        boardId: board.id,
                        createdAt: d.createdAt ?? new Date().toISOString(),
                        order: idx,
                    })),
                };
            });

            setBoards(normalized);

            setCurrentBoardId((prev) => {
                if (!prev && normalized.length > 0) return normalized[0].id;
                const exists = normalized.some((b) => b.id === prev);
                if (!exists && normalized.length > 0) return normalized[0].id;
                return prev;
            });
        } catch (err) {
            console.error(err);
            showSnackbar('Failed to load boards', 'error');
            setBoards([]);
            setCurrentBoardId(null);
        }
    }, [showSnackbar]);

    useEffect(() => {
        refreshBoards();
    }, [effectiveUserId]);

    const createBoard = async (name: string, description?: string) => {
        if (!effectiveUserId) throw new Error('No user available');
        if (!name.trim()) throw new Error('Name required');

        const res = await fetch('/api/boards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ name, description, ownerId: effectiveUserId }),
        });

        if (!res.ok) throw new Error(await res.text());

        const saved = await res.json();
        await refreshBoards();
        setCurrentBoardId(saved.id);
        showSnackbar(`Board "${saved.name}" created`, 'success');
    };

    const deleteBoard = async (boardId: string) => {
        if (!effectiveUserId) throw new Error('No user available');

        const res = await fetch(`/api/boards/${boardId}`, {
            method: 'DELETE',
            credentials: 'same-origin',
        });

        if (!res.ok) throw new Error(await res.text());

        await refreshBoards();
        showSnackbar('Board deleted', 'success');
    };

    const saveDesignToBoard = async (payload: {
        boardId: string;
        title: string;
        canvasData: CanvasData;
        thumbnailUrl?: string;
    }) => {
        if (!effectiveUserId) throw new Error('No user available');

        const res = await fetch('/api/designs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                title: payload.title.trim(),
                data: payload.canvasData,
                description: `Saved from board ${payload.boardId}`,
                ownerId: effectiveUserId,
                boardId: payload.boardId,
                thumbnailUrl: payload.thumbnailUrl,
            }),
        });

        if (!res.ok) throw new Error(await res.text());

        await refreshBoards();
        showSnackbar('Design saved', 'success');
    };

    return {
        boards,
        currentBoardId,
        setCurrentBoardId,
        effectiveUserId,
        loadingUser,
        snackbar,
        setSnackbar,
        refreshBoards,
        createBoard,
        deleteBoard,
        saveDesignToBoard,
    } as const;
}
