class FontLoader {
    constructor() {
        this.fontCache = new Map();
    }

    async loadFont(fontName, fontUrl) {
        // 如果字体已经在缓存中，直接返回缓存的 Promise
        if (this.fontCache.has(fontName)) {
            return this.fontCache.get(fontName);
        }

        // 创建 FontFace 对象
        const font = new FontFace(fontName, `url(${fontUrl})`);
        
        // 创建一个 Promise 来处理字体加载
        const fontPromise = font.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            console.log(`Font ${fontName} loaded`);
            // 加载成功后，缓存成功状态
            this.fontCache.set(fontName, Promise.resolve(true));
            return true;
        }).catch((error) => {
            console.error(`Failed to load font ${fontName}:`, error);
            // 加载失败，移除缓存
            this.fontCache.delete(fontName);
            throw error;
        });

        // 将 Promise 存储到缓存中
        this.fontCache.set(fontName, fontPromise);
        
        // 返回 Promise
        return fontPromise;
    }
}

export default FontLoader;
