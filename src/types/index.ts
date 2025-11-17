export interface FontStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
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
  textColor?: string | { type: 'solid' | 'gradient'; value: string | { start: string; end: string } };
  fontStyles?: FontStyles;
  textAlignment?: 'left' | 'center' | 'right' | 'justify';
  listType?: 'bullet' | 'number' | 'none';
}

export interface CanvasData {
  shapes: Shape[];
  backgroundColor: Record<string, string | { start: string; end: string }>;
  splitMode: string;
  drawings: { panelId: string, paths: Array<{ points: { x: number, y: number }[], tool: 'pencil' | 'eraser', color?: string, size?: number }> }[];
  filledImages: { panelId: string, imageData: ImageData }[];
  uploadedImageUrl?: string | null;
  loadedImageData?: string | null;
  currentImageId?: string | null;
}
