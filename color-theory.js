/**
 * ColorTheory - Advanced color manipulation and theory implementation
 * Implements standard color harmony algorithms for professional image processing
 */
class ColorTheory {
    /**
     * Convert HEX color to RGB object
     * @param {string} hex - Color in HEX format (#RRGGBB)
     * @returns {Object} RGB color object {r, g, b}
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) {
            throw new Error('Invalid hex color format. Expected format: #RRGGBB');
        }
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    }

    /**
     * Convert RGB object to HEX string
     * @param {Object} rgb - RGB color object {r, g, b}
     * @returns {string} HEX color string
     */
    static rgbToHex(rgb) {
        const toHex = (value) => {
            const clamped = Math.max(0, Math.min(255, Math.round(value)));
            return clamped.toString(16).padStart(2, '0');
        };
        return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
    }

    /**
     * Convert RGB to HSL color space
     * @param {Object} rgb - RGB color object {r, g, b}
     * @returns {Object} HSL color object {h, s, l}
     */
    static rgbToHsl(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    /**
     * Convert HSL to RGB color space
     * @param {Object} hsl - HSL color object {h, s, l}
     * @returns {Object} RGB color object {r, g, b}
     */
    static hslToRgb(hsl) {
        const h = hsl.h / 360;
        const s = hsl.s / 100;
        const l = hsl.l / 100;
        
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /**
     * Generate monochromatic color palette
     * @param {string} baseHex - Base color in HEX format
     * @param {number} variations - Number of variations to generate
     * @returns {Array<string>} Array of HEX colors
     */
    static getMonochromatic(baseHex, variations = 8) {
        const baseRgb = this.hexToRgb(baseHex);
        const baseHsl = this.rgbToHsl(baseRgb);
        const colors = [];

        for (let i = 0; i < variations; i++) {
            const lightness = Math.max(5, Math.min(95, 
                baseHsl.l - 30 + (60 / (variations - 1)) * i
            ));
            const saturation = Math.max(10, Math.min(100, baseHsl.s));
            
            colors.push(this.rgbToHex(this.hslToRgb({
                h: baseHsl.h,
                s: saturation,
                l: lightness
            })));
        }

        return colors;
    }

    /**
     * Generate analogous color scheme
     * @param {string} baseHex - Base color in HEX format
     * @returns {Array<string>} Array of 5 HEX colors
     */
    static getAnalogous(baseHex) {
        const baseRgb = this.hexToRgb(baseHex);
        const baseHsl = this.rgbToHsl(baseRgb);
        const colors = [];

        for (let i = -2; i <= 2; i++) {
            const hue = (baseHsl.h + i * 30 + 360) % 360;
            colors.push(this.rgbToHex(this.hslToRgb({
                h: hue,
                s: baseHsl.s,
                l: baseHsl.l
            })));
        }

        return colors;
    }

    /**
     * Generate complementary color scheme
     * @param {string} baseHex - Base color in HEX format
     * @returns {Array<string>} Array of 4 HEX colors
     */
    static getComplementary(baseHex) {
        const baseRgb = this.hexToRgb(baseHex);
        const baseHsl = this.rgbToHsl(baseRgb);
        const colors = [];

        // Base color and its variations
        colors.push(baseHex);
        colors.push(this.rgbToHex(this.hslToRgb({
            h: baseHsl.h,
            s: baseHsl.s,
            l: Math.max(20, baseHsl.l - 20)
        })));

        // Complementary color and its variation
        const compHue = (baseHsl.h + 180) % 360;
        colors.push(this.rgbToHex(this.hslToRgb({
            h: compHue,
            s: baseHsl.s,
            l: baseHsl.l
        })));
        colors.push(this.rgbToHex(this.hslToRgb({
            h: compHue,
            s: baseHsl.s,
            l: Math.max(20, baseHsl.l - 20)
        })));

        return colors;
    }

    /**
     * Generate triadic color scheme
     * @param {string} baseHex - Base color in HEX format
     * @returns {Array<string>} Array of 6 HEX colors
     */
    static getTriadic(baseHex) {
        const baseRgb = this.hexToRgb(baseHex);
        const baseHsl = this.rgbToHsl(baseRgb);
        const colors = [];

        for (let i = 0; i < 3; i++) {
            const hue = (baseHsl.h + i * 120) % 360;
            colors.push(this.rgbToHex(this.hslToRgb({
                h: hue,
                s: baseHsl.s,
                l: baseHsl.l
            })));
            colors.push(this.rgbToHex(this.hslToRgb({
                h: hue,
                s: baseHsl.s,
                l: Math.max(20, baseHsl.l - 30)
            })));
        }

        return colors;
    }

    /**
     * Generate greyscale palette
     * @param {number} variations - Number of grey variations
     * @returns {Array<string>} Array of grey HEX colors
     */
    static getGreyscale(variations = 8) {
        const colors = [];
        for (let i = 0; i < variations; i++) {
            const value = Math.round((255 / (variations - 1)) * i);
            colors.push(this.rgbToHex({ r: value, g: value, b: value }));
        }
        return colors;
    }

    /**
     * Apply monochrome effect to image data
     * @param {ImageData} imageData - Original image data
     * @param {string} baseHex - Base color for monochrome effect
     * @param {number} intensity - Color intensity (0-100)
     * @returns {ImageData} Processed image data
     */
    static applyMonochrome(imageData, baseHex, intensity = 70) {
        const baseRgb = this.hexToRgb(baseHex);
        const data = imageData.data;
        const intensityFactor = intensity / 100;

        for (let i = 0; i < data.length; i += 4) {
            // Calculate luminance
            const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            // Mix base color with luminance
            data[i] = Math.min(255, baseRgb.r * intensityFactor + luminance * (1 - intensityFactor));
            data[i + 1] = Math.min(255, baseRgb.g * intensityFactor + luminance * (1 - intensityFactor));
            data[i + 2] = Math.min(255, baseRgb.b * intensityFactor + luminance * (1 - intensityFactor));
            // Keep alpha channel unchanged
        }

        return imageData;
    }

    /**
     * Apply greyscale effect to image data
     * @param {ImageData} imageData - Original image data
     * @returns {ImageData} Processed image data
     */
    static applyGreyscale(imageData) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = grey;
            data[i + 1] = grey;
            data[i + 2] = grey;
        }

        return imageData;
    }

    /**
     * Apply color palette mapping to image
     * @param {ImageData} imageData - Original image data
     * @param {Array<string>} palette - Array of HEX colors
     * @param {number} intensity - Effect intensity (0-100)
     * @returns {ImageData} Processed image data
     */
    static applyPaletteMapping(imageData, palette, intensity = 70) {
        const data = imageData.data;
        const intensityFactor = intensity / 100;
        const paletteRgb = palette.map(hex => this.hexToRgb(hex));

        for (let i = 0; i < data.length; i += 4) {
            // Calculate luminance for palette selection
            const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const paletteIndex = Math.floor((luminance / 255) * (paletteRgb.length - 1));
            const targetColor = paletteRgb[paletteIndex];

            // Blend original color with palette color based on intensity
            data[i] = data[i] * (1 - intensityFactor) + targetColor.r * intensityFactor;
            data[i + 1] = data[i + 1] * (1 - intensityFactor) + targetColor.g * intensityFactor;
            data[i + 2] = data[i + 2] * (1 - intensityFactor) + targetColor.b * intensityFactor;
        }

        return imageData;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorTheory;
}
