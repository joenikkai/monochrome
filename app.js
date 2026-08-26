/**
 * Main Application Controller
 * Manages UI interactions, state, and processing workflow
 */
class ColorStudioApp {
    constructor() {
        this.state = {
            originalImage: null,
            currentScheme: 'monochrome',
            baseColor: '#336699',
            intensity: 70,
            isProcessing: false
        };

        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.elements = {
            uploadSection: document.getElementById('upload-section'),
            processingControls: document.getElementById('processing-controls'),
            fileInput: document.getElementById('image-input'),
            dropZone: document.getElementById('drop-zone'),
            previewContainer: document.getElementById('preview-container'),
            imagePreview: document.getElementById('image-preview'),
            removeImage: document.getElementById('remove-image'),
            baseColor: document.getElementById('base-color'),
            hexInput: document.getElementById('hex-input'),
            schemeButtons: document.querySelectorAll('.scheme-btn'),
            intensity: document.getElementById('intensity'),
            intensityValue: document.getElementById('intensity-value'),
            processBtn: document.getElementById('process-btn'),
            resultSection: document.getElementById('processing-result')
        };
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // File upload events
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.elements.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.elements.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        this.elements.removeImage.addEventListener('click', () => this.removeImage());

        // Color picker events
        this.elements.baseColor.addEventListener('input', (e) => this.updateBaseColor(e.target.value));
        this.elements.hexInput.addEventListener('input', (e) => this.updateHexInput(e.target.value));
        this.elements.hexInput.addEventListener('blur', (e) => this.validateHexInput(e.target.value));

        // Scheme button events
        this.elements.schemeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectScheme(e.target.dataset.scheme));
        });

        // Intensity slider
        this.elements.intensity.addEventListener('input', (e) => this.updateIntensity(e.target.value));

        // Process button
        this.elements.processBtn.addEventListener('click', () => this.processImage());
    }

    /**
     * Handle file upload from input
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const img = await ImageProcessor.loadImage(file);
            this.state.originalImage = img;
            this.showPreview(img);
            this.showProcessingControls();
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Handle drag over event
     */
    handleDragOver(event) {
        event.preventDefault();
        this.elements.dropZone.classList.add('dragover');
    }

    /**
     * Handle drag leave event
     */
    handleDragLeave(event) {
        event.preventDefault();
        this.elements.dropZone.classList.remove('dragover');
    }

    /**
     * Handle drop event
     */
    async handleDrop(event) {
        event.preventDefault();
        this.elements.dropZone.classList.remove('dragover');
        
        const file = event.dataTransfer.files[0];
        if (!file) return;

        try {
            const img = await ImageProcessor.loadImage(file);
            this.state.originalImage = img;
            this.showPreview(img);
            this.showProcessingControls();
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Show image preview
     */
    showPreview(img) {
        this.elements.imagePreview.src = img.src;
        this.elements.previewContainer.style.display = 'block';
        this.elements.dropZone.style.display = 'none';
    }

    /**
     * Remove current image
     */
    removeImage() {
        this.state.originalImage = null;
        this.elements.imagePreview.src = '#';
        this.elements.previewContainer.style.display = 'none';
        this.elements.dropZone.style.display = 'block';
        this.elements.fileInput.value = '';
        this.elements.processingControls.style.display = 'none';
        this.elements.resultSection.innerHTML = '';
    }

    /**
     * Show processing controls
     */
    showProcessingControls() {
        this.elements.processingControls.style.display = 'block';
        this.elements.processingControls.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Update base color from color picker
     */
    updateBaseColor(hexValue) {
        this.state.baseColor = hexValue;
        this.elements.hexInput.value = hexValue;
    }

    /**
     * Update hex input value
     */
    updateHexInput(value) {
        // Allow typing partial hex values
        if (value.startsWith('#')) {
            this.elements.hexInput.value = value;
        } else if (value.length <= 6) {
            this.elements.hexInput.value = value;
        }
    }

    /**
     * Validate and apply hex input value
     */
    validateHexInput(value) {
        const hexPattern = /^#[0-9A-Fa-f]{6}$/;
        if (hexPattern.test(value)) {
            this.state.baseColor = value;
            this.elements.baseColor.value = value;
        } else {
            this.elements.hexInput.value = this.state.baseColor;
        }
    }

    /**
     * Select color scheme
     */
    selectScheme(scheme) {
        if (!scheme) return;
        
        this.state.currentScheme = scheme;
        
        // Update button states
        this.elements.schemeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scheme === scheme);
        });
    }

    /**
     * Update color intensity
     */
    updateIntensity(value) {
        this.state.intensity = parseInt(value);
        this.elements.intensityValue.textContent = `${value}%`;
    }

    /**
     * Process image based on current settings
     */
    async processImage() {
        if (!this.state.originalImage || this.state.isProcessing) return;

        this.state.isProcessing = true;
        this.elements.processBtn.disabled = true;
        this.elements.processBtn.textContent = 'Processing...';

        try {
            const results = await this.generateResults();
            this.displayResults(results);
        } catch (error) {
            this.showError('Failed to process image: ' + error.message);
        } finally {
            this.state.isProcessing = false;
            this.elements.processBtn.disabled = false;
            this.elements.processBtn.textContent = 'Process Image';
        }
    }

    /**
     * Generate processing results based on selected scheme
     */
    async generateResults() {
        const results = [];
        const img = this.state.originalImage;

        switch (this.state.currentScheme) {
            case 'monochrome': {
                const processedCanvas = ImageProcessor.processImage(img, (imageData) => {
                    return ColorTheory.applyMonochrome(imageData, this.state.baseColor, this.state.intensity);
                });
                results.push({
                    label: 'Monochrome Effect',
                    image: processedCanvas.toDataURL('image/png')
                });
                break;
            }

            case 'greyscale': {
                const processedCanvas = ImageProcessor.processImage(img, (imageData) => {
                    return ColorTheory.applyGreyscale(imageData);
                });
                results.push({
                    label: 'Greyscale Effect',
                    image: processedCanvas.toDataURL('image/png')
                });
                break;
            }

            case 'analogous': {
                const palette = ColorTheory.getAnalogous(this.state.baseColor);
                const processedCanvas = ImageProcessor.processImage(img, (imageData) => {
                    return ColorTheory.applyPaletteMapping(imageData, palette, this.state.intensity);
                });
                results.push({
                    label: 'Analogous Palette',
                    image: processedCanvas.toDataURL('image/png')
                });
                results.push({
                    label: 'Color Palette',
                    image: ImageProcessor.generatePalettePreview(palette).toDataURL('image/png')
                });
                break;
            }

            case 'complementary': {
                const palette = ColorTheory.getComplementary(this.state.baseColor);
                const processedCanvas = ImageProcessor.processImage(img, (imageData) => {
                    return ColorTheory.applyPaletteMapping(imageData, palette, this.state.intensity);
                });
                results.push({
                    label: 'Complementary Palette',
                    image: processedCanvas.toDataURL('image/png')
                });
                results.push({
                    label: 'Color Palette',
                    image: ImageProcessor.generatePalettePreview(palette).toDataURL('image/png')
                });
                break;
            }

            case 'triadic': {
                const palette = ColorTheory.getTriadic(this.state.baseColor);
                const processedCanvas = ImageProcessor.processImage(img, (imageData) => {
                    return ColorTheory.applyPaletteMapping(imageData, palette, this.state.intensity);
                });
                results.push({
                    label: 'Triadic Palette',
                    image: processedCanvas.toDataURL('image/png')
                });
                results.push({
                    label: 'Color Palette',
                    image: ImageProcessor.generatePalettePreview(palette).toDataURL('image/png')
                });
                break;
            }

            default:
                throw new Error('Invalid color scheme selected');
        }

        return results;
    }

    /**
     * Display processing results
     */
    displayResults(results) {
        const resultsHtml = `
            <div class="results-card show">
                <h2>Processing Results</h2>
                <div class="result-images">
                    ${results.map(result => `
                        <div class="result-item">
                            <img src="${result.image}" alt="${result.label}">
                            <div class="result-label">${result.label}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="download-buttons">
                    ${results.filter(r => !r.label.includes('Palette')).map((result, index) => `
                        <a href="${result.image}" download="processed-${index + 1}.png" class="download-btn">
                            Download ${result.label}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.elements.resultSection.innerHTML = resultsHtml;
        this.elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorHtml = `
            <div class="error-message">
                <strong>Error:</strong> ${message}
            </div>
        `;
        this.elements.resultSection.innerHTML = errorHtml;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ColorStudioApp();
});
