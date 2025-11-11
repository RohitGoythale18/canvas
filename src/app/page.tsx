'use client';
import { useState, useCallback } from "react";

import Menu from "./components/MenuBar";
import Canvas from "./components/Canvas";
import { Box } from "@mui/material";
import { Shape, FontStyles, CanvasData } from "../types";

export default function Home() {
  const [resetKey, setResetKey] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<string>("none");
  const [pencilActive, setPencilActive] = useState(false);
  const [fillActive, setFillActive] = useState(false);
  const [fillColor, setFillColor] = useState("#ff0000");
  const [eraserActive, setEraserActive] = useState(false);
  const [eraserSize, setEraserSize] = useState(10);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [textActive, setTextActive] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [canvasBackground, setCanvasBackground] = useState<Record<string, string | { start: string; end: string }>>({ default: "#ffffff" });
  const [selectedPanel, setSelectedPanel] = useState<string>("default");
  const [borderActive, setBorderActive] = useState(false);
  const [borderType, setBorderType] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [borderSize, setBorderSize] = useState(2);
  const [borderColor, setBorderColor] = useState('#000000');
  const [fontFeatures, setFontFeatures] = useState<{
    fontFamily: string;
    fontSize: number;
    fontStyles: FontStyles;
    alignment: 'left' | 'center' | 'right' | 'justify';
    listType: 'bullet' | 'number' | 'none';
    textColor: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } };
  }>({
    fontFamily: "Arial, sans-serif",
    fontSize: 16,
    fontStyles: {},
    alignment: 'left' as 'left' | 'center' | 'right' | 'justify',
    listType: 'none' as 'bullet' | 'number' | 'none',
    textColor: "#000000"
  });

  // Add shapes state here
  const [shapes, setShapes] = useState<Shape[]>([]);

  // Add drawings and filledImages state here for centralized management
  const [drawings, setDrawings] = useState<{ panelId: string, paths: Array<{ points: { x: number, y: number }[], tool: 'pencil' | 'eraser', color?: string, size?: number }> }[]>([]);
  const [filledImages, setFilledImages] = useState<{ panelId: string, imageData: ImageData }[]>([]);

  // History state for undo/redo
  const [history, setHistory] = useState<Array<{
    shapes: Shape[];
    drawings: typeof drawings;
    filledImages: typeof filledImages;
    backgroundColor: typeof canvasBackground;
    splitMode: string;
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Function to save current state to history
  const saveState = useCallback(() => {
    const currentState = {
      shapes,
      drawings,
      filledImages,
      backgroundColor: canvasBackground,
      splitMode
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      // Limit history to 50 snapshots
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryIndex(49);
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      return newHistory;
    });
  }, [shapes, drawings, filledImages, canvasBackground, splitMode, historyIndex]);

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setShapes(prevState.shapes);
      setDrawings(prevState.drawings);
      setFilledImages(prevState.filledImages);
      setCanvasBackground(prevState.backgroundColor);
      setSplitMode(prevState.splitMode);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setShapes(nextState.shapes);
      setDrawings(nextState.drawings);
      setFilledImages(nextState.filledImages);
      setCanvasBackground(nextState.backgroundColor);
      setSplitMode(nextState.splitMode);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleNewCanvas = () => {
    setSplitMode("none");
    setCanvasBackground({ default: "#ffffff" });
    setSelectedPanel("default");
    setShapes([]); // Clear shapes when creating new canvas
    setDrawings([]); // Clear drawings
    setFilledImages([]); // Clear filled images
    setHistory([]); // Clear history
    setHistoryIndex(-1); // Reset history index
    setResetKey(prev => prev + 1);
  };

  const handlePencilToggle = (enabled: boolean) => {
    setPencilActive(enabled);
    if (enabled) {
      setFillActive(false);
      setEraserActive(false);
      setTextActive(false);
      setSelectedShape(null);
    }
  };

  const handleFillToggle = (enabled: boolean) => {
    setFillActive(enabled);
    if (enabled) {
      setPencilActive(false);
      setEraserActive(false);
      setTextActive(false);
      setSelectedShape(null);
    }
  };

  const handleEraserToggle = (enabled: boolean) => {
    setEraserActive(enabled);
    if (enabled) {
      setPencilActive(false);
      setFillActive(false);
      setTextActive(false);
      setSelectedShape(null);
    }
  };

  const handleShapeSelect = (shape: string) => {
    setSelectedShape(shape);
    setPencilActive(false);
    setFillActive(false);
    setEraserActive(false);
    setTextActive(false);
  };

  const handleTextToggle = (enabled: boolean) => {
    setTextActive(enabled);
    if (enabled) {
      setPencilActive(false);
      setFillActive(false);
      setEraserActive(false);
      setSelectedShape(null);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
    };
    img.src = imageUrl;
  };

  const handleImageUsed = () => {
    setUploadedImageUrl(null);
    setLoadedImage(null);
  };

  const handleCanvasBackgroundChange = (color: { type: 'solid' | 'gradient'; value: string | { start: string; end: string } }, panelId: string = 'default') => {
    setCanvasBackground(prev => ({
      ...prev,
      [panelId]: color.value
    }));
  };

  const handlePanelSelect = (panelId: string) => {
    setSelectedPanel(panelId);
  };

  const handleBorderToggle = (enabled: boolean) => {
    setBorderActive(enabled);
  };

  const handleBorderChange = (border: { type: 'solid' | 'dashed' | 'dotted'; size: number; color: string }) => {
    setBorderType(border.type);
    setBorderSize(border.size);
    setBorderColor(border.color);
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    setFontFeatures(prev => ({ ...prev, fontFamily }));
  };

  const handleFontSizeChange = (fontSize: number) => {
    setFontFeatures(prev => ({ ...prev, fontSize }));
  };

  const handleFontStyleChange = (styles: FontStyles) => {
    setFontFeatures(prev => ({ ...prev, fontStyles: styles }));
  };

  const handleTextAlignmentChange = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    setFontFeatures(prev => ({ ...prev, alignment }));
  };

  const handleListTypeChange = (listType: 'bullet' | 'number' | 'none') => {
    setFontFeatures(prev => ({ ...prev, listType }));
  };

  const handleTextColorChange = (color: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } }) => {
    setFontFeatures(prev => ({ ...prev, textColor: color }));
  };

  // Add function to capture canvas as base64
  const handleSaveCanvas = (): string => {
    // Capture the first canvas element
    const canvas = document.querySelector('canvas');
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  const handleLoadCanvas = (canvasData: CanvasData) => {
    // Implement loading canvas data
    if (canvasData.shapes) {
      setShapes(canvasData.shapes);
    }
    if (canvasData.backgroundColor) {
      setCanvasBackground(canvasData.backgroundColor);
    }
    if (canvasData.splitMode) {
      setSplitMode(canvasData.splitMode);
    }
    console.log('Loading canvas data:', canvasData);
  };

  return (
    <Box suppressHydrationWarning sx={{ bgcolor: 'grey.900', height: '100vh', color: 'white', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Menu
        onSaveCanvas={handleSaveCanvas}
        onLoadCanvas={handleLoadCanvas}
        canvasData={{
          shapes: shapes,
          backgroundColor: canvasBackground,
          splitMode: splitMode
        }}
        onNewCanvas={handleNewCanvas}
        onSplitChange={setSplitMode}
        onPencilToggle={handlePencilToggle}
        onFillToggle={handleFillToggle}
        onColorChange={setFillColor}
        onEraserToggle={handleEraserToggle}
        onEraserSizeChange={setEraserSize}
        eraserSize={eraserSize}
        pencilActive={pencilActive}
        fillActive={fillActive}
        eraserActive={eraserActive}
        onShapeSelect={handleShapeSelect}
        onTextToggle={handleTextToggle}
        textActive={textActive}
        onImageUpload={handleImageUpload}
        onImageUsed={handleImageUsed}
        onCanvasBackgroundChange={handleCanvasBackgroundChange}
        selectedPanel={selectedPanel}
        onBorderToggle={handleBorderToggle}
        onBorderChange={handleBorderChange}
        borderActive={borderActive}
        currentFontFamily={fontFeatures.fontFamily}
        currentFontSize={fontFeatures.fontSize}
        currentFontStyles={fontFeatures.fontStyles}
        currentTextAlignment={fontFeatures.alignment}
        currentListType={fontFeatures.listType}
        currentTextColor={fontFeatures.textColor}
        onFontFamilyChange={handleFontFamilyChange}
        onFontSizeChange={handleFontSizeChange}
        onFontStyleChange={handleFontStyleChange}
        onTextAlignmentChange={handleTextAlignmentChange}
        onListTypeChange={handleListTypeChange}
        onTextColorChange={handleTextColorChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', p: 1 }}>
        <Canvas
          key={resetKey}
          splitMode={splitMode}
          pencilActive={pencilActive}
          fillActive={fillActive}
          fillColor={fillColor}
          eraserActive={eraserActive}
          eraserSize={eraserSize}
          selectedShape={selectedShape}
          onShapeSelect={handleShapeSelect}
          textActive={textActive}
          uploadedImageUrl={uploadedImageUrl}
          loadedImage={loadedImage}
          onImageUsed={handleImageUsed}
          backgroundColor={canvasBackground}
          onPanelSelect={handlePanelSelect}
          borderActive={borderActive}
          borderType={borderType}
          borderSize={borderSize}
          borderColor={borderColor}
          currentFontFeatures={fontFeatures}
          // Pass shapes and setShapes as props to Canvas
          shapes={shapes}
          onShapesChange={setShapes}
          drawings={drawings}
          onDrawingsChange={setDrawings}
          filledImages={filledImages}
          onFilledImagesChange={setFilledImages}
          onSaveState={saveState}
        />
      </Box>
    </Box>
  );
}