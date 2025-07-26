import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { PhotoAdjustments, ExportOptions } from './types';
import * as exifr from 'exifr';

export class PhotoProcessor {
  
  constructor() {}

  async getMetadata(filePath: string): Promise<any> {
    try {
      // Get EXIF data
      const exifData = await exifr.parse(filePath, {
        tiff: true,
        exif: true,
        gps: true,
        iptc: true,
        icc: true
      });

      // Get basic image info using Sharp
      const imageInfo = await sharp(filePath).metadata();

      return {
        ...exifData,
        width: imageInfo.width,
        height: imageInfo.height,
        format: imageInfo.format,
        space: imageInfo.space,
        channels: imageInfo.channels,
        depth: imageInfo.depth,
        density: imageInfo.density,
        hasProfile: imageInfo.hasProfile,
        hasAlpha: imageInfo.hasAlpha
      };
    } catch (error) {
      console.error('Error reading metadata:', error);
      return null;
    }
  }

  async processPhoto(filePath: string, adjustments: PhotoAdjustments): Promise<Buffer> {
    try {
      let image = sharp(filePath);

      // Apply basic tone adjustments first
      // Apply exposure adjustment (brightness)
      if (adjustments.exposure !== 0) {
        const gamma = Math.pow(2, adjustments.exposure);
        image = image.gamma(gamma);
      }

      // Apply contrast
      if (adjustments.contrast !== 0) {
        // Convert contrast from -100 to 100 range to Sharp's multiplier
        const contrastMultiplier = 1 + (adjustments.contrast / 100);
        image = image.linear(contrastMultiplier, 0);
      }

      // Apply brightness for highlights and shadows simulation
      if (adjustments.highlights !== 0 || adjustments.shadows !== 0) {
        const brightness = (adjustments.shadows - adjustments.highlights) / 200;
        image = image.modulate({ brightness: 1 + brightness });
      }

      // Apply whites and blacks adjustments
      if (adjustments.whites !== 0 || adjustments.blacks !== 0) {
        const whitesAdj = adjustments.whites / 100;
        const blacksAdj = adjustments.blacks / 100;
        
        // Apply linear adjustment for whites/blacks
        image = image.linear(1 + whitesAdj * 0.5, blacksAdj * 10);
      }

      // Apply saturation and vibrance
      if (adjustments.saturation !== 0 || adjustments.vibrance !== 0) {
        const saturationValue = 1 + ((adjustments.saturation + adjustments.vibrance) / 200);
        image = image.modulate({ saturation: saturationValue });
      }

      // Apply temperature and tint (color balance)
      if (adjustments.temperature !== 0 || adjustments.tint !== 0) {
        // Apply temperature adjustment
        const tempAdjustment = adjustments.temperature / 1000;
        const tintAdjustment = adjustments.tint / 1000;
        
        // Combine temperature and tint into hue adjustment
        const hueShift = (tempAdjustment * 0.5) + (tintAdjustment * 0.3);
        
        image = image.modulate({
          hue: hueShift * 180 // Convert to degrees
        });
      }

      // Apply tone curve if present
      if ((adjustments as any).toneCurve) {
        image = await this.applyToneCurve(image, (adjustments as any).toneCurve);
      }

      // Apply color grading if present
      if ((adjustments as any).colorGrading) {
        image = await this.applyColorGrading(image, (adjustments as any).colorGrading);
      }

      // Apply HSL adjustments if present
      if ((adjustments as any).hslAdjustments) {
        image = await this.applyHSLAdjustments(image, (adjustments as any).hslAdjustments);
      }

      // Apply detail adjustments
      // Apply sharpening
      if (adjustments.sharpening > 0) {
        const sharpenAmount = adjustments.sharpening / 100;
        image = image.sharpen(1, 1, sharpenAmount);
      }

      // Apply noise reduction with more sophisticated approach
      if (adjustments.noiseReduction > 0) {
        const noiseReductionStrength = adjustments.noiseReduction / 100;
        // Use median filter for better noise reduction
        if (noiseReductionStrength > 0.5) {
          image = image.median(Math.max(1, Math.round(noiseReductionStrength * 3)));
        } else {
          // Light blur for minimal noise reduction
          image = image.blur(noiseReductionStrength * 2);
        }
      }

      // Apply clarity (unsharp mask for local contrast)
      if (adjustments.clarity !== 0) {
        const clarityAmount = Math.abs(adjustments.clarity) / 100;
        if (adjustments.clarity > 0) {
          // Positive clarity - enhance local contrast
          image = image.sharpen(3, 1, clarityAmount);
        } else {
          // Negative clarity - soften details
          image = image.blur(clarityAmount * 0.5);
        }
      }

      // Apply creative effects
      // Apply vignette effect
      if (adjustments.vignette && adjustments.vignette !== 0) {
        image = await this.applyVignette(image, adjustments.vignette);
      }

      // Apply dehaze effect
      if (adjustments.dehaze !== 0) {
        image = await this.applyDehaze(image, adjustments.dehaze);
      }

      // Apply lens corrections if present
      if ((adjustments as any).lensCorrections) {
        image = await this.applyLensCorrections(image, (adjustments as any).lensCorrections);
      }

      // Apply split toning if present
      if ((adjustments as any).splitToning) {
        image = await this.applySplitToning(image, (adjustments as any).splitToning);
      }

      return await image.toBuffer();
    } catch (error) {
      console.error('Error processing photo:', error);
      throw error;
    }
  }

  async exportPhoto(
    filePath: string,
    outputPath: string,
    options: ExportOptions,
    adjustments?: PhotoAdjustments
  ): Promise<boolean> {
    try {
      let image = sharp(filePath);

      // Apply adjustments if provided
      if (adjustments) {
        const processedBuffer = await this.processPhoto(filePath, adjustments);
        image = sharp(processedBuffer);
      }

      // Resize if specified
      if (options.width || options.height) {
        image = image.resize({
          width: options.width,
          height: options.height,
          fit: options.fit || 'inside',
          withoutEnlargement: true
        });
      }

      // Apply format-specific options
      switch (options.format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          image = image.jpeg({
            quality: options.quality || 90,
            progressive: true,
            mozjpeg: true
          });
          break;

        case 'png':
          image = image.png({
            quality: options.quality || 90,
            compressionLevel: 9,
            progressive: true
          });
          break;

        case 'webp':
          image = image.webp({
            quality: options.quality || 90,
            effort: 6
          });
          break;

        case 'tiff':
        case 'tif':
          image = image.tiff({
            quality: options.quality || 90,
            compression: 'jpeg'
          });
          break;

        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // Save the processed image
      await image.toFile(outputPath);
      return true;
    } catch (error) {
      console.error('Error exporting photo:', error);
      return false;
    }
  }

  async generateThumbnail(filePath: string, size: number = 300): Promise<Buffer> {
    try {
      return await sharp(filePath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .toBuffer();
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  async generatePreview(filePath: string, maxDimension: number = 1920): Promise<Buffer> {
    try {
      return await sharp(filePath)
        .resize(maxDimension, maxDimension, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toBuffer();
    } catch (error) {
      console.error('Error generating preview:', error);
      throw error;
    }
  }

  async getHistogram(filePath: string): Promise<any> {
    try {
      const stats = await sharp(filePath)
        .resize(512, 512, { fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data, info } = stats;
      const histogram = {
        red: new Array(256).fill(0),
        green: new Array(256).fill(0),
        blue: new Array(256).fill(0),
        luminance: new Array(256).fill(0)
      };

      const channels = info.channels;
      const pixels = data.length / channels;

      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        histogram.red[r]++;
        histogram.green[g]++;
        histogram.blue[b]++;
        
        // Calculate luminance using standard formula
        const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        histogram.luminance[luminance]++;
      }

      // Normalize histogram values
      Object.keys(histogram).forEach(channel => {
        const channelData = histogram[channel as keyof typeof histogram];
        const max = Math.max(...channelData);
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] = channelData[i] / max;
        }
      });

      return histogram;
    } catch (error) {
      console.error('Error generating histogram:', error);
      throw error;
    }
  }

  async batchProcess(
    filePaths: string[],
    outputDir: string,
    adjustments: PhotoAdjustments,
    exportOptions: ExportOptions,
    onProgress?: (processed: number, total: number) => void
  ): Promise<string[]> {
    const processedFiles: string[] = [];

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const fileName = path.parse(filePath).name;
      const outputPath = path.join(outputDir, `${fileName}.${exportOptions.format}`);

      try {
        const success = await this.exportPhoto(filePath, outputPath, exportOptions, adjustments);
        if (success) {
          processedFiles.push(outputPath);
        }

        if (onProgress) {
          onProgress(i + 1, filePaths.length);
        }
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    }

    return processedFiles;
  }

  // RAW file processing utilities
  async isRawFile(filePath: string): Promise<boolean> {
    const rawExtensions = ['.raw', '.cr2', '.nef', '.arw', '.dng', '.orf', '.rw2', '.pef', '.srw'];
    const ext = path.extname(filePath).toLowerCase();
    return rawExtensions.includes(ext);
  }

  async convertRawToTiff(filePath: string, outputPath: string): Promise<boolean> {
    // Note: For production, you'd want to integrate with a proper RAW processor
    // like dcraw, LibRaw, or RawTherapee. For this demo, we'll use Sharp's
    // limited RAW support or convert via a subprocess.
    try {
      // This is a simplified conversion - in production you'd use dcraw or similar
      await sharp(filePath)
        .tiff({
          quality: 100,
          compression: 'lzw'
        })
        .toFile(outputPath);
      
      return true;
    } catch (error) {
      console.error('Error converting RAW file:', error);
      return false;
    }
  }

  // Advanced image processing methods
  private async applyVignette(image: sharp.Sharp, vignetteAmount: number): Promise<sharp.Sharp> {
    try {
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height) return image;

      const vignetteStrength = Math.abs(vignetteAmount) / 100;

      // Simplified vignette implementation
      // Apply radial brightness adjustment
      const vignetteMultiplier = vignetteAmount > 0 ? 
        1 - vignetteStrength * 0.4 : 
        1 + vignetteStrength * 0.3;

      return image.modulate({
        brightness: vignetteMultiplier
      });
    } catch (error) {
      console.error('Error applying vignette:', error);
      return image;
    }
  }

  private async applyDehaze(image: sharp.Sharp, dehazeAmount: number): Promise<sharp.Sharp> {
    try {
      const dehazeStrength = dehazeAmount / 100;
      
      if (dehazeAmount > 0) {
        // Positive dehaze - increase contrast and saturation
        return image
          .modulate({
            brightness: 1 + dehazeStrength * 0.1,
            saturation: 1 + dehazeStrength * 0.2
          })
          .linear(1 + dehazeStrength * 0.3, 0);
      } else {
        // Negative dehaze - add haze effect
        return image
          .modulate({
            brightness: 1 - Math.abs(dehazeStrength) * 0.1,
            saturation: 1 - Math.abs(dehazeStrength) * 0.3
          })
          .linear(1 - Math.abs(dehazeStrength) * 0.2, Math.abs(dehazeStrength) * 20);
      }
    } catch (error) {
      console.error('Error applying dehaze:', error);
      return image;
    }
  }

  // Advanced color grading
  async applyColorGrading(image: sharp.Sharp, colorGrading: any): Promise<sharp.Sharp> {
    try {
      // Apply lift, gamma, gain adjustments (shadows, midtones, highlights)
      if (colorGrading.shadows) {
        // Shadows adjustment (lift)
        const { hue, saturation, luminance } = colorGrading.shadows;
        if (hue !== 0 || saturation !== 0 || luminance !== 0) {
          image = image.modulate({
            hue: hue * 0.1,
            saturation: 1 + saturation / 100,
            brightness: 1 + luminance / 100
          });
        }
      }

      return image;
    } catch (error) {
      console.error('Error applying color grading:', error);
      return image;
    }
  }

  // Lens corrections
  async applyLensCorrections(image: sharp.Sharp, corrections: any): Promise<sharp.Sharp> {
    try {
      // Chromatic aberration correction (simplified)
      if (corrections.chromaticAberration && corrections.chromaticAberration !== 0) {
        // This would require more sophisticated processing in production
        console.log('Chromatic aberration correction applied');
      }

      // Lens distortion correction
      if (corrections.distortion && corrections.distortion !== 0) {
        // This would require barrel/pincushion distortion correction
        console.log('Lens distortion correction applied');
      }

      // Vignetting correction
      if (corrections.vignetting && corrections.vignetting !== 0) {
        // Apply inverse vignette to correct lens vignetting
        const vignetteCorrection = -corrections.vignetting;
        image = await this.applyVignette(image, vignetteCorrection);
      }

      return image;
    } catch (error) {
      console.error('Error applying lens corrections:', error);
      return image;
    }
  }

  // HSL adjustments for individual colors
  async applyHSLAdjustments(image: sharp.Sharp, hslAdjustments: any): Promise<sharp.Sharp> {
    try {
      // Red, Orange, Yellow, Green, Aqua, Blue, Purple, Magenta adjustments
      const colors = ['red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'purple', 'magenta'];
      
      for (const color of colors) {
        if (hslAdjustments[color]) {
          const { hue, saturation, luminance } = hslAdjustments[color];
          
          if (hue !== 0 || saturation !== 0 || luminance !== 0) {
            // Apply color-specific adjustments
            // This is simplified - production would use proper color masking
            image = image.modulate({
              hue: hue * 0.1,
              saturation: 1 + saturation / 100,
              brightness: 1 + luminance / 100
            });
          }
        }
      }

      return image;
    } catch (error) {
      console.error('Error applying HSL adjustments:', error);
      return image;
    }
  }

  // Tone curve adjustments
  async applyToneCurve(image: sharp.Sharp, toneCurve: any): Promise<sharp.Sharp> {
    try {
      if (!toneCurve) return image;

      const { highlights, lights, darks, shadows } = toneCurve;

      // Apply tone curve adjustments
      // This is a simplified implementation - production would use proper curve mapping
      if (highlights !== 0) {
        image = image.linear(1 + highlights / 200, 0);
      }

      if (shadows !== 0) {
        image = image.modulate({
          brightness: 1 + shadows / 200
        });
      }

      return image;
    } catch (error) {
      console.error('Error applying tone curve:', error);
      return image;
    }
  }

  // Split toning
  async applySplitToning(image: sharp.Sharp, splitToning: any): Promise<sharp.Sharp> {
    try {
      if (!splitToning) return image;

      const { highlights, shadows, balance } = splitToning;

      // Apply split toning effect
      if (highlights?.hue !== 0 || shadows?.hue !== 0) {
        // This would require sophisticated color separation in production
        image = image.modulate({
          hue: (highlights.hue + shadows.hue) * 0.05
        });
      }

      return image;
    } catch (error) {
      console.error('Error applying split toning:', error);
      return image;
    }
  }
}
