export interface PhotoMetadata {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  dateAdded: string;
  dateModified: string;
  dateCreated: string;
  rating: number; // 0-5 stars
  tags: string[];
  adjustments: PhotoAdjustments;
  exifData?: any;
  thumbnail?: string; // Base64 encoded thumbnail
  preview?: string; // Base64 encoded preview
}

export interface PhotoAdjustments {
  // Basic adjustments
  exposure: number; // -2.0 to +2.0
  contrast: number; // -100 to +100
  highlights: number; // -100 to +100
  shadows: number; // -100 to +100
  whites: number; // -100 to +100
  blacks: number; // -100 to +100
  
  // Color adjustments
  temperature: number; // -1000 to +1000 (Kelvin)
  tint: number; // -100 to +100
  vibrance: number; // -100 to +100
  saturation: number; // -100 to +100
  
  // HSL adjustments
  luminance?: {
    red: number;
    orange: number;
    yellow: number;
    green: number;
    aqua: number;
    blue: number;
    purple: number;
    magenta: number;
  };
  saturationHSL?: {
    red: number;
    orange: number;
    yellow: number;
    green: number;
    aqua: number;
    blue: number;
    purple: number;
    magenta: number;
  };
  lightness?: {
    red: number;
    orange: number;
    yellow: number;
    green: number;
    aqua: number;
    blue: number;
    purple: number;
    magenta: number;
  };
  
  // Detail adjustments
  sharpening: number; // 0 to 100
  noiseReduction: number; // 0 to 100
  
  // Effects
  vignette?: number; // -100 to +100
  clarity: number; // -100 to +100
  dehaze: number; // -100 to +100
  
  // Advanced color grading
  colorGrading?: {
    shadows: { hue: number; saturation: number; luminance: number };
    midtones: { hue: number; saturation: number; luminance: number };
    highlights: { hue: number; saturation: number; luminance: number };
    globalSaturation: number;
    globalLuminance: number;
    balance: number; // Balance between shadows and highlights
  };
  
  // Tone curve adjustments
  toneCurve?: {
    highlights: number; // -100 to +100
    lights: number; // -100 to +100
    darks: number; // -100 to +100
    shadows: number; // -100 to +100
    parametricHighlights: number;
    parametricLights: number;
    parametricDarks: number;
    parametricShadows: number;
  };
  
  // Split toning
  splitToning?: {
    highlights: {
      hue: number; // 0 to 360
      saturation: number; // 0 to 100
    };
    shadows: {
      hue: number; // 0 to 360
      saturation: number; // 0 to 100
    };
    balance: number; // -100 to +100
  };
  
  // Lens corrections
  lensCorrections?: {
    chromaticAberration: number; // 0 to 100
    distortion: number; // -100 to +100
    vignetting: number; // -100 to +100
    fringing: number; // 0 to 100
  };
  
  // Local adjustments (for future implementation)
  localAdjustments?: LocalAdjustment[];
}

export interface LocalAdjustment {
  id: string;
  type: 'radial' | 'linear' | 'masking';
  geometry: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    angle?: number;
    feather: number;
  };
  adjustments: Partial<PhotoAdjustments>;
  inverted: boolean;
}

export interface ExportOptions {
  format: string; // 'jpeg', 'png', 'tiff', 'webp'
  quality: number; // 1-100
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  colorSpace?: 'srgb' | 'adobergb' | 'prophoto';
  resolution?: number; // DPI
  overwrite?: boolean;
  fileNaming?: {
    prefix?: string;
    suffix?: string;
    includeIndex?: boolean;
  };
}

export interface FilterPreset {
  id: string;
  name: string;
  category: string;
  adjustments: Partial<PhotoAdjustments>;
  thumbnail?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  photoIds: string[];
  dateCreated: string;
  dateModified: string;
}

export interface LibrarySettings {
  libraryPath: string;
  cacheSize: number;
  autoImport: boolean;
  rawFileHandling: 'embed' | 'sidecar' | 'dng';
  defaultExportSettings: ExportOptions;
}

export interface HistogramData {
  red: number[];
  green: number[];
  blue: number[];
  luminance: number[];
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

export interface KeywordHierarchy {
  keyword: string;
  children: KeywordHierarchy[];
  photoCount: number;
}

export interface BatchProcessingOptions {
  outputDirectory: string;
  fileNaming: string; // Pattern for naming output files
  exportOptions: ExportOptions;
  adjustments: PhotoAdjustments;
  overwriteExisting: boolean;
}

export interface UndoRedoState {
  id: string;
  photoId: string;
  adjustments: PhotoAdjustments;
  timestamp: string;
  description: string;
}

export interface ComparisonMode {
  type: 'before-after' | 'split-view' | 'side-by-side';
  position?: number; // For split view
}
