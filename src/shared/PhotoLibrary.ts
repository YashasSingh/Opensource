import * as fs from 'fs';
import * as path from 'path';
import Store from 'electron-store';
import { PhotoMetadata } from './types';

export class PhotoLibrary {
  private store: Store<any>;
  private supportedExtensions = ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.raw', '.cr2', '.nef', '.arw', '.dng'];

  constructor() {
    this.store = new Store({
      name: 'photo-library',
      defaults: {
        photos: [],
        lastImportPath: '',
        libraryPath: ''
      }
    });
  }

  async importPhotos(filePaths: string[]): Promise<string[]> {
    const validPaths: string[] = [];

    for (const filePath of filePaths) {
      if (this.isValidImageFile(filePath) && fs.existsSync(filePath)) {
        await this.addPhotoToLibrary(filePath);
        validPaths.push(filePath);
      }
    }

    return validPaths;
  }

  async importFromFolder(folderPath: string): Promise<string[]> {
    const validPaths: string[] = [];

    try {
      const files = await this.scanFolderRecursively(folderPath);
      
      for (const filePath of files) {
        if (this.isValidImageFile(filePath)) {
          await this.addPhotoToLibrary(filePath);
          validPaths.push(filePath);
        }
      }
    } catch (error) {
      console.error('Error importing from folder:', error);
    }

    return validPaths;
  }

  private async scanFolderRecursively(folderPath: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const items = await fs.promises.readdir(folderPath);

      for (const item of items) {
        const fullPath = path.join(folderPath, item);
        const stat = await fs.promises.stat(fullPath);

        if (stat.isDirectory()) {
          const subFiles = await this.scanFolderRecursively(fullPath);
          files.push(...subFiles);
        } else if (stat.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning folder ${folderPath}:`, error);
    }

    return files;
  }

  private isValidImageFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedExtensions.includes(ext);
  }

  private async addPhotoToLibrary(filePath: string): Promise<void> {
    const photos = this.store.get('photos') as PhotoMetadata[];
    
    // Check if photo already exists
    const existingPhoto = photos.find(photo => photo.filePath === filePath);
    if (existingPhoto) {
      return;
    }

    try {
      const stats = await fs.promises.stat(filePath);
      const photoMetadata: PhotoMetadata = {
        id: this.generatePhotoId(),
        filePath,
        fileName: path.basename(filePath),
        fileSize: stats.size,
        dateAdded: new Date().toISOString(),
        dateModified: stats.mtime.toISOString(),
        dateCreated: stats.birthtime.toISOString(),
        rating: 0,
        tags: [],
        adjustments: {
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
          vignette: 0,
          clarity: 0,
          dehaze: 0
        }
      };

      photos.push(photoMetadata);
      this.store.set('photos', photos);
    } catch (error) {
      console.error(`Error adding photo to library: ${filePath}`, error);
    }
  }

  getAllPhotos(): PhotoMetadata[] {
    return this.store.get('photos') as PhotoMetadata[];
  }

  getPhotoById(id: string): PhotoMetadata | undefined {
    const photos = this.getAllPhotos();
    return photos.find(photo => photo.id === id);
  }

  updatePhoto(id: string, updates: Partial<PhotoMetadata>): boolean {
    const photos = this.getAllPhotos();
    const photoIndex = photos.findIndex(photo => photo.id === id);

    if (photoIndex === -1) {
      return false;
    }

    photos[photoIndex] = { ...photos[photoIndex], ...updates };
    this.store.set('photos', photos);
    return true;
  }

  deletePhoto(id: string): boolean {
    const photos = this.getAllPhotos();
    const filteredPhotos = photos.filter(photo => photo.id !== id);

    if (filteredPhotos.length === photos.length) {
      return false; // Photo not found
    }

    this.store.set('photos', filteredPhotos);
    return true;
  }

  searchPhotos(query: string): PhotoMetadata[] {
    const photos = this.getAllPhotos();
    const lowercaseQuery = query.toLowerCase();

    return photos.filter(photo => 
      photo.fileName.toLowerCase().includes(lowercaseQuery) ||
      photo.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  getPhotosByRating(rating: number): PhotoMetadata[] {
    const photos = this.getAllPhotos();
    return photos.filter(photo => photo.rating === rating);
  }

  getPhotosByTag(tag: string): PhotoMetadata[] {
    const photos = this.getAllPhotos();
    return photos.filter(photo => photo.tags.includes(tag));
  }

  private generatePhotoId(): string {
    return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Statistics and analytics
  getLibraryStats() {
    const photos = this.getAllPhotos();
    const totalSize = photos.reduce((sum, photo) => sum + photo.fileSize, 0);
    
    const ratingDistribution = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    photos.forEach(photo => {
      ratingDistribution[photo.rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalPhotos: photos.length,
      totalSize: totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
      ratingDistribution,
      averageRating: photos.reduce((sum, photo) => sum + photo.rating, 0) / photos.length || 0
    };
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
