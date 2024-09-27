/*
* ImageHandlerUtil.js
* 
*/
import UnitConvertUtil from './UnitConvertUtil';
class ImageHandlerUtil {
    constructor(communicator) {
        this.communicator = communicator;
    }
    // 加载图片
    loadImage(src) {
        const img = new Image();
        img.src = src;
        return new Promise((resolve, reject) => {
            img.onload = () => {
                const { gridCanvasRef, operateCanvasRef } = this.communicator.data;

                this.communicator.data.backgroundImage = img;
                this.communicator.data.backgroundImageSize = {
                    width: img.width,
                    height: img.height
                }
                gridCanvasRef.width = operateCanvasRef.clientWidth;
                gridCanvasRef.height = operateCanvasRef.clientHeight;
                operateCanvasRef.width = operateCanvasRef.clientWidth;
                operateCanvasRef.height = operateCanvasRef.clientHeight;


                resolve(img);
            };
            img.onerror = (err) => {
                console.error("图片加载失败：", err);
                reject("图片加载失败：" + err);
            };
        });
    }
    // 计算图片的显示位置
    calculateImageSizeAndPosition() {
        const { operateCanvasRef, backgroundImageSize, backgroundImagePosition } = this.communicator.data;
        const canvasWidth = operateCanvasRef.width;
        const canvasHeight = operateCanvasRef.height;
        const imageWidth = backgroundImageSize.width;
        const imageHeight = backgroundImageSize.height;

        const canvasAspectRatio = canvasWidth / canvasHeight;
        const imageAspectRatio = imageWidth / imageHeight;

        let imgWidth = 0;
        let imgHeight = 0;
        if (imageAspectRatio > canvasAspectRatio) {
            imgWidth = canvasWidth;
            imgHeight = canvasWidth / imageAspectRatio;
        } else {
            imgHeight = canvasHeight;
            imgWidth = canvasHeight * imageAspectRatio;
        }

        backgroundImagePosition.x = (canvasWidth - imgWidth) / 2;
        backgroundImagePosition.y = (canvasHeight - imgHeight) / 2;
        this.communicator.data.showImageSize = {
            width: imgWidth,
            height: imgHeight
        }
        const unitConvertUtil = new UnitConvertUtil(this.communicator);
        this.communicator.data.mmToPx = unitConvertUtil.mmToPx;    //毫米转像素
        this.communicator.data.pxToMm = unitConvertUtil.pxToMm;    //像素转毫米
    }
}
export default ImageHandlerUtil;