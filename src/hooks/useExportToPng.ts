'use client';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { UseExportToPngProps } from '@/types';

export const useExportToPng = ({ targetId }: UseExportToPngProps) => {
    const exportToPng = async () => {
        const node = document.getElementById(targetId);

        if (!node) {
            alert('Main canvas not found!');
            return;
        }

        try {
            const originalTransform = node.style.transform;
            const originalOrigin = node.style.transformOrigin;

            node.style.transform = 'none';
            node.style.transformOrigin = 'top left';

            const dataUrl = await toPng(node, {
                width: 1920,
                height: 1080,
                style: {
                    width: '1920px',
                    height: '1080px',
                    transform: 'none',
                    backgroundColor: 'white',
                },
                pixelRatio: 1,
                cacheBust: true,
            });

            node.style.transform = originalTransform;
            node.style.transformOrigin = originalOrigin;

            saveAs(dataUrl, 'snapcanvas.png');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Check console for details.');
        }
    };

    return { exportToPng };
};
