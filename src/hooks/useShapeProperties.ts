import { useEffect } from 'react';
import { Shape, FontStyles } from '../types';

interface FontFeatureType {
    fontFamily: string;
    fontSize: number;
    fontStyles: FontStyles;
    alignment: 'left' | 'center' | 'right' | 'justify';
    listType: 'bullet' | 'number' | 'none';
    textColor: string | {
        type: 'solid' | 'gradient';
        value: string | { start: string; end: string }
    };
}

interface UseShapePropertiesProps {
    borderActive: boolean;
    borderType: 'solid' | 'dashed' | 'dotted';
    borderSize: number;
    borderColor: string;
    shapes: Shape[];
    onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
    currentFontFeatures?: FontFeatureType;
}

const DEFAULT_FONT_FEATURES: FontFeatureType = {
    fontFamily: "Arial, sans-serif",
    fontSize: 16,
    fontStyles: {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false
    } as FontStyles,
    alignment: 'left',
    listType: 'none',
    textColor: "#000000"
};

export const useShapeProperties = ({
    borderActive,
    borderType,
    borderSize,
    borderColor,
    onShapesChange,
    currentFontFeatures
}: UseShapePropertiesProps) => {
    const fontFeatures = currentFontFeatures ?? DEFAULT_FONT_FEATURES;

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
                        fontSize: fontFeatures.fontSize,
                        fontFamily: fontFeatures.fontFamily,
                        textColor: fontFeatures.textColor,
                        fontStyles: fontFeatures.fontStyles,
                        textAlignment: fontFeatures.alignment,
                        listType: fontFeatures.listType,
                    };
                }
                return shape;
            }));
        });
    }, [fontFeatures, onShapesChange]);
};