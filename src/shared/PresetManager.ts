import { PhotoAdjustments } from './types';

export interface PhotoPreset {
  id: string;
  name: string;
  description: string;
  category: 'portrait' | 'landscape' | 'street' | 'black-white' | 'vintage' | 'modern' | 'artistic';
  adjustments: Partial<PhotoAdjustments>;
  thumbnailPath?: string;
  author?: string;
  createdDate: Date;
}

export class PresetManager {
  private presets: PhotoPreset[] = [];

  constructor() {
    this.initializeDefaultPresets();
  }

  private initializeDefaultPresets() {
    this.presets = [
      {
        id: 'portrait-warm',
        name: 'Warm Portrait',
        description: 'Warm, flattering tones for portrait photography',
        category: 'portrait',
        adjustments: {
          exposure: 0.3,
          contrast: 15,
          highlights: -20,
          shadows: 25,
          temperature: 200,
          tint: 5,
          vibrance: 20,
          saturation: 10,
          clarity: 15,
          vignette: -15
        },
        author: 'PhotoEdit Pro',
        createdDate: new Date()
      },
      {
        id: 'landscape-vivid',
        name: 'Vivid Landscape',
        description: 'Enhanced colors and contrast for landscape photos',
        category: 'landscape',
        adjustments: {
          exposure: 0.2,
          contrast: 25,
          highlights: -30,
          shadows: 20,
          whites: 10,
          blacks: -15,
          vibrance: 40,
          saturation: 15,
          clarity: 25,
          dehaze: 20
        },
        author: 'PhotoEdit Pro',
        createdDate: new Date()
      },
      {
        id: 'black-white-classic',
        name: 'Classic B&W',
        description: 'Timeless black and white conversion',
        category: 'black-white',
        adjustments: {
          exposure: 0.1,
          contrast: 30,
          highlights: -25,
          shadows: 15,
          whites: 20,
          blacks: -20,
          saturation: -100,
          clarity: 20,
          vignette: -10
        },
        author: 'PhotoEdit Pro',
        createdDate: new Date()
      },
      {
        id: 'vintage-film',
        name: 'Vintage Film',
        description: 'Nostalgic film-like appearance',
        category: 'vintage',
        adjustments: {
          exposure: -0.2,
          contrast: -10,
          highlights: -40,
          shadows: 30,
          temperature: 100,
          tint: 10,
          saturation: -20,
          vibrance: -15,
          clarity: -20,
          vignette: -25,
          splitToning: {
            highlights: { hue: 45, saturation: 15 },
            shadows: { hue: 220, saturation: 10 },
            balance: 0
          }
        },
        author: 'PhotoEdit Pro',
        createdDate: new Date()
      },
      {
        id: 'street-moody',
        name: 'Moody Street',
        description: 'Dark, moody atmosphere for urban photography',
        category: 'street',
        adjustments: {
          exposure: -0.5,
          contrast: 35,
          highlights: -50,
          shadows: -20,
          whites: -10,
          blacks: -30,
          temperature: -100,
          saturation: -30,
          vibrance: 20,
          clarity: 30,
          dehaze: 15,
          vignette: -20
        },
        author: 'PhotoEdit Pro',
        createdDate: new Date()
      },
      {
        id: 'modern-bright',
        name: 'Modern Bright',
        description: 'Clean, bright modern look',
        category: 'modern',
        adjustments: {
          exposure: 0.4,
          contrast: 20,
          highlights: -15,
          shadows: 35,
          whites: 15,
          blacks: 10,
          temperature: 50,
          vibrance: 25,
          saturation: 5,
          clarity: 10,
          dehaze: 10
        },
        author: 'PhotoEdit Pro',
        createdDate: new Date()
      },
      {
        id: 'artistic-dramatic',
        name: 'Dramatic Art',
        description: 'High contrast artistic processing',
        category: 'artistic',
        adjustments: {
          exposure: 0.2,
          contrast: 50,
          highlights: -60,
          shadows: 40,
          whites: 25,
          blacks: -40,
          vibrance: 30,
          saturation: 20,
          clarity: 40,
          dehaze: 25,
          vignette: -30,
          colorGrading: {
            shadows: { hue: 240, saturation: 20, luminance: -10 },
            midtones: { hue: 30, saturation: 10, luminance: 0 },
            highlights: { hue: 60, saturation: 15, luminance: 10 },
            globalSaturation: 0,
            globalLuminance: 0,
            balance: 0
          }
        },
        author: 'PhotoEdit Pro',
        createdDate: new Date()
      }
    ];
  }

  getAllPresets(): PhotoPreset[] {
    return this.presets;
  }

  getPresetsByCategory(category: PhotoPreset['category']): PhotoPreset[] {
    return this.presets.filter(preset => preset.category === category);
  }

  getPresetById(id: string): PhotoPreset | undefined {
    return this.presets.find(preset => preset.id === id);
  }

  createCustomPreset(
    name: string,
    description: string,
    category: PhotoPreset['category'],
    adjustments: Partial<PhotoAdjustments>
  ): PhotoPreset {
    const preset: PhotoPreset = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      adjustments,
      author: 'User',
      createdDate: new Date()
    };

    this.presets.push(preset);
    return preset;
  }

  updatePreset(id: string, updates: Partial<PhotoPreset>): boolean {
    const presetIndex = this.presets.findIndex(preset => preset.id === id);
    if (presetIndex === -1) return false;

    this.presets[presetIndex] = { ...this.presets[presetIndex], ...updates };
    return true;
  }

  deletePreset(id: string): boolean {
    const presetIndex = this.presets.findIndex(preset => preset.id === id);
    if (presetIndex === -1) return false;

    // Don't allow deletion of built-in presets
    if (!id.startsWith('custom-')) return false;

    this.presets.splice(presetIndex, 1);
    return true;
  }

  applyPreset(currentAdjustments: PhotoAdjustments, presetId: string): PhotoAdjustments {
    const preset = this.getPresetById(presetId);
    if (!preset) return currentAdjustments;

    // Merge preset adjustments with current adjustments
    return {
      ...currentAdjustments,
      ...preset.adjustments
    };
  }

  // Create a preset from current adjustments
  createPresetFromAdjustments(
    adjustments: PhotoAdjustments,
    name: string,
    description: string,
    category: PhotoPreset['category']
  ): PhotoPreset {
    // Filter out default values to keep preset clean
    const filteredAdjustments = this.filterNonDefaultAdjustments(adjustments);
    
    return this.createCustomPreset(name, description, category, filteredAdjustments);
  }

  private filterNonDefaultAdjustments(adjustments: PhotoAdjustments): Partial<PhotoAdjustments> {
    const defaultAdjustments: PhotoAdjustments = {
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      temperature: 0,
      tint: 0,
      vibrance: 0,
      saturation: 0,
      sharpening: 0,
      noiseReduction: 0,
      clarity: 0,
      dehaze: 0,
      vignette: 0
    };

    const filtered: Partial<PhotoAdjustments> = {};

    Object.keys(adjustments).forEach(key => {
      const adjustmentKey = key as keyof PhotoAdjustments;
      const currentValue = adjustments[adjustmentKey];
      const defaultValue = defaultAdjustments[adjustmentKey];

      if (currentValue !== defaultValue && currentValue !== undefined) {
        (filtered as any)[adjustmentKey] = currentValue;
      }
    });

    return filtered;
  }

  // Export presets to JSON
  exportPresets(): string {
    const customPresets = this.presets.filter(preset => preset.id.startsWith('custom-'));
    return JSON.stringify(customPresets, null, 2);
  }

  // Import presets from JSON
  importPresets(jsonData: string): boolean {
    try {
      const importedPresets: PhotoPreset[] = JSON.parse(jsonData);
      
      // Validate imported presets
      const validPresets = importedPresets.filter(preset => 
        preset.name && preset.adjustments && preset.category
      );

      // Add to existing presets with new IDs to avoid conflicts
      validPresets.forEach(preset => {
        preset.id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        preset.createdDate = new Date();
        this.presets.push(preset);
      });

      return true;
    } catch (error) {
      console.error('Error importing presets:', error);
      return false;
    }
  }

  // Get preset categories with counts
  getCategorySummary(): Array<{ category: PhotoPreset['category']; count: number }> {
    const categories: PhotoPreset['category'][] = [
      'portrait', 'landscape', 'street', 'black-white', 'vintage', 'modern', 'artistic'
    ];

    return categories.map(category => ({
      category,
      count: this.presets.filter(preset => preset.category === category).length
    }));
  }
}
