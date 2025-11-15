import { useEffect } from 'react';
import { Shape, FontStyles } from '../types';

interface UseShapePropertiesProps {
    borderActive: boolean;
    borderType: 'solid' | 'dashed' | 'dotted';
    borderSize: number;
    borderColor: string;
    shapes: Shape[];
    onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
    currentFontFeatures: {
        fontFamily: string;
        fontSize: number;
        fontStyles: FontStyles;
        alignment: 'left' | 'center' | 'right' | 'justify';
        listType: 'bullet' | 'number' | 'none';
        textColor: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } };
    };
}

export const useShapeProperties = ({
    borderActive,
    borderType,
    borderSize,
    borderColor,
    shapes,
    onShapesChange,
    currentFontFeatures
}: UseShapePropertiesProps) => {
    // Update border properties on selected shapes when border settings change
    useEffect(() => {
        requestAnimationFrame(() => {
            onShapesChange(prev => prev.map(shape => ({
                ...shape,
                borderType: shape.selected && borderActive ? borderType : shape.borderType,
                borderSize: shape.selected && borderActive ? borderSize : shape.borderSize,
                borderColor: shape.selected && borderActive ? borderColor : shape.borderColor,
            })));
        });
    }, [borderActive, borderType, borderSize, borderColor, onShapesChange]);

    // Update font features on selected text shapes when font features change
    useEffect(() => {
        requestAnimationFrame(() => {
            onShapesChange(prev => prev.map(shape => {
                if (shape.selected && shape.type === "text") {
                    return {
                        ...shape,
                        fontSize: currentFontFeatures.fontSize,
                        fontFamily: currentFontFeatures.fontFamily,
                        textColor: currentFontFeatures.textColor,
                        fontStyles: currentFontFeatures.fontStyles,
                        textAlignment: currentFontFeatures.alignment,
                        listType: currentFontFeatures.listType,
                    };
                }
                return shape;
            }));
        });
    }, [currentFontFeatures, shapes, onShapesChange]);
};