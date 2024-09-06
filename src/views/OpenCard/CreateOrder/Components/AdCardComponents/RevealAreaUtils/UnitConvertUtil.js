/*
 * @Author: xx 
 * @Date: 2024-07-24 16:01:56 
 * @Last Modified by: xx
 * @Last Modified time: 2024-07-24 16:05:45
 * @description: 单位转换工具
 */

class UnitConvertUtil {
    constructor(adCardSize, imageSize) {
        this.adCardWidth = 0;
        this.adCardHeight = 0;
        this.imageWidth = imageSize.width;
        this.imageHeight = imageSize.height;
        // 根据图片的宽高比和广告卡片的宽高比，确定广告卡片的宽高
        if (this.imageWidth > this.imageHeight) {
            this.adCardWidth = Math.max(...(adCardSize));
            this.adCardHeight = Math.min(...(adCardSize));
        } else {
            this.adCardWidth = Math.min(...(adCardSize));
            this.adCardHeight = Math.max(...(adCardSize));
        }  
    }
    mmToPx(mm) {
        return mm * this.imageWidth / this.adCardWidth;
    }
    pxToMm(px) {
        return px * this.adCardWidth / this.imageWidth;
    }
}

export default UnitConvertUtil;