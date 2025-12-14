// src/types/index.ts
export interface FontStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

export type TextColor =
  | string
  | {
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
}

export interface DrawingPath {
  points: Array<{ x: number; y: number }>;
  tool: 'pencil' | 'eraser';
  color?: string;
  size?: number;
}

export interface CanvasData {
  shapes: Shape[];
  backgroundColor: Record<string, string | { start: string; end: string }>;
  splitMode: string;
  drawings: { panelId: string; paths: DrawingPath[] }[];
  filledImages: { panelId: string; imageData: string }[]; // base64 encoded
  uploadedImageUrl?: string | null;
  loadedImageData?: string | null;
  currentImageId?: string | null;
  images?: unknown[];
}

export interface Pin {
  id: string;
  title: string;
  imageUrl?: string | null;
  canvasData?: CanvasData;
  boardId?: string;
  createdAt?: string;
  order?: number;
}

export interface Board {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  pins?: Pin[];
}

export type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};