'use client';
import { UseLoadDesignProps } from '@/types';
import { useCallback } from 'react';

export const useLoadDesign = ({ token, setPermission, setIsShared, loadCanvas, }: UseLoadDesignProps) => {
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
            if (setIsShared) setIsShared(design.isShared);
            await loadCanvas(design.data);
        },
        [token, loadCanvas, setPermission, setIsShared]
    );

    return { loadDesignFromId };
};
