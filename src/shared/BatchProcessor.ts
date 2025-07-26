import { PhotoProcessor } from './PhotoProcessor';
import { PhotoAdjustments, ExportOptions } from './types';
import * as fs from 'fs';
import * as path from 'path';

export interface BatchJob {
  id: string;
  name: string;
  inputFiles: string[];
  outputDirectory: string;
  adjustments: PhotoAdjustments;
  exportOptions: ExportOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdDate: Date;
  startedDate?: Date;
  completedDate?: Date;
  errors: string[];
  processedFiles: number;
  totalFiles: number;
}

export interface BatchProcessingOptions {
  preserveOriginalNames: boolean;
  addPrefix?: string;
  addSuffix?: string;
  overwriteExisting: boolean;
  createSubfolders: boolean;
  subfolderFormat?: 'date' | 'preset' | 'custom';
  customSubfolderName?: string;
  maxConcurrentProcessing: number;
}

export class BatchProcessor {
  private photoProcessor: PhotoProcessor;
  private activeJobs: Map<string, BatchJob> = new Map();
  private jobQueue: string[] = [];
  private isProcessing: boolean = false;
  private maxConcurrentJobs: number = 3;

  constructor() {
    this.photoProcessor = new PhotoProcessor();
  }

  // Create a new batch job
  createBatchJob(
    name: string,
    inputFiles: string[],
    outputDirectory: string,
    adjustments: PhotoAdjustments,
    exportOptions: ExportOptions
  ): BatchJob {
    const job: BatchJob = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      inputFiles: [...inputFiles], // Create a copy
      outputDirectory,
      adjustments: { ...adjustments }, // Create a copy
      exportOptions: { ...exportOptions }, // Create a copy
      status: 'pending',
      progress: 0,
      createdDate: new Date(),
      errors: [],
      processedFiles: 0,
      totalFiles: inputFiles.length
    };

    this.activeJobs.set(job.id, job);
    return job;
  }

  // Add job to processing queue
  async queueJob(jobId: string): Promise<boolean> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      console.error('Job not found:', jobId);
      return false;
    }

    if (job.status !== 'pending') {
      console.error('Job is not in pending status:', jobId);
      return false;
    }

    // Validate output directory
    if (!fs.existsSync(job.outputDirectory)) {
      try {
        fs.mkdirSync(job.outputDirectory, { recursive: true });
      } catch (error: any) {
        job.status = 'failed';
        job.errors.push(`Failed to create output directory: ${error?.message || 'Unknown error'}`);
        return false;
      }
    }

    this.jobQueue.push(jobId);
    this.processQueue();
    return true;
  }

  // Process the job queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.jobQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      const activeBatches = Array.from(this.activeJobs.values())
        .filter(job => job.status === 'processing');

      while (this.jobQueue.length > 0 && activeBatches.length < this.maxConcurrentJobs) {
        const jobId = this.jobQueue.shift()!;
        const job = this.activeJobs.get(jobId);
        
        if (job && job.status === 'pending') {
          this.processJob(job);
          activeBatches.push(job);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Process a single batch job
  private async processJob(job: BatchJob): Promise<void> {
    job.status = 'processing';
    job.startedDate = new Date();
    job.progress = 0;
    job.processedFiles = 0;
    job.errors = [];

    console.log(`Starting batch job: ${job.name} (${job.totalFiles} files)`);

    try {
      for (let i = 0; i < job.inputFiles.length; i++) {
        const inputFile = job.inputFiles[i];
        
        try {
          await this.processFile(job, inputFile, i);
          job.processedFiles++;
        } catch (error: any) {
          const errorMessage = `Failed to process ${path.basename(inputFile)}: ${error?.message || 'Unknown error'}`;
          job.errors.push(errorMessage);
          console.error(errorMessage);
        }

        // Update progress
        job.progress = Math.round(((i + 1) / job.totalFiles) * 100);
      }

      // Mark job as completed
      job.status = job.errors.length === 0 ? 'completed' : 'failed';
      job.completedDate = new Date();
      job.progress = 100;

      console.log(`Batch job completed: ${job.name}. Processed: ${job.processedFiles}/${job.totalFiles}, Errors: ${job.errors.length}`);

    } catch (error: any) {
      job.status = 'failed';
      job.errors.push(`Job failed: ${error?.message || 'Unknown error'}`);
      console.error('Batch job failed:', job.name, error);
    }

    // Continue processing queue
    setTimeout(() => this.processQueue(), 100);
  }

  // Process a single file within a batch job
  private async processFile(job: BatchJob, inputFile: string, index: number): Promise<void> {
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      throw new Error('Input file does not exist');
    }

    // Generate output filename
    const outputFilename = this.generateOutputFilename(inputFile, job, index);
    const outputPath = path.join(job.outputDirectory, outputFilename);

    // Check if output file exists and handle overwrite option
    if (fs.existsSync(outputPath) && !job.exportOptions.overwrite) {
      throw new Error('Output file exists and overwrite is disabled');
    }

    // Process the photo
    const processedBuffer = await this.photoProcessor.processPhoto(inputFile, job.adjustments);
    
    // Export the processed photo
    await this.photoProcessor.exportPhoto(inputFile, outputPath, job.exportOptions);

    console.log(`Processed: ${path.basename(inputFile)} -> ${outputFilename}`);
  }

  // Generate output filename based on options
  private generateOutputFilename(inputFile: string, job: BatchJob, index: number): string {
    const parsed = path.parse(inputFile);
    const extension = job.exportOptions.format === 'jpeg' ? '.jpg' : 
                     job.exportOptions.format === 'png' ? '.png' : 
                     job.exportOptions.format === 'tiff' ? '.tiff' : 
                     parsed.ext;

    let basename = parsed.name;

    // Add prefix if specified
    if (job.exportOptions.fileNaming?.prefix) {
      basename = job.exportOptions.fileNaming.prefix + basename;
    }

    // Add suffix if specified
    if (job.exportOptions.fileNaming?.suffix) {
      basename = basename + job.exportOptions.fileNaming.suffix;
    }

    // Add index if specified
    if (job.exportOptions.fileNaming?.includeIndex) {
      const indexStr = (index + 1).toString().padStart(3, '0');
      basename = `${basename}_${indexStr}`;
    }

    return basename + extension;
  }

  // Get job status
  getJob(jobId: string): BatchJob | undefined {
    return this.activeJobs.get(jobId);
  }

  // Get all jobs
  getAllJobs(): BatchJob[] {
    return Array.from(this.activeJobs.values())
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  // Get jobs by status
  getJobsByStatus(status: BatchJob['status']): BatchJob[] {
    return Array.from(this.activeJobs.values())
      .filter(job => job.status === status)
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  // Cancel a job
  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (!job) return false;

    if (job.status === 'pending') {
      // Remove from queue
      const queueIndex = this.jobQueue.indexOf(jobId);
      if (queueIndex >= 0) {
        this.jobQueue.splice(queueIndex, 1);
      }
      job.status = 'failed';
      job.errors.push('Job cancelled by user');
      return true;
    }

    // Note: We can't cancel jobs that are currently processing
    // This would require more complex implementation with worker threads
    return false;
  }

  // Delete a job
  deleteJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (!job) return false;

    // Can only delete completed or failed jobs
    if (job.status === 'processing' || job.status === 'pending') {
      return false;
    }

    this.activeJobs.delete(jobId);
    return true;
  }

  // Clear completed jobs
  clearCompletedJobs(): number {
    const completedJobs = this.getJobsByStatus('completed');
    let deletedCount = 0;

    completedJobs.forEach(job => {
      if (this.deleteJob(job.id)) {
        deletedCount++;
      }
    });

    return deletedCount;
  }

  // Get processing statistics
  getStatistics() {
    const allJobs = this.getAllJobs();
    const stats = {
      total: allJobs.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      totalFilesProcessed: 0,
      totalFilesQueued: 0,
      totalErrors: 0
    };

    allJobs.forEach(job => {
      stats[job.status]++;
      stats.totalFilesProcessed += job.processedFiles;
      stats.totalFilesQueued += job.totalFiles;
      stats.totalErrors += job.errors.length;
    });

    return stats;
  }

  // Create batch job from preset
  async createBatchJobFromPreset(
    name: string,
    inputFiles: string[],
    outputDirectory: string,
    presetId: string,
    exportOptions: ExportOptions
  ): Promise<BatchJob | null> {
    // This method would need to integrate with PresetManager
    // For now, we'll create with default adjustments
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

    return this.createBatchJob(name, inputFiles, outputDirectory, defaultAdjustments, exportOptions);
  }

  // Set maximum concurrent jobs
  setMaxConcurrentJobs(max: number): void {
    this.maxConcurrentJobs = Math.max(1, Math.min(max, 10)); // Limit between 1-10
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.jobQueue.length,
      isProcessing: this.isProcessing,
      maxConcurrent: this.maxConcurrentJobs,
      activeJobs: this.getJobsByStatus('processing').length
    };
  }
}
