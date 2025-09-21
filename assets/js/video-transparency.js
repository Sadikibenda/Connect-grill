/**
 * Video Transparency Controller for Connect Grill Hero Section
 * 
 * This script provides functions to dynamically control the transparency
 * of the video overlay in the hero section.
 */

class VideoTransparencyController {
    constructor() {
        this.root = document.documentElement;
        this.currentOpacity = 70; // Default opacity
    }

    /**
     * Set the video overlay opacity
     * @param {number} opacity - Opacity value (0-100)
     */
    setOpacity(opacity) {
        // Clamp value between 0 and 100
        opacity = Math.max(0, Math.min(100, opacity));
        
        this.currentOpacity = opacity;
        this.root.style.setProperty('--video-opacity', opacity + '%');
        
        // Dispatch custom event for any listeners
        window.dispatchEvent(new CustomEvent('videoOpacityChanged', {
            detail: { opacity: opacity }
        }));
    }

    /**
     * Get the current opacity
     * @returns {number} Current opacity value
     */
    getOpacity() {
        return this.currentOpacity;
    }

    /**
     * Gradually change opacity with animation
     * @param {number} targetOpacity - Target opacity (0-100)
     * @param {number} duration - Animation duration in milliseconds (default: 500)
     */
    animateToOpacity(targetOpacity, duration = 500) {
        const startOpacity = this.currentOpacity;
        const opacityDiff = targetOpacity - startOpacity;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeInOut = progress * (2 - progress);
            const currentOpacity = startOpacity + (opacityDiff * easeInOut);
            
            this.setOpacity(Math.round(currentOpacity));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Preset opacity configurations
     */
    presets = {
        transparent: 10,    // Very transparent (video visible)
        light: 30,         // Light overlay
        default: 70,       // Default setting
        dark: 90,          // Dark overlay (video less visible)
        opaque: 95         // Almost completely opaque
    };

    /**
     * Apply a preset opacity
     * @param {string} presetName - Name of the preset
     * @param {boolean} animate - Whether to animate the transition (default: true)
     */
    applyPreset(presetName, animate = true) {
        if (this.presets.hasOwnProperty(presetName)) {
            const targetOpacity = this.presets[presetName];
            
            if (animate) {
                this.animateToOpacity(targetOpacity);
            } else {
                this.setOpacity(targetOpacity);
            }
        } else {
            console.warn(`Preset "${presetName}" not found. Available presets:`, Object.keys(this.presets));
        }
    }
}

// Initialize the controller
const videoTransparency = new VideoTransparencyController();

// Example usage:
// videoTransparency.setOpacity(50);                    // Set to 50% opacity
// videoTransparency.applyPreset('light');              // Apply light preset
// videoTransparency.animateToOpacity(90, 1000);        // Animate to 90% over 1 second

// You can also listen for opacity changes:
// window.addEventListener('videoOpacityChanged', (event) => {
//     console.log('Video opacity changed to:', event.detail.opacity + '%');
// });

// Export for use in other scripts
window.VideoTransparencyController = VideoTransparencyController;
window.videoTransparency = videoTransparency;