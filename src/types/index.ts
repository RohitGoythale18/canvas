// src/types/index.ts

import { NextRequest } from "next/server";


// Types for Canvas Data
export interface CanvasData {
  shapes: Shape[];
  backgroundColor: Record<string, string | { start: string; end: string }>;
  splitMode: string;
  drawings: { panelId: string; paths: DrawingPath[] }[];
  filledImages: { panelId: string; imageData: string }[]; // base64 encoded
  uploadedImageUrl?: string | null;
  loadedImageData?: string | null;
  currentImageId?: string | null;
  uploadedImageBase64?: string | null;
}

// Types for Canvas
export interface CanvasProps {
  splitMode?: string;
  pencilActive?: boolean;
  fillActive?: boolean;
  fillColor?: string;
  eraserActive?: boolean;
  eraserSize?: number;
  selectedShape?: string | null;
  onShapeSelect: (shape: string) => void;
  textActive?: boolean;
  onTextToggle?: (enabled: boolean) => void;
  uploadedImageUrl?: string | null;
  loadedImage?: HTMLImageElement | null;
  currentImageId?: string | null;
  onImageUsed?: () => void;
  onClearImage?: () => void;
  backgroundColor?: Record<string, string | { start: string; end: string }>;
  onPanelSelect?: (panelId: string) => void;
  borderActive?: boolean;
  borderType?: 'solid' | 'dashed' | 'dotted';
  borderSize?: number;
  borderColor?: string;
  currentFontFeatures?: FontFeatures;
  shapes: Shape[];
  onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
  drawings: Array<{ panelId: string; paths: DrawingPath[] }>;
  onDrawingsChange: React.Dispatch<React.SetStateAction<Array<{ panelId: string; paths: DrawingPath[] }>>>;
  filledImages: Array<{ panelId: string; imageData: ImageData }>;
  onFilledImagesChange: React.Dispatch<React.SetStateAction<Array<{ panelId: string; imageData: ImageData }>>>;
  onSaveState: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  permission: 'OWNER' | 'WRITE' | 'COMMENT' | 'READ';
}

// Types for MenuBar
export interface MenuBarProps {
  onSaveCanvas?: () => string;
  onLoadCanvas?: (canvasData: CanvasData) => void;
  canvasData?: CanvasData;
  onNewCanvas?: () => void;
  onSplitChange?: (mode: string) => void;
  onPencilToggle?: (enabled: boolean) => void;
  onFillToggle?: (enabled: boolean) => void;
  onColorChange?: (color: string) => void;
  fillColor?: string;
  onEraserToggle?: (enabled: boolean) => void;
  onEraserSizeChange?: (size: number) => void;
  eraserSize?: number;
  pencilActive?: boolean;
  fillActive?: boolean;
  eraserActive?: boolean;
  onShapeSelect?: (shape: string) => void;
  onTextToggle?: (enabled: boolean) => void;
  textActive?: boolean;
  onImageUpload?: (imageUrl: string) => void;
  onImageUsed?: () => void;
  onClearImage?: () => void;
  onCanvasBackgroundChange?: (color: { type: 'solid' | 'gradient'; value: string | { start: string; end: string } }, panelId?: string) => void;
  selectedPanel?: string;
  onBorderToggle?: (enabled: boolean) => void;
  onBorderChange?: (border: { type: 'solid' | 'dashed' | 'dotted'; size: number; color: string }) => void;
  borderActive?: boolean;
  currentFontFamily?: string;
  currentFontSize?: number;
  currentFontStyles?: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean };
  currentTextAlignment?: 'left' | 'center' | 'right' | 'justify';
  currentListType?: 'bullet' | 'number' | 'none';
  currentTextColor: TextColor;
  currentFontFeatures?: FontFeatures;
  onFontFamilyChange?: (fontFamily: string) => void;
  onFontSizeChange?: (fontSize: number) => void;
  onFontStyleChange?: (styles: { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean }) => void;
  onTextAlignmentChange?: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  onListTypeChange?: (listType: 'bullet' | 'number' | 'none') => void;
  onTextColorChange?: (color: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } }) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  permission: 'OWNER' | 'WRITE' | 'COMMENT' | 'READ';
}

// Types for BoardButton
export interface BoardButtonProps {
  canvasData?: CanvasData;
  onLoadCanvas?: (canvasData: CanvasData) => void;
  getCurrentCanvasImage?: () => string;
}

// Types for BoardAPI
export interface BoardAPI {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  designs?: DesignAPI[];
}

// Types for DesignAPI
export interface DesignAPI {
  id: string;
  title: string;
  thumbnailUrl: string;
  data: CanvasData;
  createdAt: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

// Types for Shared Designs
export interface ShareDesignDialogProps {
  open: boolean;
  designId: string | null;
  onClose: () => void;
  onShared?: () => void;
}

export interface SharedUser {
  email: string;
  permission: 'READ' | 'COMMENT' | 'WRITE';
}

// Types for New Canvas
export interface NewCanvasButtonProps {
  onNewCanvas?: () => void;
}

// Types for Split Button
export interface SplitButtonProps {
  onSplitSelect?: (mode: string) => void;
}

// Types for Export Button
export interface ExportButtonProps {
  targetId: string;
}

// Types for Undo
export interface UndoButtonProps {
  onClick?: () => void;
  active?: boolean;
}

// Types for Redo
export interface RedoButtonProps {
  onClick?: () => void;
  active?: boolean;
}

// Types for Pencil Button
export interface PencilButtonProps {
  active?: boolean;
  onToggle?: (enabled: boolean) => void;
  permission: 'OWNER' | 'WRITE' | 'COMMENT' | 'READ';
}

// Types for Drawing Path
export interface DrawingPath {
  points: Array<{ x: number; y: number }>;
  tool: 'pencil' | 'eraser';
  color?: string;
  size?: number;
}

// Types for Fill Button
export interface FillButtonProps {
  active?: boolean;
  onFillToggle?: (enabled: boolean) => void;
  onColorChange?: (color: string) => void;
  currentColor?: string;
}

// Types for Eraser Button
export interface EraserButtonProps {
  active?: boolean;
  onEraserToggle?: (enabled: boolean) => void;
  onSizeChange?: (size: number) => void;
  eraserSize?: number;
}

// Types for Shape Button
export interface ShapeButtonProps {
  onShapeSelect?: (shape: string) => void;
}

export interface ShapeCategory {
  category: string;
  shapes: { name: string; file: string }[];
}

export interface Shape {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
  panelId: string;
  fillColor?: string;
  imageUrl?: string;
  imageId?: string;
  imageElement?: HTMLImageElement;
  imageBase64?: string;
  borderType?: 'solid' | 'dashed' | 'dotted';
  borderSize?: number;
  borderColor?: string;
  text?: string;
  fontSize?: number;
  isEditing?: boolean;
  fontFamily?: string;
  textColor?: TextColor;
  fontStyles?: FontStyles;
  textAlignment?: 'left' | 'center' | 'right' | 'justify';
  listType?: 'bullet' | 'number' | 'none';
  zIndex: number;
}

// Types for TextBox
export interface TextButtonProps {
  active?: boolean;
  onToggle?: (enabled: boolean) => void;
}

// Types for Upload Image Button
export interface UploadImageButtonProps {
  onImageUpload?: (base64: string) => void;
}

// Types for Clear Image Button
export interface ClearImageButtonProps {
  onClearImage?: () => void;
}

// Types for Canvas Background Color
export interface ColorButtonProps {
  onColorChange?: (color: { type: 'solid' | 'gradient'; value: string | { start: string; end: string } }, panelId?: string) => void;
  panelId?: string;
}

// Types for Shape Border
export interface BorderButtonProps {
  active?: boolean;
  onBorderToggle?: (enabled: boolean) => void;
  onBorderChange?: (border: { type: 'solid' | 'dashed' | 'dotted'; size: number; color: string }) => void;
}

// Types for Font Features
export interface FontFeatureProps {
  onFontFamilyChange?: (fontFamily: string) => void;
  onFontSizeChange?: (fontSize: number) => void;
  onFontStyleChange?: (styles: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  }) => void;
  onTextAlignmentChange?: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  onListTypeChange?: (listType: 'bullet' | 'number' | 'none') => void;
  onTextColorChange?: (color: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } }) => void;
  currentFontFamily?: string;
  currentFontSize?: number;
  currentFontStyles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };
  currentAlignment?: 'left' | 'center' | 'right' | 'justify';
  currentListType?: 'bullet' | 'number' | 'none';
  currentTextColor?: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } };
}

export interface FontStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

export type TextColor = | string | {
  type: 'solid' | 'gradient';
  value: string | { start: string; end: string };
};

export interface FontFeatures {
  fontFamily: string;
  fontSize: number;
  fontStyles: FontStyles;
  alignment: 'left' | 'center' | 'right' | 'justify';
  listType: 'bullet' | 'number' | 'none';
  textColor: TextColor;
}

// Types for Auth Context
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface DecodedToken {
  exp: number;
  userId: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

// Types for Auth Request
export interface AuthUser {
  userId: string;
  email: string;
}

export interface AuthRequest extends NextRequest {
  user?: AuthUser;
}

// Types for Hooks

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UseDrawingToolsProps {
  pencilActive: boolean;
  eraserActive: boolean;
  eraserSize: number;
  splitMode: string;
  setDrawings: React.Dispatch<
    React.SetStateAction<{ panelId: string; paths: DrawingPath[] }[]>
  >;
  onSaveState?: () => void;

  // NEW: to let eraser actually modify shapes
  shapes: Shape[];
  onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
  permission: 'OWNER' | 'WRITE' | 'COMMENT' | 'READ';
}

export interface UseFillToolProps {
  splitMode: string;
  fillActive: boolean;
  fillColor: string;
  setFilledImages: React.Dispatch<React.SetStateAction<{ panelId: string; imageData: ImageData }[]>>;
  shapes: Shape[];
  onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
  onSaveState?: () => void;
  permission: 'OWNER' | 'WRITE' | 'COMMENT' | 'READ';
}

export interface UseKeyboardShortcutsProps {
  shapes: Shape[];
  onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
  onSaveState?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  permission: 'OWNER' | 'WRITE' | 'COMMENT' | 'READ';
}

export interface UseTextToolsProps {
  textActive: boolean;
  shapes: Shape[];
  textInput: string;
  editingShapeId: string | null;
  currentFontFeatures?: {
    fontFamily: string;
    fontSize: number;
    fontStyles: FontStyles;
    alignment: 'left' | 'center' | 'right' | 'justify';
    listType: 'bullet' | 'number' | 'none';
    textColor: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } };
  };
  onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
  setTextInput: React.Dispatch<React.SetStateAction<string>>;
  setEditingShapeId: React.Dispatch<React.SetStateAction<string | null>>;
  onTextToggle?: (enabled: boolean) => void;
  permission: 'OWNER' | 'WRITE' | 'COMMENT' | 'READ';
}

export interface UseShapeRendererProps {
  shapes: Shape[];
  drawings: { panelId: string; paths: Array<{ points: { x: number; y: number }[]; tool: 'pencil' | 'eraser'; color?: string; size?: number }> }[];
  filledImages: { panelId: string; imageData: ImageData }[];
  splitMode: string;
  textInput: string;
  editingShapeId: string | null;
  loadedImage?: HTMLImageElement | null;
  backgroundColor?: Record<string, string | { start: string; end: string }>;
  // permission: 'OWNER' | 'WRITE' | 'COMMENT' | 'READ';
}

export interface FontFeatureType {
  fontFamily: string;
  fontSize: number;
  fontStyles: FontStyles;
  alignment: 'left' | 'center' | 'right' | 'justify';
  listType: 'bullet' | 'number' | 'none';
  textColor: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } };
}

export interface UseShapeProperties {
  borderActive: boolean;
  borderType: 'solid' | 'dashed' | 'dotted';
  borderSize: number;
  borderColor: string;
  shapes: Shape[];
  onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
  currentFontFeatures?: FontFeatureType;
  permission: 'OWNER' | 'WRITE' | 'COMMENT' | 'READ';
}

export interface UseShapeInteractionProps {
  selectedShape: string | null;
  splitMode: string;
  onShapeSelect: (shape: string) => void;
  shapes: Shape[];
  pencilActive: boolean;
  eraserActive: boolean;
  fillActive: boolean;
  textActive: boolean;
  uploadedImageUrl?: string | null;
  loadedImage?: HTMLImageElement | null;
  currentImageId?: string | null;
  onImageUsed?: () => void;
  borderActive: boolean;
  borderColor: string;
  borderSize: number;
  borderType: 'solid' | 'dashed' | 'dotted';
  zoomLevel: number;
  onShapesChange: React.Dispatch<React.SetStateAction<Shape[]>>;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setResizing: React.Dispatch<React.SetStateAction<boolean>>;
  setDragOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setResizeHandle: React.Dispatch<React.SetStateAction<string | null>>;
  dragging: boolean;
  resizing: boolean;
  resizeHandle: string | null;
  dragOffset: { x: number; y: number };
  onSaveState?: () => void;
  permission: 'OWNER' | 'WRITE' | 'COMMENT' | 'READ';
}

// Types for Image Storage
export interface StoredImageData {
  id: string;
  blob: Blob;
  createdAt: number;
}

// Types for webpush
export interface PushPayload {
  title: string;
  body: string;
  designId?: string;
}

// Types for Backend
export interface WebPushError extends Error {
  statusCode?: number;
}
