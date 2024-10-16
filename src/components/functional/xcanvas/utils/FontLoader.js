class FontLoader {
    constructor() {
        this.fontCache = new Map();
    }

    loadFont(fontName, fontUrl) {
        if (this.fontCache.has(fontName)) {
            return this.fontCache.get(fontName);
        }

        const font = new FontFace(fontName, `url(${fontUrl})`);
        const fontPromise = font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            console.log(`Font ${fontName} loaded`);
            this.fontCache.set(fontName, true);
        }).catch((error) => {
            console.error(`Failed to load font ${fontName}:`, error);
            this.fontCache.delete(fontName); // 如果加载失败，移除缓存
        });

        this.fontCache.set(fontName, fontPromise);
        return fontPromise;
    }
}

export default FontLoader;
