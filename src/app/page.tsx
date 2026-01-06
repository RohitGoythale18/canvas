// src/app/page.tsx
'use client';
import { useState, useCallback, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import { Shape, DrawingPath, FontFeatures, CanvasData } from "../types";
import { useAuth } from "@/context/AuthContext";
import dynamic from 'next/dynamic';

import Menu from "./components/MenuBar";
import Canvas from "./components/Canvas";

function HomeContentComponent() {
  const { token, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const _params = useParams();
  const searchParams = useSearchParams();
  const designId = searchParams.get('designId');

  const [resetKey, setResetKey] = useState(0);
  const [splitMode, setSplitMode] = useState("none");
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
  const [selectedPanel, setSelectedPanel] = useState("default");
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
    textColor: "#000000",
  });

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [drawings, setDrawings] = useState<{ panelId: string, paths: DrawingPath[] }[]>([]);
  const [filledImages, setFilledImages] = useState<{ panelId: string, imageData: ImageData }[]>([]);
  const [history, setHistory] = useState<CanvasData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [permission, setPermission] = useState<'OWNER' | 'WRITE' | 'COMMENT' | 'READ'>('READ');

  const safeClone = useCallback(<T,>(obj: T): T => {
    try {
      return structuredClone(obj);
    } catch {
      return JSON.parse(JSON.stringify(obj));
    }
  }, []);

  const base64ToImageData = async (base64: string): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Failed to get canvas context"));
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
      };
      img.onerror = reject;
      img.src = base64;
    });
  };

  // Helper function to convert ImageData to base64 string
  const imageDataToBase64 = useCallback((imageData: ImageData): string => {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
  }, []);

  const saveState = useCallback(() => {
    const sanitizedShapes = shapes.map(s => {
      const { ...rest } = s as Partial<Shape> & { imageElement?: HTMLImageElement };
      return rest as Shape;
    });

    // Convert filledImages to base64 strings for saving
    const filledImagesBase64 = filledImages.map(fi => ({
      panelId: fi.panelId,
      imageData: imageDataToBase64(fi.imageData)
    }));

    const state: CanvasData = {
      shapes: safeClone(sanitizedShapes),
      drawings: safeClone(drawings),
      filledImages: filledImagesBase64,
      backgroundColor: safeClone(canvasBackground),
      splitMode,
      uploadedImageBase64: uploadedImageUrl || undefined,
    };

    setHistory(prev => {
      const copy = prev.slice(0, historyIndex + 1);
      copy.push(state);
      setHistoryIndex(copy.length - 1);
      return copy;
    });
  }, [shapes, drawings, filledImages, canvasBackground, splitMode, uploadedImageUrl, historyIndex, safeClone, imageDataToBase64]);

  const handleLoadCanvas = useCallback(async (canvasData: CanvasData) => {
    saveState();

    const shapesWithImages = await Promise.all(
      (canvasData.shapes || []).map(async (s: Shape) => {
        if (s.imageBase64) {
          const img = new Image();
          img.src = s.imageBase64;
          await img.decode();
          return { ...s, imageElement: img } as Shape & { imageElement: HTMLImageElement };
        }
        return s;
      })
    );

    const loadedFilledImages = await Promise.all(
      (canvasData.filledImages || []).map(async (fi: { panelId: string; imageData: string }) => ({
        panelId: fi.panelId,
        imageData: await base64ToImageData(fi.imageData),
      }))
    );

    let uploadedImg: HTMLImageElement | null = null;
    if (canvasData.uploadedImageBase64) {
      uploadedImg = new Image();
      uploadedImg.src = canvasData.uploadedImageBase64;
      await uploadedImg.decode();
    }

    setShapes(shapesWithImages);
    setDrawings(canvasData.drawings || []);
    setFilledImages(loadedFilledImages);
    setCanvasBackground(canvasData.backgroundColor || { default: "#fff" });
    setSplitMode(canvasData.splitMode || "none");

    setUploadedImageUrl(canvasData.uploadedImageBase64 || null);
    setLoadedImage(uploadedImg);
  }, [saveState]);

  const loadDesignFromId = useCallback(async (id: string) => {
    if (!token) return;

    const res = await fetch(`/api/designs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;
    
    const design = await res.json();
    setPermission(design.permission);
    await handleLoadCanvas(design.data);
  }, [token, handleLoadCanvas]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const loadDesign = async () => {
      if (designId && isAuthenticated && !loading) {
        await loadDesignFromId(designId);
      } else if (!designId && isAuthenticated && !loading) {
        // New canvas for authenticated user - set as owner
        setPermission('OWNER');
      }
    };

    loadDesign();
  }, [designId, isAuthenticated, loading, loadDesignFromId]);

  const handleImageUpload = (base64: string) => {
    const selected = shapes.find(s => s.selected);
    if (!selected) {
      alert("Select a shape first");
      return;
    }

    const img = new Image();
    img.onload = () => {
      setUploadedImageUrl(base64);
      setLoadedImage(img);
      setShapes(prev =>
        prev.map(s =>
          s.selected ? { ...s, imageElement: img, imageBase64: base64 } : s
        )
      );
      saveState();
    };
    img.src = base64;
  };

  const handleClearImage = () => {
    setShapes(prev =>
      prev.map(s =>
        s.selected
          ? { ...s, imageElement: undefined, imageBase64: undefined }
          : s
      )
    );
    setUploadedImageUrl(null);
    setLoadedImage(null);
    saveState();
  };

  // Undo
  const handleUndo = async () => {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];

    // Convert base64 strings back to ImageData objects
    const filledImagesWithImageData = await Promise.all(
      (prev.filledImages || []).map(async (fi: { panelId: string; imageData: string }) => ({
        panelId: fi.panelId,
        imageData: await base64ToImageData(fi.imageData),
      }))
    );

    setShapes(prev.shapes);
    setDrawings(prev.drawings);
    setFilledImages(filledImagesWithImageData);
    setCanvasBackground(prev.backgroundColor);
    setSplitMode(prev.splitMode);
    setUploadedImageUrl(prev.uploadedImageBase64 || null);
    setHistoryIndex(i => i - 1);
  };

  // Redo
  const handleRedo = async () => {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];

    // Convert base64 strings back to ImageData objects
    const filledImagesWithImageData = await Promise.all(
      (next.filledImages || []).map(async (fi: { panelId: string; imageData: string }) => ({
        panelId: fi.panelId,
        imageData: await base64ToImageData(fi.imageData),
      }))
    );

    setShapes(next.shapes);
    setDrawings(next.drawings);
    setFilledImages(filledImagesWithImageData);
    setCanvasBackground(next.backgroundColor);
    setSplitMode(next.splitMode);
    setUploadedImageUrl(next.uploadedImageBase64 || null);
    setHistoryIndex(i => i + 1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

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
    setHistory([]);
    setHistoryIndex(-1);
    setPermission('OWNER'); // Set owner permission for new canvas
    setResetKey(prev => prev + 1);
  };

  // Apply image to selected shape
  const _applyImageToSelectedShape = (img: HTMLImageElement, imageId?: string, imageUrl?: string) => {
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

  const handleImageUsed = () => {
    setUploadedImageUrl(null);
    setLoadedImage(null);
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

  return (
    <Box suppressHydrationWarning sx={{ bgcolor: 'grey.900', height: '100vh', color: 'white', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Menu
        onSaveCanvas={handleSaveCanvas}
        onLoadCanvas={handleLoadCanvas}
        canvasData={{
          shapes: shapes.map(s => {
            const { imageElement: _, ...rest } = s as Shape & { imageElement?: HTMLImageElement };
            return rest;
          }),
          backgroundColor: canvasBackground,
          splitMode,
          drawings,
          filledImages: filledImages.map(fi => ({
            panelId: fi.panelId,
            imageData: imageDataToBase64(fi.imageData),
          })),
          uploadedImageBase64: uploadedImageUrl || undefined,
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
        permission={permission}
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
          permission={permission}
        />
      </Box>
    </Box>
  );
}

const HomeContent = dynamic(() => Promise.resolve(HomeContentComponent), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
