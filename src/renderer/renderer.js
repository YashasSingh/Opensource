// PhotoEdit Pro - Renderer Process
class PhotoEditApp {
    constructor() {
        this.photos = [];
        this.selectedPhoto = null;
        this.currentView = 'grid';
        this.currentFilter = 'all';
        this.adjustments = this.getDefaultAdjustments();
        this.thumbnailSize = 200;
        this.presets = [];
        this.showPresets = false;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupAdjustmentControls();
        await this.loadPhotos();
        await this.loadPresets();
        this.updateUI();
    }

    setupEventListeners() {
        // Window controls
        document.getElementById('minimize-btn').addEventListener('click', () => {
            window.electronAPI.windowMinimize();
        });

        document.getElementById('maximize-btn').addEventListener('click', () => {
            window.electronAPI.windowMaximize();
        });

        document.getElementById('close-btn').addEventListener('click', () => {
            window.electronAPI.windowClose();
        });

        // Import controls
        document.getElementById('import-photos').addEventListener('click', () => {
            this.importPhotos();
        });

        document.getElementById('import-folder').addEventListener('click', () => {
            this.importFolder();
        });

        document.getElementById('empty-import-btn').addEventListener('click', () => {
            this.importPhotos();
        });

        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Filter controls
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Collection controls
        document.querySelectorAll('.collection-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectCollection(e.target.dataset.collection);
            });
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchPhotos(e.target.value);
        });

        // Thumbnail size
        document.getElementById('thumbnail-size').addEventListener('input', (e) => {
            this.setThumbnailSize(parseInt(e.target.value));
        });

        // Rating
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                this.setRating(parseInt(e.target.dataset.rating));
            });
        });

        // Keywords
        document.getElementById('keyword-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addKeyword(e.target.value.trim());
                e.target.value = '';
            }
        });

        // Export
        document.getElementById('export-photo').addEventListener('click', () => {
            this.exportPhoto();
        });

        // Preset controls
        document.getElementById('toggle-presets').addEventListener('click', () => {
            this.togglePresets();
        });

        document.getElementById('save-preset-btn').addEventListener('click', () => {
            this.showSavePresetDialog();
        });

        // Reset
        document.getElementById('reset-all').addEventListener('click', () => {
            this.resetAdjustments();
        });

        // Loupe controls
        document.getElementById('loupe-prev').addEventListener('click', () => {
            this.navigatePhoto(-1);
        });

        document.getElementById('loupe-next').addEventListener('click', () => {
            this.navigatePhoto(1);
        });

        document.getElementById('loupe-fit').addEventListener('click', () => {
            this.fitLoupeImage();
        });

        document.getElementById('loupe-100').addEventListener('click', () => {
            this.setLoupeImageScale(1);
        });

        // Listen for photo imports
        window.electronAPI.onPhotosImported((filePaths) => {
            this.handlePhotosImported(filePaths);
        });

        // Listen for export requests
        window.electronAPI.onExportRequested(() => {
            this.exportPhoto();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    setupAdjustmentControls() {
        const adjustmentSliders = document.querySelectorAll('.adjustment-slider');
        
        adjustmentSliders.forEach(slider => {
            const valueSpan = slider.parentElement.querySelector('.adjustment-value');
            
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                valueSpan.textContent = value;
                this.updateAdjustment(slider.id, value);
            });

            // Double-click to reset
            slider.addEventListener('dblclick', (e) => {
                e.target.value = 0;
                valueSpan.textContent = '0';
                this.updateAdjustment(slider.id, 0);
            });
        });
    }

    async loadPhotos() {
        try {
            this.photos = await window.electronAPI.getPhotos();
            this.renderPhotoGrid();
            this.updateLibraryStats();
        } catch (error) {
            console.error('Error loading photos:', error);
        }
    }

    async loadPresets() {
        try {
            const response = await window.electronAPI.getPresets();
            if (response.success) {
                this.presets = response.presets;
                this.renderPresets();
            }
        } catch (error) {
            console.error('Error loading presets:', error);
        }
    }

    async importPhotos() {
        try {
            const importedPaths = await window.electronAPI.importPhotos();
            if (importedPaths.length > 0) {
                console.log(`Imported ${importedPaths.length} photos`);
            }
        } catch (error) {
            console.error('Error importing photos:', error);
        }
    }

    async importFolder() {
        try {
            const importedPaths = await window.electronAPI.importFolder();
            if (importedPaths.length > 0) {
                console.log(`Imported ${importedPaths.length} photos from folder`);
            }
        } catch (error) {
            console.error('Error importing folder:', error);
        }
    }

    handlePhotosImported(filePaths) {
        console.log('Photos imported:', filePaths);
        this.loadPhotos(); // Reload the photo grid
    }

    renderPhotoGrid() {
        const grid = document.getElementById('photo-grid');
        const emptyState = document.getElementById('empty-state');

        if (this.photos.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        // Filter photos based on current filter
        const filteredPhotos = this.getFilteredPhotos();

        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${this.thumbnailSize}px, 1fr))`;

        filteredPhotos.forEach(photo => {
            const photoElement = this.createPhotoElement(photo);
            grid.appendChild(photoElement);
        });
    }

    createPhotoElement(photo) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.dataset.photoId = photo.id;

        // Create thumbnail URL from file path
        const thumbnailUrl = `file://${photo.filePath}`;

        photoItem.innerHTML = `
            <img class="photo-thumbnail" src="${thumbnailUrl}" alt="${photo.fileName}" 
                 loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNDA0MDQwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzk5OTk5OSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkVycm9yPC90ZXh0Pgo8L3N2Zz4='">
            <div class="photo-overlay">
                <div class="photo-name">${photo.fileName}</div>
                <div class="photo-info-overlay">${this.formatFileSize(photo.fileSize)}</div>
            </div>
        `;

        photoItem.addEventListener('click', () => {
            this.selectPhoto(photo);
        });

        photoItem.addEventListener('dblclick', () => {
            if (this.currentView === 'grid') {
                this.switchView('loupe');
            }
        });

        return photoItem;
    }

    selectPhoto(photo) {
        // Remove previous selection
        document.querySelectorAll('.photo-item.selected').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to current photo
        const photoElement = document.querySelector(`[data-photo-id="${photo.id}"]`);
        if (photoElement) {
            photoElement.classList.add('selected');
        }

        this.selectedPhoto = photo;
        this.loadPhotoInfo(photo);
        this.loadPhotoAdjustments(photo);
        
        if (this.currentView === 'loupe') {
            this.updateLoupeView();
        }
    }

    async loadPhotoInfo(photo) {
        const filenameElement = document.getElementById('photo-filename');
        const dimensionsElement = document.getElementById('photo-dimensions');
        const cameraElement = document.getElementById('photo-camera');
        const settingsElement = document.getElementById('photo-settings');

        filenameElement.textContent = photo.fileName;

        try {
            const metadata = await window.electronAPI.getPhotoMetadata(photo.filePath);
            
            if (metadata) {
                dimensionsElement.textContent = `${metadata.width || '?'} × ${metadata.height || '?'}`;
                cameraElement.textContent = metadata.Make && metadata.Model 
                    ? `${metadata.Make} ${metadata.Model}` 
                    : 'Unknown';
                
                const settings = [];
                if (metadata.FocalLength) settings.push(`${metadata.FocalLength}mm`);
                if (metadata.FNumber) settings.push(`f/${metadata.FNumber}`);
                if (metadata.ExposureTime) settings.push(`${metadata.ExposureTime}s`);
                if (metadata.ISO) settings.push(`ISO ${metadata.ISO}`);
                
                settingsElement.textContent = settings.length > 0 ? settings.join(' • ') : '-';
            }
        } catch (error) {
            console.error('Error loading photo metadata:', error);
            dimensionsElement.textContent = '-';
            cameraElement.textContent = '-';
            settingsElement.textContent = '-';
        }

        // Update rating display
        this.updateRatingDisplay(photo.rating);
    }

    loadPhotoAdjustments(photo) {
        this.adjustments = { ...photo.adjustments };
        this.updateAdjustmentUI();
    }

    updateAdjustmentUI() {
        Object.keys(this.adjustments).forEach(key => {
            const slider = document.getElementById(key);
            if (slider && typeof this.adjustments[key] === 'number') {
                slider.value = this.adjustments[key];
                const valueSpan = slider.parentElement.querySelector('.adjustment-value');
                if (valueSpan) {
                    valueSpan.textContent = this.adjustments[key];
                }
            }
        });
    }

    updateAdjustment(adjustmentKey, value) {
        if (this.selectedPhoto) {
            this.adjustments[adjustmentKey] = value;
            // In a real app, you'd debounce this call
            this.applyAdjustments();
        }
    }

    async applyAdjustments() {
        if (!this.selectedPhoto) return;

        try {
            // Apply adjustments to the photo (this would update the display)
            const processedBuffer = await window.electronAPI.processPhoto(
                this.selectedPhoto.filePath, 
                this.adjustments
            );
            
            // Update the preview (in a real app, you'd convert buffer to displayable format)
            console.log('Adjustments applied');
        } catch (error) {
            console.error('Error applying adjustments:', error);
        }
    }

    resetAdjustments() {
        this.adjustments = this.getDefaultAdjustments();
        this.updateAdjustmentUI();
        this.applyAdjustments();
    }

    getDefaultAdjustments() {
        return {
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
            'noise-reduction': 0,
            clarity: 0,
            dehaze: 0,
            vignette: 0
        };
    }

    switchView(view) {
        this.currentView = view;
        
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        const photoGrid = document.getElementById('photo-grid');
        const loupeView = document.getElementById('loupe-view');

        if (view === 'grid') {
            photoGrid.style.display = 'grid';
            loupeView.classList.add('hidden');
        } else if (view === 'loupe') {
            photoGrid.style.display = 'none';
            loupeView.classList.remove('hidden');
            this.updateLoupeView();
        }
    }

    updateLoupeView() {
        if (!this.selectedPhoto) return;

        const loupeImage = document.getElementById('loupe-image');
        loupeImage.src = `file://${this.selectedPhoto.filePath}`;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderPhotoGrid();
    }

    getFilteredPhotos() {
        let filtered = [...this.photos];

        switch (this.currentFilter) {
            case 'raw':
                filtered = filtered.filter(photo => this.isRawFile(photo.fileName));
                break;
            case 'jpeg':
                filtered = filtered.filter(photo => this.isJpegFile(photo.fileName));
                break;
            case 'edited':
                filtered = filtered.filter(photo => this.hasAdjustments(photo.adjustments));
                break;
            default:
                // 'all' - no filtering
                break;
        }

        return filtered;
    }

    isRawFile(filename) {
        const rawExtensions = ['.raw', '.cr2', '.nef', '.arw', '.dng', '.orf', '.rw2', '.pef', '.srw'];
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return rawExtensions.includes(ext);
    }

    isJpegFile(filename) {
        const jpegExtensions = ['.jpg', '.jpeg'];
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return jpegExtensions.includes(ext);
    }

    hasAdjustments(adjustments) {
        const defaults = this.getDefaultAdjustments();
        return Object.keys(adjustments).some(key => adjustments[key] !== defaults[key]);
    }

    searchPhotos(query) {
        if (!query.trim()) {
            this.renderPhotoGrid();
            return;
        }

        const filteredPhotos = this.photos.filter(photo =>
            photo.fileName.toLowerCase().includes(query.toLowerCase()) ||
            photo.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        this.renderFilteredPhotos(filteredPhotos);
    }

    renderFilteredPhotos(photos) {
        const grid = document.getElementById('photo-grid');
        grid.innerHTML = '';

        photos.forEach(photo => {
            const photoElement = this.createPhotoElement(photo);
            grid.appendChild(photoElement);
        });
    }

    setThumbnailSize(size) {
        this.thumbnailSize = size;
        document.querySelector('.zoom-label').textContent = `${size}px`;
        this.renderPhotoGrid();
    }

    setRating(rating) {
        if (!this.selectedPhoto) return;

        this.selectedPhoto.rating = rating;
        this.updateRatingDisplay(rating);
        
        // In a real app, you'd save this to the backend
        console.log(`Set rating ${rating} for ${this.selectedPhoto.fileName}`);
    }

    updateRatingDisplay(rating) {
        document.querySelectorAll('.star').forEach((star, index) => {
            star.classList.toggle('active', index < rating);
            star.textContent = index < rating ? '★' : '☆';
        });
    }

    addKeyword(keyword) {
        if (!keyword || !this.selectedPhoto) return;

        if (!this.selectedPhoto.tags.includes(keyword)) {
            this.selectedPhoto.tags.push(keyword);
            this.updateKeywordsDisplay();
            
            // In a real app, you'd save this to the backend
            console.log(`Added keyword "${keyword}" to ${this.selectedPhoto.fileName}`);
        }
    }

    updateKeywordsDisplay() {
        const keywordsList = document.getElementById('keywords-list');
        keywordsList.innerHTML = '';

        if (this.selectedPhoto) {
            this.selectedPhoto.tags.forEach(tag => {
                const tagElement = document.createElement('div');
                tagElement.className = 'keyword-tag';
                tagElement.innerHTML = `
                    ${tag}
                    <span class="keyword-remove" data-keyword="${tag}">×</span>
                `;

                tagElement.querySelector('.keyword-remove').addEventListener('click', () => {
                    this.removeKeyword(tag);
                });

                keywordsList.appendChild(tagElement);
            });
        }
    }

    removeKeyword(keyword) {
        if (!this.selectedPhoto) return;

        const index = this.selectedPhoto.tags.indexOf(keyword);
        if (index > -1) {
            this.selectedPhoto.tags.splice(index, 1);
            this.updateKeywordsDisplay();
            
            // In a real app, you'd save this to the backend
            console.log(`Removed keyword "${keyword}" from ${this.selectedPhoto.fileName}`);
        }
    }

    async exportPhoto() {
        if (!this.selectedPhoto) {
            alert('Please select a photo to export');
            return;
        }

        try {
            // In a real app, you'd show an export dialog
            const exportOptions = {
                format: 'jpeg',
                quality: 90,
                width: undefined,
                height: undefined
            };

            // For demo, we'll just log the export
            console.log('Exporting photo:', this.selectedPhoto.fileName);
            console.log('Export options:', exportOptions);
            console.log('Adjustments:', this.adjustments);

            // const success = await window.electronAPI.exportPhoto(
            //     this.selectedPhoto.filePath,
            //     outputPath,
            //     exportOptions
            // );

            alert('Export functionality would be implemented here');
        } catch (error) {
            console.error('Error exporting photo:', error);
            alert('Error exporting photo');
        }
    }

    navigatePhoto(direction) {
        if (!this.selectedPhoto) return;

        const currentIndex = this.photos.findIndex(photo => photo.id === this.selectedPhoto.id);
        const newIndex = currentIndex + direction;

        if (newIndex >= 0 && newIndex < this.photos.length) {
            this.selectPhoto(this.photos[newIndex]);
        }
    }

    fitLoupeImage() {
        const loupeImage = document.getElementById('loupe-image');
        loupeImage.style.maxWidth = '100%';
        loupeImage.style.maxHeight = '100%';
        loupeImage.style.transform = 'scale(1)';
    }

    setLoupeImageScale(scale) {
        const loupeImage = document.getElementById('loupe-image');
        loupeImage.style.transform = `scale(${scale})`;
    }

    selectCollection(collection) {
        // Update collection selection
        document.querySelectorAll('.collection-item').forEach(item => {
            item.classList.toggle('active', item.dataset.collection === collection);
        });

        // Filter photos by collection
        switch (collection) {
            case 'all':
                this.renderPhotoGrid();
                break;
            case 'favorites':
                const favorites = this.photos.filter(photo => photo.rating >= 4);
                this.renderFilteredPhotos(favorites);
                break;
            case 'recent':
                const recent = this.photos
                    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
                    .slice(0, 50);
                this.renderFilteredPhotos(recent);
                break;
        }
    }

    updateLibraryStats() {
        document.getElementById('photo-count').textContent = this.photos.length;
        document.getElementById('all-photos-count').textContent = this.photos.length;
    }

    handleKeyboard(e) {
        // ESC - Exit loupe view
        if (e.key === 'Escape' && this.currentView === 'loupe') {
            this.switchView('grid');
        }

        // Space - Toggle between grid and loupe
        if (e.key === ' ' && this.selectedPhoto) {
            e.preventDefault();
            this.switchView(this.currentView === 'grid' ? 'loupe' : 'grid');
        }

        // Arrow keys - Navigate photos
        if (e.key === 'ArrowLeft') {
            this.navigatePhoto(-1);
        }
        if (e.key === 'ArrowRight') {
            this.navigatePhoto(1);
        }

        // Number keys - Set rating
        if (e.key >= '0' && e.key <= '5') {
            this.setRating(parseInt(e.key));
        }

        // R - Reset adjustments
        if (e.key === 'r' || e.key === 'R') {
            this.resetAdjustments();
        }
    }

    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    // Preset Management Methods
    togglePresets() {
        this.showPresets = !this.showPresets;
        const presetsPanel = document.getElementById('presets-panel');
        const toggleBtn = document.getElementById('toggle-presets');
        
        if (this.showPresets) {
            presetsPanel.style.display = 'block';
            toggleBtn.textContent = 'Hide Presets';
            this.renderPresets();
        } else {
            presetsPanel.style.display = 'none';
            toggleBtn.textContent = 'Show Presets';
        }
    }

    renderPresets() {
        const container = document.getElementById('presets-grid');
        if (!container) return;

        container.innerHTML = '';

        const categories = [...new Set(this.presets.map(p => p.category))];
        
        categories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.className = 'preset-category';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categorySection.appendChild(categoryTitle);

            const categoryPresets = this.presets.filter(p => p.category === category);
            categoryPresets.forEach(preset => {
                const presetCard = document.createElement('div');
                presetCard.className = 'preset-card';
                presetCard.innerHTML = `
                    <div class="preset-preview"></div>
                    <h5>${preset.name}</h5>
                    <p>${preset.description}</p>
                `;

                presetCard.addEventListener('click', () => {
                    this.applyPreset(preset.id);
                });

                categorySection.appendChild(presetCard);
            });

            container.appendChild(categorySection);
        });
    }

    async applyPreset(presetId) {
        if (!this.selectedPhoto) {
            console.log('No photo selected for preset application');
            return;
        }

        try {
            const response = await window.electronAPI.applyPreset(this.selectedPhoto.path, presetId);
            if (response.success) {
                // Update the preview
                this.updatePreview();
                console.log('Preset applied successfully');
            } else {
                console.error('Failed to apply preset:', response.error);
            }
        } catch (error) {
            console.error('Error applying preset:', error);
        }
    }

    showSavePresetDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'preset-dialog-overlay';
        dialog.innerHTML = `
            <div class="preset-dialog">
                <h3>Save Preset</h3>
                <form id="save-preset-form">
                    <div class="form-group">
                        <label for="preset-name">Name:</label>
                        <input type="text" id="preset-name" required>
                    </div>
                    <div class="form-group">
                        <label for="preset-description">Description:</label>
                        <textarea id="preset-description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="preset-category">Category:</label>
                        <select id="preset-category" required>
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                            <option value="street">Street</option>
                            <option value="black-white">Black & White</option>
                            <option value="vintage">Vintage</option>
                            <option value="modern">Modern</option>
                            <option value="artistic">Artistic</option>
                        </select>
                    </div>
                    <div class="form-buttons">
                        <button type="button" id="cancel-preset">Cancel</button>
                        <button type="submit">Save Preset</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(dialog);

        document.getElementById('cancel-preset').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        document.getElementById('save-preset-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('preset-name').value;
            const description = document.getElementById('preset-description').value;
            const category = document.getElementById('preset-category').value;

            try {
                const response = await window.electronAPI.savePreset(name, description, category, this.adjustments);
                if (response.success) {
                    console.log('Preset saved successfully');
                    await this.loadPresets(); // Reload presets
                    document.body.removeChild(dialog);
                } else {
                    console.error('Failed to save preset:', response.error);
                }
            } catch (error) {
                console.error('Error saving preset:', error);
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoEditApp();
});
