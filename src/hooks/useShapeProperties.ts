import { useEffect } from 'react';
import { FontFeatures, FontStyles, UseShapePropertiesProps } from '@/types';

const DEFAULT_FONT_FEATURES: FontFeatures = {
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

export const useShapeProperties = ({ borderActive, borderType, borderSize, borderColor, onShapesChange, currentFontFeatures }: UseShapePropertiesProps) => {
    const fontFeatures = currentFontFeatures ?? DEFAULT_FONT_FEATURES;

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