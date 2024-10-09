/*
    * GridHandlerUtil.js
    canvas网格处理工具类
*/
class GridHandlerUtil {
    constructor(communicator) {
        this.communicator = communicator;
        this.gridSize = communicator.data.minGridSize||6;    // 网格大小, 单位mm
    }
    // 生成网格
    generateGridData() {
        const { mmToPx, virtualScale, gridCanvasRef } = this.communicator.data;
        if (gridCanvasRef == null) { return; }
        const gridSizePx = mmToPx(this.gridSize);
        const gridScale = virtualScale;
        const canvasWidth = gridCanvasRef.width;
        const canvasHeight = gridCanvasRef.height;
        const cols = Math.ceil(canvasWidth / (gridSizePx * gridScale));
        const rows = Math.ceil(canvasHeight / (gridSizePx * gridScale));
        // Store the grid data if needed
        const gridData = {
            cols: [],
            rows: []
        };

        for (let i = 0; i <= cols; i++) {
            const x = i * gridSizePx * gridScale;
            gridData.cols.push(x);
        }

        for (let j = 0; j <= rows; j++) {
            const y = j * gridSizePx * gridScale;
            gridData.rows.push(y);
        }

        this.communicator.data.gridData = gridData;
    }
}

export default GridHandlerUtil;