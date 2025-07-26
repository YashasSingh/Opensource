import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Photo import
  importPhotos: () => ipcRenderer.invoke('import-photos'),
  importFolder: () => ipcRenderer.invoke('import-folder'),
  
  // Photo library
  getPhotos: () => ipcRenderer.invoke('get-photos'),
  getPhotoMetadata: (filePath: string) => ipcRenderer.invoke('get-photo-metadata', filePath),
  
  // Photo processing
  processPhoto: (filePath: string, adjustments: any) => 
    ipcRenderer.invoke('process-photo', filePath, adjustments),
  exportPhoto: (filePath: string, outputPath: string, options: any) =>
    ipcRenderer.invoke('export-photo', filePath, outputPath, options),
  
  // Preset management
  getPresets: () => ipcRenderer.invoke('get-presets'),
  applyPreset: (photoPath: string, presetId: string) => 
    ipcRenderer.invoke('apply-preset', photoPath, presetId),
  savePreset: (name: string, description: string, category: string, adjustments: any) =>
    ipcRenderer.invoke('save-preset', name, description, category, adjustments),
  
  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  
  // Event listeners
  onPhotosImported: (callback: (filePaths: string[]) => void) => {
    ipcRenderer.on('photos-imported', (_, filePaths) => callback(filePaths));
  },
  
  onExportRequested: (callback: () => void) => {
    ipcRenderer.on('export-requested', () => callback());
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Type declarations for the exposed API
declare global {
  interface Window {
    electronAPI: {
      importPhotos: () => Promise<string[]>;
      importFolder: () => Promise<string[]>;
      getPhotos: () => Promise<any[]>;
      getPhotoMetadata: (filePath: string) => Promise<any>;
      processPhoto: (filePath: string, adjustments: any) => Promise<Buffer>;
      exportPhoto: (filePath: string, outputPath: string, options: any) => Promise<boolean>;
      getPresets: () => Promise<any>;
      applyPreset: (photoPath: string, presetId: string) => Promise<any>;
      savePreset: (name: string, description: string, category: string, adjustments: any) => Promise<any>;
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
      onPhotosImported: (callback: (filePaths: string[]) => void) => void;
      onExportRequested: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
