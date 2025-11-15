'use client';
import React, { useState, useCallback } from "react";

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
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

  // Load image from localStorage on component mount
  React.useEffect(() => {
    const loadStoredImage = async () => {
      const storedImageId = localStorage.getItem('currentImageId');
      if (storedImageId) {
        try {
          const { imageStorage } = await import('../lib/imageStorage');
          const blob = await imageStorage.getImage(storedImageId);
          if (blob) {
            console.log('Retrieved blob from IndexedDB, size:', blob.size);
            const blobUrl = URL.createObjectURL(blob);
            setUploadedImageUrl(blobUrl);
            setCurrentImageId(storedImageId);
            const img = new Image();
            img.onload = () => {
              console.log('Stored image loaded successfully');
              setLoadedImage(img);
            };
            img.onerror = () => {
              console.error('Failed to load stored image');
              setUploadedImageUrl(null);
              setLoadedImage(null);
              setCurrentImageId(null);
            };
            img.src = blobUrl;
          } else {
            console.warn('No blob found for storedImageId:', storedImageId);
          }
        } catch (error) {
          console.error('Error loading stored image:', error);
        }
      }
    };

    loadStoredImage();
  }, []);
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
    // Clear stored image data
    localStorage.removeItem('currentImageId');
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
      saveState(); // Save state after image loads
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
    saveState(); // Save state after image is used/cleared
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

  // Add function to capture canvas as base64
  const handleSaveCanvas = (): string => {
    // Capture the first canvas element
    const canvas = document.querySelector('canvas');
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  const handleLoadCanvas = async (canvasData: CanvasData) => {
    // Save current state to history before loading new one
    saveState();

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
    if (canvasData.drawings) {
      setDrawings(canvasData.drawings);
    }
    if (canvasData.filledImages) {
      setFilledImages(canvasData.filledImages);
    }

    // Handle image loading - prioritize stored image ID over URL
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
          // Fallback to URL if blob not found
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
        // Fallback to URL
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
      // No stored image ID, try URL
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
        // Clear images if none in saved data
        setUploadedImageUrl(null);
        setLoadedImage(null);
        setCurrentImageId(null);
      }
    }

    // Load images for shapes that have imageUrl or imageId
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
            shapeImg.crossOrigin = 'anonymous'; // Handle CORS issues
            shapeImg.src = shape.imageUrl!;
          });
          loadPromises.push(loadPromise);
        } else if (shape.imageId && !shape.imageElement) {
          // Load from IndexedDB if imageId is present
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
                  // Clean up blob URL after image is loaded
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

      // Wait for all images to load before setting shapes
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
          filledImages: filledImages,
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