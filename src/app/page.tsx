'use client';
import { useState, useCallback } from "react";
import { Box } from "@mui/material";
import { Shape, DrawingPath, FontFeatures, CanvasData } from "../types";

import Menu from "./components/MenuBar";
import Canvas from "./components/Canvas";
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
  const [fontFeatures, setFontFeatures] = useState<FontFeatures>({
    fontFamily: "Arial, sans-serif",
    fontSize: 16,
    fontStyles: {},
    alignment: 'left',
    listType: 'none',
    textColor: "#000000"
  });

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [drawings, setDrawings] = useState<{ panelId: string, paths: DrawingPath[] }[]>([]);
  const [filledImages, setFilledImages] = useState<{ panelId: string, imageData: ImageData }[]>([]);

  // History state for undo/redo
  const [history, setHistory] = useState<Array<{
    shapes: Shape[];
    drawings: typeof drawings;
    filledImages: typeof filledImages;
    backgroundColor: typeof canvasBackground;
    splitMode: string;
    uploadedImageUrl: string | null;
    loadedImageId: string | null;
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const safeStructuredClone = (obj: unknown) => {
    if (obj === undefined) return undefined;
    try {
      if (typeof (globalThis).structuredClone === 'function') {
        return (globalThis).structuredClone(obj);
      }
    } catch { }
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  };

  const saveState = useCallback(() => {
    const sanitizedShapes = shapes.map(s => {
      const { imageElement: _imageElement, ...rest } = s as Shape & { imageElement?: HTMLImageElement };
      return rest as Shape;
    });

    const currentState = {
      shapes: safeStructuredClone(sanitizedShapes),
      drawings: safeStructuredClone(drawings),
      filledImages: safeStructuredClone(filledImages),
      backgroundColor: safeStructuredClone(canvasBackground),
      splitMode,
      uploadedImageUrl,
      loadedImageId: currentImageId ?? null
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);

      if (newHistory.length > 50) {
        newHistory.shift();
      }

      const newIdx = newHistory.length - 1;
      setHistoryIndex(newIdx);

      return newHistory;
    });
  }, [shapes, drawings, filledImages, canvasBackground, splitMode, historyIndex, uploadedImageUrl, currentImageId]);

  // Undo/Redo
  const handleUndo = async () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setShapes(prevState.shapes);
      setDrawings(prevState.drawings);
      setFilledImages(prevState.filledImages);
      setCanvasBackground(prevState.backgroundColor);
      setSplitMode(prevState.splitMode);
      setUploadedImageUrl(prevState.uploadedImageUrl ?? null);
      setCurrentImageId(prevState.loadedImageId ?? null);

      // reload image element if we have an id or url
      if (prevState.loadedImageId) {
        try {
          const { imageStorage } = await import('../lib/imageStorage');
          const blob = await imageStorage.getImage(prevState.loadedImageId);
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              setLoadedImage(img);
              URL.revokeObjectURL(blobUrl);
            };
            img.onerror = () => {
              setLoadedImage(null);
              URL.revokeObjectURL(blobUrl);
            };
            img.src = blobUrl;
          } else {
            setLoadedImage(null);
          }
        } catch {
          setLoadedImage(null);
        }
      } else {
        setLoadedImage(null);
      }

      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = async () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];

      setShapes(nextState.shapes);
      setDrawings(nextState.drawings);
      setFilledImages(nextState.filledImages);
      setCanvasBackground(nextState.backgroundColor);
      setSplitMode(nextState.splitMode);
      setUploadedImageUrl(nextState.uploadedImageUrl ?? null);
      setCurrentImageId(nextState.loadedImageId ?? null);

      if (nextState.loadedImageId) {
        try {
          const { imageStorage } = await import('../lib/imageStorage');
          const blob = await imageStorage.getImage(nextState.loadedImageId);
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              setLoadedImage(img);
              URL.revokeObjectURL(blobUrl);
            };
            img.onerror = () => {
              setLoadedImage(null);
              URL.revokeObjectURL(blobUrl);
            };
            img.src = blobUrl;
          } else {
            setLoadedImage(null);
          }
        } catch {
          setLoadedImage(null);
        }
      } else {
        setLoadedImage(null);
      }

      setHistoryIndex(historyIndex + 1);
    }
  };


  // New Canvas
  const handleNewCanvas = () => {
    setSplitMode("none");
    setCanvasBackground({ default: "#ffffff" });
    setSelectedPanel("default");
    setShapes([]);
    setDrawings([]);
    setFilledImages([]);
    setUploadedImageUrl(null);
    setLoadedImage(null);
    setCurrentImageId(null);
    setHistory([]);
    setHistoryIndex(-1);
    setResetKey(prev => prev + 1);
    localStorage.removeItem('currentImageId');
  };

  // Apply image to selected shape
  const applyImageToSelectedShape = (img: HTMLImageElement, imageId?: string, imageUrl?: string) => {
    setShapes(prev =>
      prev.map(shape =>
        shape.selected
          ? {
            ...shape,
            imageElement: img,
            imageId: imageId || undefined,
            imageUrl: imageUrl || undefined
          }
          : shape
      )
    );
    saveState();
  };

  // NEW — Updated image upload workflow
  const handleImageUpload = (imageUrl: string, imageId?: string) => {
    const selected = shapes.find(s => s.selected);
    if (!selected) {
      window.alert("Please select a shape first.");
      return;
    }

    const img = new Image();
    img.onload = () => {
      setUploadedImageUrl(imageUrl);
      setLoadedImage(img);
      setCurrentImageId(imageId || null);

      applyImageToSelectedShape(img, imageId, imageUrl);
    };
    img.onerror = () => {
      console.error("Failed to load image");
    };
    img.src = imageUrl;
  };

  const handleImageUsed = () => {
    setUploadedImageUrl(null);
    setLoadedImage(null);
    setCurrentImageId(null);
    saveState();
  };

  // Clear image from selected shape
  const handleClearImage = () => {
    const selected = shapes.find(s => s.selected);
    if (!selected) {
      window.alert("Please select a shape first.");
      return;
    }

    setShapes(prev =>
      prev.map(shape =>
        shape.selected
          ? {
            ...shape,
            imageElement: undefined,
            imageId: undefined,
            imageUrl: undefined
          }
          : shape
      )
    );

    saveState();
  };

  const handleCanvasBackgroundChange = (color: { type: 'solid' | 'gradient'; value: string | { start: string; end: string } }, panelId: string = 'default') => {
    setCanvasBackground(prev => ({
      ...prev,
      [panelId]: color.value
    }));
    saveState();
  };

  const handlePanelSelect = (panelId: string) => setSelectedPanel(panelId);

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

  // SAVE CANVAS EXPORT AS PNG
  const handleSaveCanvas = (): string => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  const handleLoadCanvas = async (canvasData: CanvasData) => {
    saveState();

    // Normalize shapes (ensure text/font props exist) BEFORE setShapes
    let normalizedShapes: Shape[] = [];
    if (canvasData.shapes) {
      normalizedShapes = (canvasData.shapes as Shape[]).map((shape) => ({
        ...shape,
        fontFamily: shape.fontFamily ?? "Arial, sans-serif",
        fontSize: shape.fontSize ?? 16,
        fontStyles: shape.fontStyles ?? { bold: false, italic: false, underline: false, strikethrough: false },
        textColor: shape.textColor ?? "#000000",
        textAlignment: shape.textAlignment ?? "left",
        listType: shape.listType ?? "none"
      }));

      setShapes(normalizedShapes);
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
      const convertedFilledImages = canvasData.filledImages.map((fi) => {
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

    // Load shape images (if any). Use normalizedShapes so text/font props are preserved.
    if (normalizedShapes.length > 0) {
      const updatedShapes = [...normalizedShapes];
      const loadPromises: Promise<void>[] = [];

      for (const shape of updatedShapes) {
        if (shape.imageUrl && !(shape).imageElement) {
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
        } else if (shape.imageId && !(shape).imageElement) {
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
        // setShapes with updatedShapes (which include loaded imageElement if any)
        setShapes(updatedShapes as Shape[]);
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
          uploadedImageUrl: uploadedImageUrl,
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
        onClearImage={handleClearImage}
        onCanvasBackgroundChange={handleCanvasBackgroundChange}
        selectedPanel={selectedPanel}
        borderActive={borderActive}
        onBorderToggle={setBorderActive}
        onBorderChange={(b) => {
          setBorderType(b.type);
          setBorderSize(b.size);
          setBorderColor(b.color);
        }}
        currentFontFamily={fontFeatures.fontFamily}
        currentFontSize={fontFeatures.fontSize}
        currentFontStyles={fontFeatures.fontStyles}
        currentTextAlignment={fontFeatures.alignment}
        currentListType={fontFeatures.listType}
        currentTextColor={fontFeatures.textColor}
        onFontFamilyChange={(v) => setFontFeatures(prev => ({ ...prev, fontFamily: v }))}
        onFontSizeChange={(v) => setFontFeatures(prev => ({ ...prev, fontSize: v }))}
        onFontStyleChange={(v) => setFontFeatures(prev => ({ ...prev, fontStyles: v }))}
        onTextAlignmentChange={(v) => setFontFeatures(prev => ({ ...prev, alignment: v }))}
        onListTypeChange={(v) => setFontFeatures(prev => ({ ...prev, listType: v }))}
        onTextColorChange={(v) => setFontFeatures(prev => ({ ...prev, textColor: v }))}
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
          onTextToggle={handleTextToggle}
          uploadedImageUrl={uploadedImageUrl}
          loadedImage={loadedImage}
          currentImageId={currentImageId}
          onImageUsed={handleImageUsed}
          onClearImage={handleClearImage}
          backgroundColor={canvasBackground}
          onPanelSelect={handlePanelSelect}
          borderActive={borderActive}
          borderType={borderType}
          borderSize={borderSize}
          borderColor={borderColor}
          currentFontFeatures={fontFeatures}
          shapes={shapes}
          onShapesChange={setShapes}
          drawings={drawings}
          onDrawingsChange={setDrawings}
          filledImages={filledImages}
          onFilledImagesChange={setFilledImages}
          onSaveState={saveState}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </Box>
    </Box>
  );
}
