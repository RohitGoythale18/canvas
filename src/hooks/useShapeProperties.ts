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

export const useShapeProperties = ({ borderActive, borderType, borderSize, borderColor, onShapesChange, currentFontFeatures, yShapes }: UseShapePropertiesProps) => {
    const fontFeatures = currentFontFeatures ?? DEFAULT_FONT_FEATURES;

    useEffect(() => {
        requestAnimationFrame(() => {
            if (yShapes) {
                const selectedShapes = (Array.from(yShapes.values()) as any[]).filter(s => s.selected);
                selectedShapes.forEach(shape => {
                    const newShape = {
                        ...shape,
                        borderType: borderActive ? borderType : shape.borderType,
                        borderSize: borderActive ? borderSize : shape.borderSize,
                        borderColor: borderActive ? borderColor : shape.borderColor,
                    };
                    yShapes.set(shape.id, newShape);
                });
            } else {
                onShapesChange(prev => prev.map(shape => ({
                    ...shape,
                    borderType: shape.selected && borderActive ? borderType : shape.borderType,
                    borderSize: shape.selected && borderActive ? borderSize : shape.borderSize,
                    borderColor: shape.selected && borderActive ? borderColor : shape.borderColor,
                })));
            }
        });
    }, [borderActive, borderType, borderSize, borderColor, onShapesChange, yShapes]);

    useEffect(() => {
        requestAnimationFrame(() => {
            if (yShapes) {
                const selectedTextShapes = (Array.from(yShapes.values()) as any[]).filter(s => s.selected && s.type === "text");
                selectedTextShapes.forEach(shape => {
                    const newShape = {
                        ...shape,
                        fontSize: fontFeatures.fontSize,
                        fontFamily: fontFeatures.fontFamily,
                        textColor: fontFeatures.textColor,
                        fontStyles: fontFeatures.fontStyles,
                        textAlignment: fontFeatures.alignment,
                        listType: fontFeatures.listType,
                    };
                    yShapes.set(shape.id, newShape);
                });
            } else {
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
            }
        });
    }, [fontFeatures, onShapesChange, yShapes]);
};