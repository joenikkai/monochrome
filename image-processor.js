/**
 * ImageProcessor - Handles image loading, processing, and export
 * Uses Canvas API for client-side image manipulation
 */
class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.processedImages = new Map();
    }

    /**
     * Load image from file input
     * @param {File} file - Image file from input
     * @returns {Promise<HTMLImageElement>} Loaded image element
     */
    static async loadImage(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Invalid file type. Please upload an image.'));
                return;
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                reject(new Error('File size exceeds 10MB limit.'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Failed to load image.'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file.'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Create canvas from image
     * @param {HTMLImageElement} img - Source image
     * @returns {HTMLCanvasElement} Canvas with image drawn
     */
    static createCanvas(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas;
    }

    /**
     * Get image data from canvas
     * @param {HTMLCanvasElement} canvas - Source canvas
     * @returns {ImageData} Image data object
     */
    static getImageData(canvas) {
        const ctx = canvas.getContext('2d');
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    /**
     * Apply processing function to image
     * @param {HTMLImageElement} img - Source image
     * @param {Function} processingFn - Processing function to apply
     * @returns {HTMLCanvasElement} Processed canvas
     */
    static processImage(img, processingFn) {
        const canvas = this.createCanvas(img);
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const processedData = processingFn(imageData);
        ctx.putImageData(processedData, 0, 0);
        
        return canvas;
    }

    /**
     * Generate color palette preview
     * @param {Array<string>} colors - Array of HEX colors
     * @returns {HTMLCanvasElement} Canvas with color swatches
     */
    static generatePalettePreview(colors) {
        const swatchSize = 100;
        const canvas = document.createElement('canvas');
        canvas.width = colors.length * swatchSize;
        canvas.height = swatchSize;
        const ctx = canvas.getContext('2d');

        colors.forEach((color, index) => {
            ctx.fillStyle = color;
            ctx.fillRect(index * swatchSize, 0, swatchSize, swatchSize);
            
            // Add color code text
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            
            // Add text shadow for better readability
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(color, index * swatchSize + swatchSize / 2, swatchSize / 2);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        });

        return canvas;
    }

    /**
     * Export canvas as data URL
     * @param {HTMLCanvasElement} canvas - Canvas to export
     * @param {string} format - Image format (png, jpeg)
     * @param {number} quality - Image quality (0-1)
     * @returns {string} Data URL
     */
    static exportCanvas(canvas, format = 'png', quality = 0.92) {
        return canvas.toDataURL(`image/${format}`, quality);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageProcessor;
}
