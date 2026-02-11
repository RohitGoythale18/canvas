// src/app/page.tsx
'use client';
import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';
import { Box } from "@mui/material";

import Menu from "./components/MenuBar";
import Canvas from "./components/Canvas";
import { useAuth } from "@/context/AuthContext";
import { DrawingPath, FontFeatures, Shape, Tool } from "@/types";

import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useShapeLayer } from "@/hooks/useShapeLayer";
import { useBgColor } from "@/hooks/useBgColor";
import { useBorders } from "@/hooks/useBorders";
import { useFontFeat } from "@/hooks/useFontFeat";
import { useSplitCanvas } from "@/hooks/useSplitCanvas";
import { useClearImage } from "@/hooks/useClearImage";
import { useInsertImagebyUrl } from "@/hooks/useInsertImagebyUrl";
import { useNewCanvas } from "@/hooks/useNewCanvas";
import { useSaveCanvas } from "@/hooks/useSaveCanvas";
import { useLoadCanvas } from "@/hooks/useLoadCanvas";
import { imageDataToBase64 } from "@/utils/imageUtils";
import { useLoadDesign } from "@/hooks/useLoadDesign";
import { useCollab } from "@/hooks/useCollab";
import { useAutoSave } from "@/hooks/useAutoSave";

function HomeContentComponent() {
  const { token, isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get('designId');

  // Home
  const [resetKey, setResetKey] = useState(0);
  const [splitMode, setSplitMode] = useState("none");

  // Edit
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [drawings, setDrawings] = useState<{ panelId: string, paths: DrawingPath[] }[]>([]);
  const [fillColor, setFillColor] = useState("#ff0000");
  const [eraserSize, setEraserSize] = useState(10);

  // Insert
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
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
  const [isShared, setIsShared] = useState(false);

  const {
    yShapes, yDrawings, yConfig, isConnected,
    undo: yUndo, redo: yRedo, users,
    setLocalUser, updateCursor, setSelection,
    clientId
  } = useCollab(designId, isShared);

  useEffect(() => {
    if (isConnected && user) {
      const colors = ['#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setLocalUser(user.name, randomColor);
    }
  }, [isConnected, user, setLocalUser]);

  const { saveCanvas } = useSaveCanvas();
  const { newCanvas } = useNewCanvas({ setSplitMode, setCanvasBackground, setSelectedPanel, setShapes, setDrawings, setFilledImages, setUploadedImageUrl, setLoadedImage, setPermission, setResetKey, });
  const { loadCanvas } = useLoadCanvas({ setShapes, setDrawings, setFilledImages, setCanvasBackground, setSplitMode, setUploadedImageUrl, setLoadedImage, yShapes, yDrawings, yConfig });
  const { loadDesignFromId } = useLoadDesign({ token, setPermission, setIsShared, loadCanvas, });
  const { executeCommand, undo, redo } = useUndoRedo(yUndo, yRedo);
  const { changeSplitMode } = useSplitCanvas({ splitMode, setSplitMode, executeCommand, yConfig });
  const { bringForwardCmd, sendBackwardCmd, bringToFrontCmd, sendToBackCmd, } = useShapeLayer({ shapes, setShapes, executeCommand, yShapes });
  const { uploadImage } = useUploadImage({ shapes, setShapes, executeCommand, setUploadedImageUrl, setLoadedImage, yShapes });
  const { insertImageByUrl } = useInsertImagebyUrl({ shapes, setShapes, executeCommand, setUploadedImageUrl, setLoadedImage, yShapes });
  const { clearImage } = useClearImage({ shapes, setShapes, executeCommand, setUploadedImageUrl, setLoadedImage, yShapes });
  const { changeBgColor } = useBgColor({ background: canvasBackground, setBackground: setCanvasBackground, executeCommand, yConfig });
  const { applyBorder } = useBorders({ shapes, setShapes, executeCommand, yShapes });
  const { applyFontFeatures } = useFontFeat({ shapes, setShapes, executeCommand, yShapes });

  // Leader logic for auto-save: Only one user saves to DB to avoid redundant requests
  const isLeader = useMemo(() => {
    if (!isConnected || !clientId) return true; // Solo mode or not connected yet
    const allClientIds = Array.from(users.keys());
    if (allClientIds.length === 0) return true;
    return clientId === Math.min(...allClientIds);
  }, [isConnected, clientId, users]);

  useAutoSave({
    designId,
    token,
    canvasData: {
      shapes,
      drawings,
      filledImages: [], // Not saving filled images for now to keep JSON smaller
      backgroundColor: canvasBackground,
      splitMode,
    },
    getCurrentCanvasImage: saveCanvas,
    permission: isLeader ? permission : 'READ', // Only the leader effectively has 'WRITE' for auto-save
  });

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

  // Architecture: Sync Yjs changes back to React state
  useEffect(() => {
    const syncShapes = () => {
      const shapesArray = Array.from(yShapes.values()) as Shape[];
      setShapes(prevShapes => {
        // Map through new shapes from Yjs and preserve local imageElements if they exist
        return shapesArray.map(newShape => {
          const existingShape = prevShapes.find(s => s.id === newShape.id);

          let shapeToReturn = { ...newShape };

          // Default selected to false for incoming shapes to prevent remote users hijacking selection
          // If we already have this shape, preserve our LOCAL selection state
          if (existingShape) {
            shapeToReturn.selected = existingShape.selected;
            shapeToReturn.isEditing = existingShape.isEditing; // Also preserve editing state
          } else {
            // New shape coming in. Should not be selected for us.
            shapeToReturn.selected = false;
            shapeToReturn.isEditing = false;
          }

          // If we already have this shape and its image data matches, preserve the imageElement
          if (existingShape && existingShape.imageElement &&
            (existingShape.imageUrl === newShape.imageUrl || existingShape.imageBase64 === newShape.imageBase64)) {
            shapeToReturn.imageElement = existingShape.imageElement;
          }
          return shapeToReturn;
        });
      });
    };

    const syncConfig = () => {
      const remoteSplitMode = yConfig.get('splitMode');
      const remoteBg = yConfig.get('backgroundColor');
      if (remoteSplitMode !== undefined) setSplitMode(remoteSplitMode);
      if (remoteBg !== undefined) setCanvasBackground(remoteBg);
    };

    const syncDrawings = () => {
      const drawingsMap = yDrawings.toJSON();
      const drawingsArray = Object.entries(drawingsMap).map(([panelId, paths]) => ({
        panelId,
        paths: paths as DrawingPath[]
      }));
      setDrawings(drawingsArray);
    };

    yShapes.observe(syncShapes);
    yConfig.observe(syncConfig);
    yDrawings.observe(syncDrawings);

    // Initial sync
    syncShapes();
    syncConfig();
    syncDrawings();

    return () => {
      yShapes.unobserve(syncShapes);
      yConfig.unobserve(syncConfig);
      yDrawings.unobserve(syncDrawings);
    };
  }, [yShapes, yConfig, yDrawings]);

  // Effect to load missing imageElements for shapes (e.g. added by other users)
  useEffect(() => {
    const shapesToLoad = shapes.filter(s => (s.imageUrl || s.imageBase64) && !s.imageElement);
    if (shapesToLoad.length === 0) return;

    shapesToLoad.forEach(async (shape) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = (shape.imageBase64 || shape.imageUrl) as string;
      try {
        await img.decode();
        setShapes(prev => prev.map(s => s.id === shape.id ? { ...s, imageElement: img } : s));
      } catch (e) {
        console.error("Failed to load image for shape", shape.id, e);
      }
    });
  }, [shapes]);

  const handlePencilToggle = (enabled: boolean) => {
    setActiveTool(enabled ? 'pencil' : 'select');
    if (enabled) setSelectedShape(null);
  };

  const handleFillToggle = (enabled: boolean) => {
    setActiveTool(enabled ? 'fill' : 'select');
    if (enabled) setSelectedShape(null);
  };

  const handleEraserToggle = (enabled: boolean) => {
    setActiveTool(enabled ? 'eraser' : 'select');
    if (enabled) setSelectedShape(null);
  };

  const handleShapeSelect = (shape: string) => {
    setSelectedShape(shape);
    setActiveTool(shape ? 'shape' : 'select');
  };

  const handleTextToggle = (enabled: boolean) => {
    setActiveTool(enabled ? 'text' : 'select');
    if (enabled) setSelectedShape(null);
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

        onNewCanvas={() => {
          newCanvas();
          router.push('/');
        }}
        onSplitChange={changeSplitMode}

        onUndo={undo}
        onRedo={redo}
        onBringForward={bringForwardCmd}
        onSendBackward={sendBackwardCmd}
        onBringToFront={bringToFrontCmd}
        onSendToBack={sendToBackCmd}
        hasSelectedShape={hasSelectedShape}

        onPencilToggle={handlePencilToggle}
        pencilActive={activeTool === 'pencil'}
        fillActive={activeTool === 'fill'}
        onFillToggle={handleFillToggle}
        fillColor={fillColor}
        onEraserToggle={handleEraserToggle}
        eraserActive={activeTool === 'eraser'}
        onEraserSizeChange={setEraserSize}
        eraserSize={eraserSize}

        onShapeSelect={handleShapeSelect}
        textActive={activeTool === 'text'}
        onTextToggle={handleTextToggle}
        onColorChange={setFillColor}
        onImageUpload={handleImageUpload}
        onImageUploadByUrl={insertImageByUrl}
        onImageUsed={handleImageUsed}
        clearImage={clearImage}

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
        isShared={isShared}
        users={users}
        isConnected={isConnected}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', p: 1 }}>
        <Canvas
          key={resetKey}
          splitMode={splitMode}
          executeCommand={executeCommand}
          pencilActive={activeTool === 'pencil'}
          fillActive={activeTool === 'fill'}
          fillColor={fillColor}
          eraserActive={activeTool === 'eraser'}
          eraserSize={eraserSize}
          selectedShape={activeTool === 'shape' ? selectedShape : null}
          onShapeSelect={handleShapeSelect}
          textActive={activeTool === 'text'}
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
          onUndo={undo}
          onRedo={redo}
          yShapes={yShapes}
          yDrawings={yDrawings}
          yConfig={yConfig}
          users={users}
          updateCursor={updateCursor}
          setSelection={setSelection}
          clientId={clientId}
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
