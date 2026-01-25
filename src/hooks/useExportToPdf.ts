'use client';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { UseExportToPdfProps } from '@/types';

export const useExportToPdf = ({ targetId }: UseExportToPdfProps) => {
    const exportToPdf = async () => {
        const node = document.getElementById(targetId);

        if (!node) {
            alert('Main canvas not found!');
            return;
        }

        try {
            const originalTransform = node.style.transform;
            const originalOrigin = node.style.transformOrigin;

            // Reset transform for capture
            node.style.transform = 'none';
            node.style.transformOrigin = 'top left';

            // Capture as PNG first for best quality in PDF
            const dataUrl = await toPng(node, {
                width: 1920,
                height: 1080,
                style: {
                    width: '1920px',
                    height: '1080px',
                    transform: 'none',
                    backgroundColor: 'white',
                },
                pixelRatio: 2, // Higher resolution for PDF
                cacheBust: true,
            });

            // Restore original styles
            node.style.transform = originalTransform;
            node.style.transformOrigin = originalOrigin;

            // Create PDF
            // 'l' for landscape, 'px' for units, [1920, 1080] for canvas size
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1920, 1080]
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, 1920, 1080);
            pdf.save('snapcanvas.pdf');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Check console for details.');
        }
    };

    return { exportToPdf };
};
