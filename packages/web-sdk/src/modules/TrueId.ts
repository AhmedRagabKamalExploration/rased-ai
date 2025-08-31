import { BaseModule } from './BaseModule';

// We use a specific, consistent image URL. The browser will cache this.
const FINGERPRINT_IMAGE_URL = 'https://placehold.co/32x32/EBF2F7/7F9CF5?text=ID';

export class TrueIdModule extends BaseModule {
    /**
     * Initializes the TrueId generation process.
     */
    public init(): void {
        console.log("[SDK] TrueIdModule: Initializing...");
        this.generateTrueId().catch(error => {
            console.error("[SDK] TrueIdModule: Failed to generate TrueId.", error);
            this.eventManager.dispatch('identity.trueId.error', {
                error: 'Canvas fingerprinting failed.'
            });
        });
    }

    private async generateTrueId(): Promise<void> {
        try {
            // 1. Fetch the image. This will be served from cache on subsequent visits.
            const image = await this.loadImage(FINGERPRINT_IMAGE_URL);

            // 2. Render the image and other graphics to a canvas.
            const dataUrl = this.renderToCanvas(image);

            // 3. Hash the resulting pixel data to create the TrueId.
            const trueId = await this.hash(dataUrl);
            
            console.log(`[SDK] TrueIdModule: Generated TrueId: ${trueId}`);
            
            // 4. Dispatch the result.
            this.eventManager.dispatch('identity.trueId', { trueId });

        } catch (error) {
            // This ensures that even if this module fails, the SDK doesn't crash.
            throw new Error(`Canvas rendering failed: ${error}`);
        }
    }

    /**
     * Creates an HTMLImageElement and returns a Promise that resolves when it's loaded.
     */
    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Necessary for tainted canvases if the CDN supports it.
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load fingerprint image from ${url}`));
            img.src = url;
        });
    }

    /**
     * Renders the image and other unique graphics to a hidden canvas and returns its data URL.
     */
    private renderToCanvas(image: HTMLImageElement): string {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error("Canvas 2D context is not available.");
        }

        // Render a combination of things to increase uniqueness (entropy).
        // Different systems render fonts, shapes, and images slightly differently.
        ctx.drawImage(image, 0, 0);
        ctx.font = "16px 'Arial'";
        ctx.fillStyle = 'rgb(100, 125, 150)';
        ctx.fillText('websdk-v1.0', 4, 58);
        ctx.beginPath();
        ctx.arc(40, 40, 10, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();

        return canvas.toDataURL();
    }

    /**
     * Hashes a string using the browser's built-in SHA-256 crypto API.
     */
    private async hash(data: string): Promise<string> {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
        return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
}
