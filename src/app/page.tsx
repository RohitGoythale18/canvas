'use client';
import React, { useState, useCallback } from "react";

import Menu from "./components/MenuBar";
import Canvas from "./components/Canvas";
import { Box } from "@mui/material";
import { Shape, FontStyles, CanvasData } from "../types";
import { useStoredImageLoader } from "../hooks/useStoredImageLoader";

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
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

  // Load image from localStorage on component mount
  useStoredImageLoader(setUploadedImageUrl, setCurrentImageId, setLoadedImage);
  
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
    uploadedImageUrl: string | null;
    loadedImage: HTMLImageElement | null;
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Function to save current state to history
  const saveState = useCallback(() => {
    const currentState = {
      shapes,
      drawings,
      filledImages,
      backgroundColor: canvasBackground,
      splitMode,
      uploadedImageUrl,
      loadedImage
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
  }, [shapes, drawings, filledImages, canvasBackground, splitMode, historyIndex, uploadedImageUrl, loadedImage]);

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setShapes(prevState.shapes);
      setDrawings(prevState.drawings);
      setFilledImages(prevState.filledImages);
      setCanvasBackground(prevState.backgroundColor);
      setSplitMode(prevState.splitMode);
      setUploadedImageUrl(prevState.uploadedImageUrl);
      setLoadedImage(prevState.loadedImage);
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
      setUploadedImageUrl(nextState.uploadedImageUrl);
      setLoadedImage(nextState.loadedImage);
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
    setUploadedImageUrl(null); // Clear uploaded image
    setLoadedImage(null); // Clear loaded image
    setCurrentImageId(null); // Clear current image ID
    setHistory([]); // Clear history
    setHistoryIndex(-1); // Reset history index
    setResetKey(prev => prev + 1);
    localStorage.removeItem('currentImageId'); // Clear stored image data
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

  const handleImageUpload = (imageUrl: string, imageId?: string) => {
    setUploadedImageUrl(imageUrl);
    setCurrentImageId(imageId || null);
    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
      saveState(); 
    };
    img.onerror = () => {
      console.error("Failed to load image");
      setUploadedImageUrl(null);
      setLoadedImage(null);
      setCurrentImageId(null);
    };
    img.src = imageUrl;
  };

  const handleImageUsed = () => {
    setUploadedImageUrl(null);
    setLoadedImage(null);
    setCurrentImageId(null);
    saveState();
  };

  const handleCanvasBackgroundChange = (color: { type: 'solid' | 'gradient'; value: string | { start: string; end: string } }, panelId: string = 'default') => {
    setCanvasBackground(prev => ({
      ...prev,
      [panelId]: color.value
    }));
    saveState();
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

  const handleSaveCanvas = (): string => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  const handleLoadCanvas = async (canvasData: CanvasData) => {
    saveState();

    if (canvasData.shapes) {
      setShapes(canvasData.shapes);
    }
    if (canvasData.backgroundColor) {
      setCanvasBackground(canvasData.backgroundColor);
    }
    if (canvasData.splitMode) {
      setSplitMode(canvasData.splitMode);
    }
    if (canvasData.drawings) {
      setDrawings(canvasData.drawings);
    }
    if (canvasData.filledImages) {
      const convertedFilledImages = canvasData.filledImages.map(fi => {
        const img = new Image();
        img.src = fi.imageData as string;
        return new Promise<{ panelId: string; imageData: ImageData }>((resolve) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              resolve({ panelId: fi.panelId, imageData });
            } else {
              resolve({ panelId: fi.panelId, imageData: new ImageData(1, 1) }); // Fallback
            }
          };
          img.onerror = () => {
            resolve({ panelId: fi.panelId, imageData: new ImageData(1, 1) }); // Fallback
          };
        });
      });

      Promise.all(convertedFilledImages).then((results) => {
        setFilledImages(results);
      });
    }

    if (canvasData.currentImageId) {
      try {
        const { imageStorage } = await import('../lib/imageStorage');
        const blob = await imageStorage.getImage(canvasData.currentImageId);
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          setUploadedImageUrl(blobUrl);
          setCurrentImageId(canvasData.currentImageId);

          const img = new Image();
          img.onload = () => {
            setLoadedImage(img);
            console.log('Image loaded successfully from IndexedDB');
          };
          img.onerror = () => {
            console.error("Failed to load image from IndexedDB");
            setUploadedImageUrl(null);
            setLoadedImage(null);
            setCurrentImageId(null);
          };
          img.src = blobUrl;
        } else {
          console.warn("Image not found in IndexedDB, falling back to URL");
          const imageUrlToLoad = canvasData.uploadedImageUrl || canvasData.loadedImageData;
          if (imageUrlToLoad) {
            setUploadedImageUrl(imageUrlToLoad);
            setCurrentImageId(null);

            const img = new Image();
            img.onload = () => {
              setLoadedImage(img);
              console.log('Image loaded successfully from URL fallback');
            };
            img.onerror = () => {
              console.error("Failed to load image from URL fallback");
              setUploadedImageUrl(null);
              setLoadedImage(null);
              setCurrentImageId(null);
            };
            img.src = imageUrlToLoad;
          }
        }
      } catch (error) {
        console.error('Error loading image from IndexedDB:', error);
        const imageUrlToLoad = canvasData.uploadedImageUrl || canvasData.loadedImageData;
        if (imageUrlToLoad) {
          setUploadedImageUrl(imageUrlToLoad);
          setCurrentImageId(null);

          const img = new Image();
          img.onload = () => {
            setLoadedImage(img);
            console.log('Image loaded successfully from URL fallback');
          };
          img.onerror = () => {
            console.error("Failed to load image from URL fallback");
            setUploadedImageUrl(null);
            setLoadedImage(null);
            setCurrentImageId(null);
          };
          img.src = imageUrlToLoad;
        }
      }
    } else {
      const imageUrlToLoad = canvasData.uploadedImageUrl || canvasData.loadedImageData;
      if (imageUrlToLoad) {
        setUploadedImageUrl(imageUrlToLoad);
        setCurrentImageId(null);

        const img = new Image();
        img.onload = () => {
          setLoadedImage(img);
          console.log('Image loaded successfully from URL');
        };
        img.onerror = () => {
          console.error("Failed to load image from URL");
          setUploadedImageUrl(null);
          setLoadedImage(null);
          setCurrentImageId(null);
        };
        img.src = imageUrlToLoad;
      } else {
        setUploadedImageUrl(null);
        setLoadedImage(null);
        setCurrentImageId(null);
      }
    }

    if (canvasData.shapes) {
      const updatedShapes = [...canvasData.shapes];
      const loadPromises: Promise<void>[] = [];

      for (const shape of updatedShapes) {
        if (shape.imageUrl && !shape.imageElement) {
          const loadPromise = new Promise<void>((resolve) => {
            const shapeImg = new Image();
            shapeImg.onload = () => {
              const index = updatedShapes.findIndex(s => s.id === shape.id);
              if (index !== -1) {
                updatedShapes[index] = { ...updatedShapes[index], imageElement: shapeImg };
                console.log('Shape image loaded:', shape.imageUrl);
              }
              resolve();
            };
            shapeImg.onerror = () => {
              console.error('Failed to load shape image:', shape.imageUrl);
              resolve();
            };
            shapeImg.crossOrigin = 'anonymous';
            shapeImg.src = shape.imageUrl!;
          });
          loadPromises.push(loadPromise);
        } else if (shape.imageId && !shape.imageElement) {
          const loadPromise = new Promise<void>(async (resolve) => {
            try {
              const { imageStorage } = await import('../lib/imageStorage');
              const blob = await imageStorage.getImage(shape.imageId!);
              if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                const shapeImg = new Image();
                shapeImg.onload = () => {
                  const index = updatedShapes.findIndex(s => s.id === shape.id);
                  if (index !== -1) {
                    updatedShapes[index] = { ...updatedShapes[index], imageElement: shapeImg };
                    console.log('Shape image loaded from IndexedDB:', shape.imageId);
                  }
                  URL.revokeObjectURL(blobUrl);
                  resolve();
                };
                shapeImg.onerror = () => {
                  console.error('Failed to load shape image from IndexedDB:', shape.imageId);
                  URL.revokeObjectURL(blobUrl);
                  resolve();
                };
                shapeImg.src = blobUrl;
              } else {
                console.warn('No blob found for shape imageId:', shape.imageId);
                resolve();
              }
            } catch (error) {
              console.error('Error loading shape image from IndexedDB:', error);
              resolve();
            }
          });
          loadPromises.push(loadPromise);
        }
      }

      Promise.all(loadPromises).then(() => {
        setShapes(updatedShapes);
        console.log('All shape images loaded');
      });
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
          splitMode: splitMode,
          drawings: drawings,
          filledImages: filledImages.map(fi => ({
            panelId: fi.panelId,
            imageData: (() => {
              const canvas = document.createElement('canvas');
              canvas.width = fi.imageData.width;
              canvas.height = fi.imageData.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.putImageData(fi.imageData, 0, 0);
                return canvas.toDataURL('image/png');
              }
              return '';
            })()
          })),
          uploadedImageUrl: uploadedImageUrl, // Add this to pass current image state
          currentImageId: currentImageId
        }}
        onNewCanvas={handleNewCanvas}
        onSplitChange={setSplitMode}
        onPencilToggle={handlePencilToggle}
        onFillToggle={handleFillToggle}
        onColorChange={setFillColor}
        fillColor={fillColor}
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
          currentImageId={currentImageId}
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