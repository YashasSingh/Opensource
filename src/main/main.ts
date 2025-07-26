import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { PhotoLibrary } from '../shared/PhotoLibrary';
import { PhotoProcessor } from '../shared/PhotoProcessor';
import { PresetManager } from '../shared/PresetManager';
import { BatchProcessor } from '../shared/BatchProcessor';
import { RawProcessor } from '../shared/RawProcessor';
import { PhotoAdjustments } from '../shared/types';

class PhotoEditApp {
  private mainWindow: BrowserWindow | null = null;
  private photoLibrary: PhotoLibrary;
  private photoProcessor: PhotoProcessor;
  private presetManager: PresetManager;
  private batchProcessor: BatchProcessor;
  private rawProcessor: RawProcessor;

  constructor() {
    this.photoLibrary = new PhotoLibrary();
    this.photoProcessor = new PhotoProcessor();
    this.presetManager = new PresetManager();
    this.batchProcessor = new BatchProcessor();
    this.rawProcessor = new RawProcessor();
    this.initializeApp();
  }

  private initializeApp(): void {
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupMenu();
      this.setupIpcHandlers();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../renderer/preload.js')
      },
      titleBarStyle: 'hidden',
      frame: false,
      show: false,
      backgroundColor: '#1e1e1e'
    });

    // Load the renderer
    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Import Photos...',
            accelerator: 'CmdOrCtrl+I',
            click: () => this.importPhotos()
          },
          {
            label: 'Import Folder...',
            accelerator: 'CmdOrCtrl+Shift+I',
            click: () => this.importFolder()
          },
          { type: 'separator' },
          {
            label: 'Export...',
            accelerator: 'CmdOrCtrl+E',
            click: () => this.exportPhoto()
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIpcHandlers(): void {
    // Photo import handlers
    ipcMain.handle('import-photos', async () => {
      return await this.importPhotos();
    });

    ipcMain.handle('import-folder', async () => {
      return await this.importFolder();
    });

    // Photo library handlers
    ipcMain.handle('get-photos', async () => {
      return this.photoLibrary.getAllPhotos();
    });

    ipcMain.handle('get-photo-metadata', async (_, filePath: string) => {
      return this.photoProcessor.getMetadata(filePath);
    });

    // Photo processing handlers
    ipcMain.handle('process-photo', async (_, filePath: string, adjustments: any) => {
      return this.photoProcessor.processPhoto(filePath, adjustments);
    });

    ipcMain.handle('export-photo', async (_, filePath: string, outputPath: string, options: any) => {
      return this.photoProcessor.exportPhoto(filePath, outputPath, options);
    });

    // Preset management handlers
    ipcMain.handle('get-presets', async () => {
      try {
        const presets = this.presetManager.getAllPresets();
        return { success: true, presets };
      } catch (error: any) {
        console.error('Get presets error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('apply-preset', async (_, photoPath: string, presetId: string) => {
      try {
        const preset = this.presetManager.getPresetById(presetId);
        if (!preset) {
          throw new Error('Preset not found');
        }
        
        // Create default adjustments and apply preset
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
        
        const fullAdjustments = { ...defaultAdjustments, ...preset.adjustments };
        const result = await this.photoProcessor.processPhoto(photoPath, fullAdjustments);
        return { success: true, result };
      } catch (error: any) {
        console.error('Apply preset error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('save-preset', async (_, name: string, description: string, category: string, adjustments: any) => {
      try {
        const preset = this.presetManager.createCustomPreset(name, description, category as any, adjustments);
        return { success: true, preset };
      } catch (error: any) {
        console.error('Save preset error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    // Batch processing handlers
    ipcMain.handle('create-batch-job', async (_, name: string, inputFiles: string[], outputDirectory: string, adjustments: any, exportOptions: any) => {
      try {
        const job = this.batchProcessor.createBatchJob(name, inputFiles, outputDirectory, adjustments, exportOptions);
        return { success: true, job };
      } catch (error: any) {
        console.error('Create batch job error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('queue-batch-job', async (_, jobId: string) => {
      try {
        const result = await this.batchProcessor.queueJob(jobId);
        return { success: result };
      } catch (error: any) {
        console.error('Queue batch job error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('get-batch-jobs', async () => {
      try {
        const jobs = this.batchProcessor.getAllJobs();
        return { success: true, jobs };
      } catch (error: any) {
        console.error('Get batch jobs error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('get-batch-job', async (_, jobId: string) => {
      try {
        const job = this.batchProcessor.getJob(jobId);
        if (!job) {
          return { success: false, error: 'Job not found' };
        }
        return { success: true, job };
      } catch (error: any) {
        console.error('Get batch job error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('cancel-batch-job', async (_, jobId: string) => {
      try {
        const result = this.batchProcessor.cancelJob(jobId);
        return { success: result };
      } catch (error: any) {
        console.error('Cancel batch job error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('delete-batch-job', async (_, jobId: string) => {
      try {
        const result = this.batchProcessor.deleteJob(jobId);
        return { success: result };
      } catch (error: any) {
        console.error('Delete batch job error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('get-batch-statistics', async () => {
      try {
        const stats = this.batchProcessor.getStatistics();
        return { success: true, stats };
      } catch (error: any) {
        console.error('Get batch statistics error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    // RAW processing handlers
    ipcMain.handle('is-raw-file', async (_, filePath: string) => {
      try {
        const isRaw = this.rawProcessor.isRawFile(filePath);
        return { success: true, isRaw };
      } catch (error: any) {
        console.error('Is RAW file error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('process-raw-file', async (_, inputPath: string, outputPath: string, settings: any, adjustments: any) => {
      try {
        const result = await this.rawProcessor.processRawFile(inputPath, outputPath, settings, adjustments);
        return { success: true, result };
      } catch (error: any) {
        console.error('Process RAW file error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('get-raw-metadata', async (_, filePath: string) => {
      try {
        const metadata = await this.rawProcessor.extractRawMetadata(filePath);
        return { success: true, metadata };
      } catch (error: any) {
        console.error('Get RAW metadata error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    ipcMain.handle('get-supported-raw-formats', async () => {
      try {
        const formats = this.rawProcessor.getSupportedRawFormats();
        return { success: true, formats };
      } catch (error: any) {
        console.error('Get supported RAW formats error:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      }
    });

    // Window controls
    ipcMain.handle('window-minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window-maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window-close', () => {
      this.mainWindow?.close();
    });
  }

  private async importPhotos(): Promise<string[]> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      title: 'Import Photos',
      filters: [
        {
          name: 'Images',
          extensions: ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'raw', 'cr2', 'nef', 'arw', 'dng']
        }
      ],
      properties: ['openFile', 'multiSelections']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const importedPaths = await this.photoLibrary.importPhotos(result.filePaths);
      this.mainWindow?.webContents.send('photos-imported', importedPaths);
      return importedPaths;
    }

    return [];
  }

  private async importFolder(): Promise<string[]> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      title: 'Import Folder',
      properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const importedPaths = await this.photoLibrary.importFromFolder(result.filePaths[0]);
      this.mainWindow?.webContents.send('photos-imported', importedPaths);
      return importedPaths;
    }

    return [];
  }

  private async exportPhoto(): Promise<void> {
    // This will be called from the renderer when a photo is selected
    this.mainWindow?.webContents.send('export-requested');
  }
}

// Create the application
new PhotoEditApp();
