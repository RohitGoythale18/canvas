'use client';
import { toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { UseExportToJpgProps } from '@/types';

export const useExportToJpg = ({ targetId }: UseExportToJpgProps) => {
    const exportToJpg = async () => {
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

            const dataUrl = await toJpeg(node, {
                width: 1920,
                height: 1080,
                quality: 0.95,
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

            saveAs(dataUrl, 'snapcanvas.jpg');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Check console for details.');
        }
    };

    return { exportToJpg };
};
