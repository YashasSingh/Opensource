import * as fs from 'fs';
import * as path from 'path';
import { PhotoAdjustments } from './types';
import sharp from 'sharp';

export interface RawProcessingSettings {
  // Demosaicing
  demosaicing: 'AHD' | 'VNG' | 'PPG' | 'AAHD' | 'DCB' | 'Modified_AHD' | 'AFD' | 'VCD' | 'Mixed_VCD_Modified_AHD' | 'LMMSE' | 'AMaZE' | 'DHT' | 'AAHD2' | 'Modified_DCB';
  
  // Noise reduction
  noiseReduction: boolean;
  denoisingStrength: number; // 0-1
  
  // Color space
  colorSpace: 'sRGB' | 'AdobeRGB' | 'ProPhotoRGB' | 'WideGamutRGB' | 'ColorMatchRGB' | 'ACES';
  
  // White balance
  whiteBalance: 'auto' | 'daylight' | 'cloudy' | 'shade' | 'tungsten' | 'fluorescent' | 'flash' | 'custom';
  customTemperature?: number;
  customTint?: number;
  
  // Exposure compensation
  exposureCompensation: number; // -3 to +3 stops
  
  // Highlight recovery
  highlightRecovery: number; // 0-4
  
  // Shadow/Highlight
  shadows: number; // 0-100
  highlights: number; // 0-100
  
  // Color rendering
  vibrance: number; // -100 to +100
  saturation: number; // -100 to +100
  
  // Sharpening
  sharpening: boolean;
  sharpeningAmount: number; // 0-500
  sharpeningRadius: number; // 0.5-3.0
  sharpeningThreshold: number; // 0-10
  
  // Lens corrections
  lensCorrections: boolean;
  vignettingCorrection: number; // 0-100
  chromaticAberrationCorrection: boolean;
  distortionCorrection: number; // -100 to +100
  
  // Output
  outputBitDepth: 8 | 16;
  outputGamma: number; // 1.0-3.0
}

export class RawProcessor {
  private defaultSettings: RawProcessingSettings;

  constructor() {
    this.defaultSettings = {
      demosaicing: 'AHD',
      noiseReduction: true,
      denoisingStrength: 0.25,
      colorSpace: 'sRGB',
      whiteBalance: 'auto',
      exposureCompensation: 0,
      highlightRecovery: 0,
      shadows: 0,
      highlights: 0,
      vibrance: 0,
      saturation: 0,
      sharpening: true,
      sharpeningAmount: 50,
      sharpeningRadius: 1.0,
      sharpeningThreshold: 0,
      lensCorrections: false,
      vignettingCorrection: 0,
      chromaticAberrationCorrection: false,
      distortionCorrection: 0,
      outputBitDepth: 16,
      outputGamma: 2.2
    };
  }

  // Check if file is a RAW format
  isRawFile(filePath: string): boolean {
    const extension = path.extname(filePath).toLowerCase();
    const rawExtensions = [
      '.cr2', '.cr3', '.crw',  // Canon
      '.nef', '.nrw',          // Nikon
      '.arw', '.srf', '.sr2',  // Sony
      '.orf',                  // Olympus
      '.rw2',                  // Panasonic
      '.pef', '.ptx',          // Pentax
      '.raf',                  // Fujifilm
      '.3fr',                  // Hasselblad
      '.dcr', '.mrw',          // Minolta
      '.mdg', '.mdc',          // Minolta/Konica
      '.erf',                  // Epson
      '.mos',                  // Leaf
      '.raw',                  // Leica/Panasonic/Samsung
      '.rwl',                  // Leica
      '.dng',                  // Adobe/Various
      '.iiq',                  // Phase One
      '.k25', '.kdc',          // Kodak
      '.fff',                  // Imacon/Hasselblad
      '.mef',                  // Mamiya
      '.nksc',                 // Nikon Scan
      '.qtk',                  // Apple QuickTake
      '.rdc',                  // Ricoh
      '.sr2', '.srf',          // Sony
      '.bay',                  // Casio
      '.cine',                 // Vision Research Phantom
      '.ia',                   // Sinar
      '.on1',                  // ON1
      '.ori',                  // Olympus
      '.x3f'                   // Sigma
    ];
    
    return rawExtensions.includes(extension);
  }

  // Process RAW file using dcraw (simplified implementation)
  async processRawFile(
    inputPath: string, 
    outputPath: string,
    settings: Partial<RawProcessingSettings> = {},
    adjustments: Partial<PhotoAdjustments> = {}
  ): Promise<Buffer> {
    if (!this.isRawFile(inputPath)) {
      throw new Error('Input file is not a RAW format');
    }

    const finalSettings = { ...this.defaultSettings, ...settings };
    
    try {
      // For now, we'll use a simplified approach with Sharp
      // In a production environment, you'd want to use dcraw or LibRaw
      
      // Read the RAW file as buffer
      const inputBuffer = fs.readFileSync(inputPath);
      
      // Process with Sharp (limited RAW support)
      let pipeline = sharp(inputBuffer, {
        limitInputPixels: false
      });

      // Apply basic RAW processing
      pipeline = this.applyRawProcessing(pipeline, finalSettings);
      
      // Apply photo adjustments
      pipeline = this.applyPhotoAdjustments(pipeline, adjustments);
      
      // Configure output
      pipeline = pipeline
        .jpeg({ 
          quality: 95,
          progressive: true 
        });

      const outputBuffer = await pipeline.toBuffer();
      
      // Write to output file if path provided
      if (outputPath) {
        fs.writeFileSync(outputPath, outputBuffer);
      }
      
      return outputBuffer;
      
    } catch (error: any) {
      throw new Error(`RAW processing failed: ${error?.message || 'Unknown error'}`);
    }
  }

  // Apply RAW-specific processing
  private applyRawProcessing(pipeline: sharp.Sharp, settings: RawProcessingSettings): sharp.Sharp {
    // White balance adjustments
    if (settings.whiteBalance === 'custom' && settings.customTemperature) {
      // Approximate temperature adjustment using modulate
      const tempFactor = this.temperatureToFactor(settings.customTemperature);
      pipeline = pipeline.modulate({
        brightness: 1,
        saturation: 1,
        hue: tempFactor.hue
      });
    }

    // Exposure compensation
    if (settings.exposureCompensation !== 0) {
      const exposureFactor = Math.pow(2, settings.exposureCompensation);
      pipeline = pipeline.linear(exposureFactor, 0);
    }

    // Basic noise reduction (using blur)
    if (settings.noiseReduction && settings.denoisingStrength > 0) {
      const blurAmount = settings.denoisingStrength * 2;
      pipeline = pipeline.blur(blurAmount);
    }

    // Sharpening
    if (settings.sharpening) {
      pipeline = pipeline.sharpen({
        sigma: settings.sharpeningRadius,
        m1: settings.sharpeningAmount / 100,
        m2: settings.sharpeningThreshold / 10
      });
    }

    return pipeline;
  }

  // Apply photo adjustments after RAW processing
  private applyPhotoAdjustments(pipeline: sharp.Sharp, adjustments: Partial<PhotoAdjustments>): sharp.Sharp {
    // Brightness and contrast (simulating exposure and contrast)
    if (adjustments.exposure || adjustments.contrast) {
      const brightness = 1 + (adjustments.exposure || 0) * 0.3;
      const contrast = 1 + (adjustments.contrast || 0) * 0.01;
      
      pipeline = pipeline.linear(contrast, (1 - contrast) * 128 * brightness);
    }

    // Saturation and vibrance
    if (adjustments.saturation || adjustments.vibrance) {
      const saturation = 1 + ((adjustments.saturation || 0) + (adjustments.vibrance || 0) * 0.7) * 0.01;
      pipeline = pipeline.modulate({
        saturation: saturation
      });
    }

    // Temperature (hue shift)
    if (adjustments.temperature) {
      const hueShift = (adjustments.temperature / 1000) * 30; // Rough conversion
      pipeline = pipeline.modulate({
        hue: hueShift
      });
    }

    return pipeline;
  }

  // Convert color temperature to hue adjustment factor
  private temperatureToFactor(temperature: number): { hue: number } {
    // Simplified temperature to hue conversion
    // In reality, this would involve complex color science calculations
    const normalizedTemp = (temperature - 5500) / 1000; // Normalize around daylight
    const hue = normalizedTemp * 15; // Rough conversion to hue degrees
    
    return { hue };
  }

  // Extract RAW metadata
  async extractRawMetadata(filePath: string): Promise<any> {
    try {
      // In a real implementation, you'd use exifr or similar
      // to extract comprehensive RAW metadata
      const stats = fs.statSync(filePath);
      
      return {
        fileSize: stats.size,
        dateModified: stats.mtime,
        isRaw: this.isRawFile(filePath),
        format: path.extname(filePath).toLowerCase(),
        // Additional metadata would be extracted here
        camera: {
          make: 'Unknown',
          model: 'Unknown',
          iso: 0,
          aperture: 0,
          shutterSpeed: '0',
          focalLength: 0
        },
        rawSettings: {
          whiteBalance: 'auto',
          colorSpace: 'sRGB',
          exposureCompensation: 0
        }
      };
    } catch (error: any) {
      throw new Error(`Failed to extract RAW metadata: ${error?.message || 'Unknown error'}`);
    }
  }

  // Get supported RAW formats
  getSupportedRawFormats(): string[] {
    return [
      'Canon (CR2, CR3, CRW)',
      'Nikon (NEF, NRW)',
      'Sony (ARW, SRF, SR2)',
      'Olympus (ORF)',
      'Panasonic (RW2)',
      'Pentax (PEF, PTX)',
      'Fujifilm (RAF)',
      'Hasselblad (3FR, FFF)',
      'Leica (RAW, RWL)',
      'Adobe DNG',
      'Phase One (IIQ)',
      'Sigma (X3F)',
      'And many more...'
    ];
  }

  // Create default RAW settings for different camera brands
  getDefaultSettingsForCamera(cameraMake: string): RawProcessingSettings {
    const baseSettings = { ...this.defaultSettings };

    switch (cameraMake.toLowerCase()) {
      case 'canon':
        return {
          ...baseSettings,
          demosaicing: 'DCB',
          colorSpace: 'sRGB',
          sharpening: true,
          sharpeningAmount: 40
        };

      case 'nikon':
        return {
          ...baseSettings,
          demosaicing: 'AHD',
          colorSpace: 'sRGB',
          sharpening: true,
          sharpeningAmount: 35
        };

      case 'sony':
        return {
          ...baseSettings,
          demosaicing: 'VNG',
          colorSpace: 'sRGB',
          sharpening: true,
          sharpeningAmount: 45
        };

      case 'fujifilm':
        return {
          ...baseSettings,
          demosaicing: 'AMaZE', // Better for X-Trans sensors
          colorSpace: 'sRGB',
          sharpening: true,
          sharpeningAmount: 30
        };

      default:
        return baseSettings;
    }
  }

  // Batch process RAW files
  async batchProcessRaw(
    inputFiles: string[],
    outputDirectory: string,
    settings: Partial<RawProcessingSettings> = {},
    adjustments: Partial<PhotoAdjustments> = {},
    progressCallback?: (processed: number, total: number, currentFile: string) => void
  ): Promise<{ successful: string[], failed: { file: string, error: string }[] }> {
    const results = {
      successful: [] as string[],
      failed: [] as { file: string, error: string }[]
    };

    for (let i = 0; i < inputFiles.length; i++) {
      const inputFile = inputFiles[i];
      
      try {
        if (progressCallback) {
          progressCallback(i, inputFiles.length, path.basename(inputFile));
        }

        if (!this.isRawFile(inputFile)) {
          results.failed.push({
            file: inputFile,
            error: 'Not a RAW file'
          });
          continue;
        }

        const fileName = path.parse(inputFile).name;
        const outputPath = path.join(outputDirectory, `${fileName}_processed.jpg`);
        
        await this.processRawFile(inputFile, outputPath, settings, adjustments);
        results.successful.push(outputPath);

      } catch (error: any) {
        results.failed.push({
          file: inputFile,
          error: error?.message || 'Unknown error'
        });
      }
    }

    if (progressCallback) {
      progressCallback(inputFiles.length, inputFiles.length, 'Complete');
    }

    return results;
  }
}
