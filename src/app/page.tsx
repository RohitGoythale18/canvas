// src/app/page.tsx
'use client';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';
import { Box } from "@mui/material";

import Menu from "./components/MenuBar";
import Canvas from "./components/Canvas";
import { useAuth } from "@/context/AuthContext";
import { DrawingPath, FontFeatures, Shape } from "@/types";

import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useShapeLayer } from "@/hooks/useShapeLayer";
import { useBgColor } from "@/hooks/useBgColor";
import { useBorders } from "@/hooks/useBorders";
import { useFontFeat } from "@/hooks/useFontFeat";
import { useSplitCanvas } from "@/hooks/useSplitCanvas";
import { useClearImage } from "@/hooks/useClearImage";
import { useNewCanvas } from "@/hooks/useNewCanvas";
import { useSaveCanvas } from "@/hooks/useSaveCanvas";
import { useLoadCanvas } from "@/hooks/useLoadCanvas";
import { imageDataToBase64 } from "@/utils/imageUtils";
import { useLoadDesign } from "@/hooks/useLoadDesign";

function HomeContentComponent() {
  const { token, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get('designId');

  // Home
  const [resetKey, setResetKey] = useState(0);
  const [splitMode, setSplitMode] = useState("none");

  // Edit
  const [pencilActive, setPencilActive] = useState(false);
  const [drawings, setDrawings] = useState<{ panelId: string, paths: DrawingPath[] }[]>([]);
  const [fillActive, setFillActive] = useState(false);
  const [fillColor, setFillColor] = useState("#ff0000");
  const [eraserActive, setEraserActive] = useState(false);
  const [eraserSize, setEraserSize] = useState(10);

  // Insert
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [textActive, setTextActive] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // Design
  const [selectedPanel, setSelectedPanel] = useState("default");
  const [canvasBackground, setCanvasBackground] = useState<Record<string, string | { start: string; end: string }>>({ default: "#ffffff" });
  const [borderActive, setBorderActive] = useState(false);
  const [borderType, setBorderType] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [borderSize, setBorderSize] = useState(2);
  const [borderColor, setBorderColor] = useState('#000000');
  const [fontFeatures, setFontFeatures] = useState<FontFeatures>({ fontFamily: "Arial, sans-serif", fontSize: 16, fontStyles: {}, alignment: 'left', listType: 'none', textColor: "#000000", });
  const [filledImages, setFilledImages] = useState<{ panelId: string, imageData: ImageData }[]>([]);

  const [permission, setPermission] = useState<'OWNER' | 'WRITE' | 'COMMENT' | 'READ'>('READ');

  const { saveCanvas } = useSaveCanvas();
  const { newCanvas } = useNewCanvas({ setSplitMode, setCanvasBackground, setSelectedPanel, setShapes, setDrawings, setFilledImages, setUploadedImageUrl, setLoadedImage, setPermission, setResetKey, });
  const { loadCanvas } = useLoadCanvas({ setShapes, setDrawings, setFilledImages, setCanvasBackground, setSplitMode, setUploadedImageUrl, setLoadedImage, });
  const { loadDesignFromId } = useLoadDesign({ token, setPermission, loadCanvas, });
  const { executeCommand, undo, redo } = useUndoRedo();
  const { changeSplitMode } = useSplitCanvas({ splitMode, setSplitMode, executeCommand, });
  const { bringForwardCmd, sendBackwardCmd, bringToFrontCmd, sendToBackCmd, } = useShapeLayer({ shapes, setShapes, executeCommand, });
  const { uploadImage } = useUploadImage({ shapes, setShapes, executeCommand, setUploadedImageUrl, setLoadedImage, });
  const { clearImage } = useClearImage({ shapes, setShapes, executeCommand, setUploadedImageUrl, setLoadedImage, });
  const { changeBgColor } = useBgColor({ background: canvasBackground, setBackground: setCanvasBackground, executeCommand, });
  const { applyBorder } = useBorders({ shapes, setShapes, executeCommand, });
  const { applyFontFeatures } = useFontFeat({ shapes, setShapes, executeCommand, });

  const hasSelectedShape = shapes.some(s => s.selected);
  const handleImageUpload = uploadImage;
  const handleImageUsed = () => { setUploadedImageUrl(null); setLoadedImage(null); };
  const handlePanelSelect = (panelId: string) => setSelectedPanel(panelId);
  const handleCanvasBackgroundChange = changeBgColor;

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
        setPermission('OWNER');
      }
    };

    loadDesign();
  }, [designId, isAuthenticated, loading, loadDesignFromId]);

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

  if (loading) {
    return <Box component="div">Loading...</Box>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box suppressHydrationWarning sx={{ bgcolor: 'grey.900', height: '100vh', color: 'white', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Menu
        onSaveCanvas={saveCanvas}
        onLoadCanvas={loadCanvas}
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

        onNewCanvas={newCanvas}
        onSplitChange={changeSplitMode}

        onUndo={undo}
        onRedo={redo}
        onBringForward={bringForwardCmd}
        onSendBackward={sendBackwardCmd}
        onBringToFront={bringToFrontCmd}
        onSendToBack={sendToBackCmd}
        hasSelectedShape={hasSelectedShape}

        onPencilToggle={handlePencilToggle}
        pencilActive={pencilActive}
        fillActive={fillActive}
        onFillToggle={handleFillToggle}
        fillColor={fillColor}
        onEraserToggle={handleEraserToggle}
        eraserActive={eraserActive}
        onEraserSizeChange={setEraserSize}
        eraserSize={eraserSize}

        onShapeSelect={handleShapeSelect}
        textActive={textActive}
        onTextToggle={handleTextToggle}
        onColorChange={setFillColor}
        onImageUpload={handleImageUpload}
        onImageUsed={handleImageUsed}

        onCanvasBackgroundChange={handleCanvasBackgroundChange}
        selectedPanel={selectedPanel}
        borderActive={borderActive}
        onBorderToggle={setBorderActive}
        onBorderChange={(b) => { setBorderType(b.type); setBorderSize(b.size); setBorderColor(b.color); applyBorder(b); }}
        currentFontFamily={fontFeatures.fontFamily}
        currentFontSize={fontFeatures.fontSize}
        currentFontStyles={fontFeatures.fontStyles}
        currentTextAlignment={fontFeatures.alignment}
        currentListType={fontFeatures.listType}
        currentTextColor={fontFeatures.textColor}
        onFontFamilyChange={(v) => { setFontFeatures(prev => ({ ...prev, fontFamily: v })); applyFontFeatures({ fontFamily: v }); }}
        onFontSizeChange={(v) => { setFontFeatures(prev => ({ ...prev, fontSize: v })); applyFontFeatures({ fontSize: v }); }}
        onFontStyleChange={(v) => { setFontFeatures(prev => ({ ...prev, fontStyles: v })); applyFontFeatures({ fontStyles: v }); }}
        onTextAlignmentChange={(v) => { setFontFeatures(prev => ({ ...prev, alignment: v })); applyFontFeatures({ alignment: v }); }}
        onListTypeChange={(v) => { setFontFeatures(prev => ({ ...prev, listType: v })); applyFontFeatures({ listType: v }); }}
        onTextColorChange={(v) => { setFontFeatures(prev => ({ ...prev, textColor: v })); applyFontFeatures({ textColor: v }); }}
        designId={designId}
        permission={permission}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', p: 1 }}>
        <Canvas
          key={resetKey}
          splitMode={splitMode}
          executeCommand={executeCommand}
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
          onClearImage={clearImage}
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
          permission={permission}
        />
      </Box>
    </Box>
  );
}

const HomeContent = dynamic(() => Promise.resolve(HomeContentComponent), {
  ssr: false,
  loading: () => <Box component="div">Loading...</Box>
});

export default function Home() {
  return (
    <Suspense fallback={<Box component="div">Loading...</Box>}>
      <HomeContent />
    </Suspense>
  );
}
