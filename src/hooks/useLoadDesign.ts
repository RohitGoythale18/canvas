'use client';
import { UseLoadDesignProps } from '@/types';
import { useCallback } from 'react';

export const useLoadDesign = ({ token, setPermission, loadCanvas, }: UseLoadDesignProps) => {
    const loadDesignFromId = useCallback(
        async (id: string) => {
            if (!token) return;

            const res = await fetch(`/api/designs/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) return;

            const design = await res.json();

            setPermission(design.permission);
            await loadCanvas(design.data);
        },
        [token, loadCanvas, setPermission]
    );

    return { loadDesignFromId };
};
