# Getting Started with PhotoEdit Pro

Welcome to PhotoEdit Pro! This guide will help you download, install, and run the application on your own laptop.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

### Required Software
- **Node.js** (version 16 or higher)
  - Download from: https://nodejs.org/
  - Choose the LTS (Long Term Support) version
  - Verify installation: `node --version` and `npm --version`

- **Git** (for cloning the repository)
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

### System Requirements
- **Windows**: Windows 10 or later (64-bit)
- **macOS**: macOS 10.14 (Mojave) or later
- **Linux**: Ubuntu 18.04, Fedora 32, Debian 10, or equivalent
- **RAM**: Minimum 4GB (8GB+ recommended for large photo processing)
- **Storage**: At least 500MB free space for installation

## Quick Start (5 Minutes)

### Step 1: Download PhotoEdit Pro

**Option A: Clone from GitHub**
```bash
git clone https://github.com/YashasSingh/Opensource
cd photoedit-pro
```

**Option B: Download ZIP**
1. Go to the GitHub repository
2. Click the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file to your desired location
5. Open terminal/command prompt in the extracted folder

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install
```

This will download and install all necessary dependencies including:
- Electron (desktop app framework)
- Sharp (image processing library)
- TypeScript (programming language)
- And other required packages

### Step 3: Run PhotoEdit Pro

```bash
# Start the application in development mode
npm run dev
```

The application will:
1. Build the TypeScript code
2. Copy necessary files
3. Launch PhotoEdit Pro in a desktop window

**That's it! PhotoEdit Pro should now be running on your laptop.**

## Detailed Installation Guide

### For Windows Users

1. **Install Node.js**
   - Download the Windows installer from nodejs.org
   - Run the installer and follow the setup wizard
   - Choose "Add to PATH" when prompted
   - Restart your computer after installation

2. **Install Git** (optional but recommended)
   - Download Git for Windows from git-scm.com
   - Use default settings during installation

3. **Open Command Prompt or PowerShell**
   - Press `Win + R`, type `cmd`, press Enter
   - Or search for "PowerShell" in the Start menu

4. **Clone and Run**
   ```cmd
   git clone https://github.com/YashasSingh/Opensource
   cd photoedit-pro
   npm install
   npm run dev
   ```

### For macOS Users

1. **Install Node.js**
   - Download the macOS installer from nodejs.org
   - Open the downloaded .pkg file and follow instructions

2. **Install Git** (if not already installed)
   - Git comes pre-installed on most macOS versions
   - Or install via Homebrew: `brew install git`

3. **Open Terminal**
   - Press `Cmd + Space`, type "Terminal", press Enter

4. **Clone and Run**
   ```bash
   git clone https://github.com/YashasSingh/Opensource
   cd photoedit-pro
   npm install
   npm run dev
   ```

### For Linux Users (Ubuntu/Debian)

1. **Update Package Manager**
   ```bash
   sudo apt update
   ```

2. **Install Node.js and npm**
   ```bash
   # Install Node.js 18.x
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install Git**
   ```bash
   sudo apt install git
   ```

4. **Clone and Run**
   ```bash
   git clone https://github.com/YashasSingh/Opensource
   cd photoedit-pro
   npm install
   npm run dev
   ```

## First Steps After Installation

### 1. Import Your First Photos
- Click "Import Photos" or "Import Folder" in the sidebar
- Select some photos from your computer (JPEG, PNG, or RAW files)
- Your photos will appear in the grid view

### 2. Edit Your First Photo
- Click on any photo to select it
- Use the adjustment controls in the right sidebar:
  - **Exposure**: Brighten or darken the image
  - **Contrast**: Adjust the difference between lights and darks
  - **Temperature**: Make the image warmer (yellow) or cooler (blue)
  - **Vibrance**: Enhance colors naturally

### 3. Try Built-in Presets
- Click "Show Presets" to reveal the preset panel
- Try presets like "Warm Portrait" or "Vivid Landscape"
- Click any preset to apply it instantly

### 4. Export Your Edited Photo
- Click "Export" when you're happy with your edits
- Choose the format (JPEG, PNG, TIFF) and quality
- Save your masterpiece!

## Available Commands

```bash
# Development
npm run dev              # Start app in development mode
npm run build           # Build for production
npm run clean           # Clean build files

# Production
npm start               # Run built application
npm run pack            # Package app for current platform
npm run dist:win        # Build Windows installer
npm run dist:mac        # Build macOS installer  
npm run dist:linux      # Build Linux installer

# Testing
node test-features.js   # Run feature tests
```

## Understanding the Interface

### Main Areas
1. **Left Sidebar**: Photo library, import controls, collections
2. **Center Panel**: Photo grid view and main preview
3. **Right Sidebar**: Editing controls and adjustments
4. **Top Bar**: Application controls and menu

### Editing Controls
- **Basic Panel**: Exposure, Contrast, Highlights, Shadows
- **Color Panel**: Temperature, Tint, Vibrance, Saturation
- **Detail Panel**: Sharpening, Noise Reduction, Clarity
- **Effects Panel**: Vignette, Dehaze

### Keyboard Shortcuts
- `Space`: Toggle between grid and detail view
- `R`: Reset all adjustments
- `Ctrl/Cmd + I`: Import photos
- `Ctrl/Cmd + E`: Export photo

## Troubleshooting

### Common Issues

**Problem**: "node is not recognized as an internal or external command"
**Solution**: Node.js is not installed or not in PATH. Reinstall Node.js and restart terminal.

**Problem**: "npm install" fails with permission errors
**Solution**: 
- Windows: Run Command Prompt as Administrator
- macOS/Linux: Don't use `sudo` with npm. Fix permissions: `sudo chown -R $(whoami) ~/.npm`

**Problem**: Application window is blank or won't start
**Solution**: 
1. Try `npm run clean` then `npm run dev`
2. Check if antivirus is blocking Electron
3. Ensure you have sufficient RAM (4GB+)

**Problem**: Photos won't import or display
**Solution**:
1. Ensure photos are in supported formats (JPEG, PNG, TIFF, RAW)
2. Check file permissions
3. Try smaller image files first

**Problem**: RAW files not processing correctly
**Solution**: 
- RAW support is basic in this version
- Convert RAW to TIFF/JPEG first for best results
- Ensure you have sufficient RAM for large RAW files

### Performance Tips

1. **For Large Photo Libraries**:
   - Import photos in smaller batches
   - Use preview mode for faster browsing
   - Close other memory-intensive applications

2. **For Faster Processing**:
   - Use smaller preview sizes for editing
   - Process photos in batches during off-hours
   - Ensure SSD storage for better performance

3. **Memory Management**:
   - Restart the app if it becomes slow
   - Close unused photos in the editor
   - Use the lowest quality preview that works for your editing

## Getting Help

### Documentation
- Check the main README.md for feature details
- Browse the source code comments for technical info
- Look at example photos in the test suite

### Community Support
- Create an issue on GitHub for bugs
- Start a discussion for feature requests
- Share your presets and tips with others

### Reporting Issues
When reporting problems, please include:
- Your operating system and version
- Node.js version (`node --version`)
- Steps to reproduce the issue
- Screenshots if applicable
- Error messages from the console

## What's Next?

Once you have PhotoEdit Pro running:

1. **Explore Advanced Features**:
   - Try batch processing multiple photos
   - Create custom presets for your style
   - Experiment with RAW file processing

2. **Customize Your Workflow**:
   - Set up collections for different projects
   - Create export presets for different uses
   - Learn keyboard shortcuts for efficiency

3. **Share and Contribute**:
   - Share your custom presets
   - Report bugs and suggest improvements
   - Contribute code if you're a developer

**Welcome to professional photo editing with PhotoEdit Pro!**

---

Need more help? Open an issue on GitHub or check the main README.md for detailed feature documentation.
