/*
    * ScaleHandlerUtil.js
    canvas缩放处理工具类
    计算缩放比例
*/
class ScaleHandlerUtil {
    constructor(communicator) {
        this.communicator = communicator;
    }
    // 计算缩放比例
    calculateScale() {
        const { operateCanvasRef, virtualScale, backgroundImageSize } = this.communicator.data;
        const canvasWidth = operateCanvasRef.width;
        const canvasHeight = operateCanvasRef.height;
        const imageWidth = backgroundImageSize.width;
        const imageHeight = backgroundImageSize.height;

        this.communicator.data.actualScale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
    }
}
export default ScaleHandlerUtil;