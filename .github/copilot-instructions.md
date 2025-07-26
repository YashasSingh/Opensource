<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# PhotoEdit Pro - Copilot Instructions

This is a professional photo editing application similar to Adobe Lightroom, built with Electron and TypeScript.

## Project Overview

PhotoEdit Pro is a comprehensive photo editing and management application that provides:

- **RAW and JPEG photo processing** using Sharp image processing library
- **Photo library management** with import, organization, and metadata handling
- **Professional editing tools** including exposure, contrast, color grading, and detail adjustments
- **Lightroom-inspired dark UI** with grid and loupe view modes
- **Export functionality** with multiple formats and quality settings
- **Metadata and EXIF data handling** for professional workflow

## Architecture

- **Main Process** (`src/main/`): Electron main process handling window management, file operations, and IPC
- **Renderer Process** (`src/renderer/`): Frontend UI built with HTML, CSS, and vanilla JavaScript
- **Shared Code** (`src/shared/`): TypeScript modules for photo processing and library management
- **Types** (`src/shared/types.ts`): TypeScript type definitions for the entire application

## Key Technologies

- **Electron**: Cross-platform desktop application framework
- **TypeScript**: Type-safe JavaScript development
- **Sharp**: High-performance image processing library
- **exifr**: EXIF metadata extraction
- **electron-store**: Persistent data storage

## Development Guidelines

When working with this codebase:

1. **Photo Processing**: Use Sharp library for all image manipulations
2. **UI Patterns**: Follow the Lightroom-inspired dark theme and layout patterns
3. **Type Safety**: Maintain strict TypeScript typing throughout
4. **Performance**: Consider memory usage when processing large images
5. **Error Handling**: Implement robust error handling for file operations
6. **Async Operations**: Use proper async/await patterns for file I/O

## Common Tasks

- **Adding new adjustments**: Update `PhotoAdjustments` interface and implement in `PhotoProcessor`
- **UI modifications**: Update HTML structure, CSS styles, and JavaScript event handlers
- **New export formats**: Extend `ExportOptions` and implement in Sharp processing pipeline
- **Library features**: Extend `PhotoLibrary` class for new organization features

## File Structure

```
src/
├── main/           # Electron main process
│   └── main.ts     # Application entry point
├── renderer/       # Frontend application
│   ├── index.html  # Main UI structure
│   ├── styles.css  # Lightroom-inspired styling
│   ├── renderer.js # UI logic and interactions
│   └── preload.ts  # Secure IPC bridge
└── shared/         # Shared business logic
    ├── PhotoLibrary.ts     # Photo collection management
    ├── PhotoProcessor.ts   # Image processing engine
    └── types.ts           # TypeScript definitions
```

## Best Practices

- Use the existing adjustment pipeline when adding new photo effects
- Maintain the professional UI patterns established in the design
- Follow the IPC patterns for secure main-renderer communication
- Consider performance implications of image processing operations
- Implement proper error boundaries for file operations
