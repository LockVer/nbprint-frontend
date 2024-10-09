/*
    RectHandlerUtil.js
    矩形处理工具类
*/
class RectHandlerUtil {
    constructor(communicator) {
        this.communicator = communicator;
    }
    createRect() {
        const { currentAction } = this.communicator.data;
        if (currentAction !== "rect") return;
        const rectData = {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            type: "rect"
        };
        if (!this.communicator.data.rectList) {
            this.communicator.data.rectList = [];
        }
        this.communicator.data.rectList.push(rectData);
    }
    moveRect() {

    }
    resizeRect() {

    }
    deleteRect() {

    }
    checkCollision(e) {
        const { virtualScale, backgroundImagePosition } = this.communicator.data;
        const x = (e.x - backgroundImagePosition.x) / virtualScale;
        const y = (e.y - backgroundImagePosition.y) / virtualScale;

        let hoveredRect = null;

        const allRects = [...this.communicator.data.selectedRect];
        for (let rect of allRects) {
            if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
                hoveredRect = rect;
                break;
            }
        }

        this.communicator.data.hoveredRect = hoveredRect;
    }
}

export default RectHandlerUtil;