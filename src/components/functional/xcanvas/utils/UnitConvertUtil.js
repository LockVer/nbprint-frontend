/*
 * @Author: xx 
 * @Date: 2024-07-24 16:01:56 
 * @Last Modified by: xx
 * @Last Modified time: 2024-09-25 11:14:38
 * @description: 单位转换工具
 */

class UnitConvertUtil {
    constructor(communicator) {
        const { backgroundImageSize, adCardSize,showImageSize } = communicator.data;
        this.adCardWidth = 0;
        this.adCardHeight = 0;
        console.log('adCardSize:', adCardSize);
        console.log('backgroundImageSize:', showImageSize);
        this.imageWidth = showImageSize.width;
        this.imageHeight = showImageSize.height;
        // 根据图片的宽高比和广告卡片的宽高比，确定广告卡片的宽高
        if (this.imageWidth > this.imageHeight) {
            this.adCardWidth = Math.max(...(adCardSize));
            this.adCardHeight = Math.min(...(adCardSize));
        } else {
            this.adCardWidth = Math.min(...(adCardSize));
            this.adCardHeight = Math.max(...(adCardSize));
        }

        // 绑定方法到实例
        this.mmToPx = this.mmToPx.bind(this);
        this.pxToMm = this.pxToMm.bind(this);
    }
    mmToPx(mm) {
        return mm * this.imageWidth / this.adCardWidth;
    }
    pxToMm(px) {
        const mm = px * this.adCardWidth / this.imageWidth;
        return Math.round(mm * 100) / 100;
    }
}

export default UnitConvertUtil;