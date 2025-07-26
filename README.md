# PhotoEdit Pro

A professional photo editing application built with Electron and TypeScript, designed to rival Adobe Lightroom with comprehensive RAW processing, advanced image editing, preset management, and batch processing capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-Latest-blue)](https://electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

![PhotoEdit Pro Screenshot](https://via.placeholder.com/800x500/1e1e1e/cccccc?text=PhotoEdit+Pro+Professional+Interface)

## Features

### Professional Image Processing
- **Advanced Adjustment Engine** - 15+ professional controls including exposure, contrast, highlights, shadows, whites, blacks, temperature, tint, vibrance, saturation
- **Sophisticated Algorithms** - Vignette effects, dehaze processing, clarity adjustments, noise reduction, professional sharpening
- **HSL Controls** - Individual color channel adjustments for luminance and saturation (Red, Orange, Yellow, Green, Aqua, Blue, Purple, Magenta)
- **Tone Curves** - Professional-grade tone mapping and color grading
- **Split Toning** - Advanced color grading for highlights and shadows
- **Lens Corrections** - Vignetting, chromatic aberration, and distortion correction

### Comprehensive RAW Processing
- **30+ RAW Formats** - Canon (CR2/CR3), Nikon (NEF), Sony (ARW), Fujifilm (RAF), Olympus (ORF), Panasonic (RW2), and many more
- **Advanced Demosaicing** - Multiple algorithms (AHD, VNG, PPG, AMaZE, DCB) for optimal quality
- **White Balance Control** - Auto, preset, and custom temperature/tint adjustments
- **Camera-Specific Optimization** - Tailored processing settings for different manufacturers
- **Non-Destructive Workflow** - All adjustments preserve original RAW data
- **Professional Color Science** - sRGB, Adobe RGB, ProPhoto RGB color space support

### Professional Preset System
- **7 Built-in Expert Presets**:
  - **Warm Portrait** - Flattering skin tones and warm atmosphere
  - **Vivid Landscape** - Enhanced colors and contrast for nature photography  
  - **Classic B&W** - Timeless black and white conversion
  - **Vintage Film** - Nostalgic film emulation with grain and warmth
  - **Moody Street** - Urban photography with dramatic tones
  - **Modern Bright** - Clean, contemporary look with lifted shadows
  - **Dramatic Art** - High-contrast artistic interpretation
- **Custom Preset Creation** - Save and share your own editing styles
- **Organized Categories** - Presets grouped by photography genre
- **Import/Export Functionality** - Share presets with the community

### Advanced Batch Processing
- **Multi-threaded Processing** - Handle hundreds of photos efficiently with concurrent processing
- **Queue Management** - Real-time progress tracking, error reporting, and job prioritization
- **Flexible File Naming** - Custom prefixes, suffixes, indexing, and naming templates
- **Multiple Export Formats** - JPEG, PNG, TIFF, WebP with quality controls and compression options
- **Resume Capability** - Pause and resume batch jobs as needed

### Smart Photo Library Management
- **Intelligent Import** - Detect and import photos/folders automatically with duplicate detection
- **Comprehensive Metadata** - Read and display EXIF data, camera settings, GPS information
- **Advanced Search & Filter** - Find photos by name, date, camera settings, ISO, aperture
- **Collections System** - Organize photos into custom groups and smart collections
- **Rating System** - 5-star rating system with keyword tagging
- **Thumbnail Generation** - Fast preview generation with multiple size options

### Professional User Interface
- **Lightroom-Inspired Design** - Familiar workflow for professional photographers
- **Dark Theme** - Eye-friendly interface optimized for long editing sessions
- **Responsive Layout** - Adaptive sidebars and resizable panels
- **Real-time Preview** - Instant feedback with before/after comparison
- **Grid and Detail Views** - Switch between library overview and detailed editing
- **Keyboard Shortcuts** - Efficient navigation and editing controls

## Technical Stack

- **Frontend Framework**: Electron + TypeScript
- **Image Processing**: Sharp.js (high-performance image manipulation)
- **RAW Processing**: Custom RAW processor with multiple demosaicing algorithms
- **Database**: SQLite for metadata and library management
- **UI**: HTML5/CSS3 with modern responsive design
- **Build System**: TypeScript compiler with automated asset management

## System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Memory**: 4GB RAM minimum (8GB+ recommended for RAW processing)
- **Storage**: 500MB for installation, additional space for photo library
- **Graphics**: Hardware acceleration supported for better performance

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Git](https://git-scm.com/) (optional, for cloning)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/photoedit-pro.git
cd photoedit-pro

# Install dependencies
npm install

# Start the application
npm run dev
```

**That's it!** PhotoEdit Pro will build and launch automatically.

For detailed installation instructions, see [GETTING_STARTED.md](GETTING_STARTED.md).

## Usage

### Basic Workflow
1. **Import** photos using "Import Photos" or "Import Folder"
2. **Select** a photo from the grid view
3. **Edit** using the adjustment controls in the right sidebar
4. **Apply** presets for quick styling
5. **Export** your finished photo

### Advanced Features
- **Batch Processing**: Select multiple photos and apply identical adjustments
- **Custom Presets**: Save your editing style as reusable presets
- **RAW Processing**: Professional RAW file processing with camera-specific optimization
- **Collections**: Organize photos into projects and categories

### Keyboard Shortcuts
- `Space` - Toggle between grid and detail view
- `R` - Reset all adjustments
- `Ctrl/Cmd + I` - Import photos
- `Ctrl/Cmd + E` - Export photo
- `←/→` - Navigate between photos

## Project Structure

```
photoedit-pro/
├── src/
│   ├── main/                   # Electron main process
│   │   └── main.ts            # Application entry point
│   ├── renderer/              # Frontend interface
│   │   ├── index.html         # Main UI layout
│   │   ├── styles.css         # Lightroom-inspired styling  
│   │   ├── renderer.js        # UI logic and controls
│   │   └── preload.ts         # Secure IPC bridge
│   └── shared/                # Core business logic
│       ├── PhotoProcessor.ts   # Main image processing engine
│       ├── RawProcessor.ts     # RAW file processing
│       ├── PresetManager.ts    # Preset system management
│       ├── BatchProcessor.ts   # Batch operations engine
│       ├── PhotoLibrary.ts     # Photo library management
│       └── types.ts           # TypeScript interfaces
├── dist/                      # Compiled output
├── package.json              # Project configuration
├── tsconfig.json            # TypeScript configuration
├── GETTING_STARTED.md       # Detailed setup guide
└── README.md               # This file
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start in development mode with hot reload
npm run build           # Build for production
npm run build:dev       # Build with source maps for debugging
npm run clean           # Clean build files

# Production
npm start               # Run the built application
npm run pack            # Package app for current platform
npm run dist:win        # Build Windows installer (.exe)
npm run dist:mac        # Build macOS installer (.dmg)
npm run dist:linux      # Build Linux package (.AppImage)

# Testing
node test-features.js   # Run comprehensive feature tests
```

### Building from Source

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/YOUR_USERNAME/photoedit-pro.git
   cd photoedit-pro
   npm install
   ```

2. **Development mode** (with auto-reload)
   ```bash
   npm run dev
   ```

3. **Production build**
   ```bash
   npm run build
   npm start
   ```

4. **Create installer**
   ```bash
   npm run dist:win    # Windows
   npm run dist:mac    # macOS
   npm run dist:linux  # Linux
   ```

## Contributing

We welcome contributions from photographers, developers, and designers!

### Ways to Contribute
- **Bug Reports** - Help us find and fix issues
- **Feature Requests** - Suggest new functionality
- **Presets** - Create and share editing presets
- **Code** - Implement new features or improvements
- **Documentation** - Improve guides and tutorials
- **Testing** - Help test new features and releases

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with clear commit messages
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Submit a pull request with a detailed description

### Code Style
- Use TypeScript for all new code
- Follow existing code formatting and patterns
- Add JSDoc comments for public APIs
- Write tests for new functionality
- Update documentation as needed

## Roadmap

### Version 2.0 (Q3 2025)
- [ ] AI-powered auto-adjustments and smart presets
- [ ] Advanced masking and selection tools
- [ ] Plugin system for third-party extensions
- [ ] Cloud sync and team collaboration
- [ ] Mobile companion app for remote editing

### Version 2.1 (Q4 2025)
- [ ] Video editing capabilities for clips and timelapses
- [ ] HDR merge and panorama stitching
- [ ] Advanced AI noise reduction
- [ ] Performance optimizations for 4K+ images
- [ ] Professional printing workflow

### Version 3.0 (Q1 2026)
- [ ] Machine learning-based editing suggestions
- [ ] Advanced color grading with LUTs
- [ ] Enterprise features and team management
- [ ] API for third-party integrations
- [ ] Advanced batch operations with conditional logic

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Adobe Lightroom** - Inspiration for the professional workflow and interface design
- **Sharp.js** - Incredible high-performance image processing library
- **Electron** - Making cross-platform desktop applications accessible
- **Open Source Community** - For the amazing tools and libraries that made this possible
- **Photography Community** - For feedback, feature requests, and preset contributions

## Support & Community

### Getting Help
- **Documentation**: Start with [GETTING_STARTED.md](GETTING_STARTED.md)
- **Bug Reports**: [GitHub Issues](https://github.com/YOUR_USERNAME/photoedit-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/photoedit-pro/discussions)
- **Email**: support@photoedit-pro.com

### Professional Services
- **Training**: Custom training sessions for teams
- **Consulting**: Implementation and workflow consulting
- **Enterprise**: Volume licensing and priority support
- **Custom Development**: Feature development for specific needs

---

<div align="center">

**PhotoEdit Pro** - Professional photo editing that doesn't break the bank.

*Made with love by photographers, for photographers.*

[Star this project](https://github.com/YOUR_USERNAME/photoedit-pro) | [Fork it](https://github.com/YOUR_USERNAME/photoedit-pro/fork) | [Share it](https://twitter.com/intent/tweet?text=Check%20out%20PhotoEdit%20Pro%20-%20Professional%20photo%20editing%20software!)

</div>
