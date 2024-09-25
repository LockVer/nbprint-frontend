/*
* 渲染器工具类
*/
class RendererUtil {
    constructor(communicator) {
        this.communicator = communicator;
        this.hoverColor = 'green';
        this.selectColor = '#00a1ff';
        this.normalColor = 'rgba(0,0,0,0.5)';
        this.warningColor = 'rgba(255, 165,0,0.5)';
    }
    // 渲染
    render() {
        this.clear();
        this.drawImage();
        this.drawRects();
        this.drawSelectRect();
        this.drawDistanceLines();
        this.drawAlignmentLines();
    }
    drawImage() {
        const { operateCanvasRef, backgroundImage, backgroundImagePosition, virtualScale, showImageSize } = this.communicator.data;
        const imageCanvas = operateCanvasRef;
        if (imageCanvas == null) { return; }
        const ctx = imageCanvas.getContext('2d');
        ctx.clearRect(0, 0, imageCanvas.clientWidth, imageCanvas.clientHeight);
        ctx.save();
        ctx.translate(backgroundImagePosition.x, backgroundImagePosition.y);
        ctx.scale(virtualScale, virtualScale);
        ctx.drawImage(backgroundImage, 0, 0, showImageSize.width, showImageSize.height);
        ctx.restore();
    }
    drawGrid() {
        if (!this.communicator.data.gridVisible) { this.clearGrid(); return; }

        const { gridCanvasRef, gridData } = this.communicator.data;
        const gridCanvas = gridCanvasRef;
        if (gridCanvas == null) { return; }
        const ctx = gridCanvas.getContext('2d');
        const cols = gridData.cols;
        const rows = gridData.rows;
        ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

        // Colors for the checkerboard pattern
        const color1 = 'rgba(255, 255, 255, 0.5)'; // White with 50% opacity
        const color2 = 'rgba(192, 192, 192, 0.5)'; // Gray with 50% opacity

        // Draw the checkerboard pattern
        for (let i = 0; i < cols.length - 1; i++) {
            for (let j = 0; j < rows.length - 1; j++) {
                const x = cols[i];
                const y = rows[j];
                const width = cols[i + 1] - x;
                const height = rows[j + 1] - y;

                // Alternate colors
                ctx.fillStyle = (i + j) % 2 === 0 ? color1 : color2;
                ctx.fillRect(x, y, width, height);
            }
        }
    }
    clearGrid() {
        const { gridCanvasRef } = this.communicator.data;
        const gridCanvas = gridCanvasRef;
        if (gridCanvas == null) { return; }
        const ctx = gridCanvas.getContext('2d');
        ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    }
    drawRects() {
        const { operateCanvasRef, shapeList, virtualScale, backgroundImagePosition, hotkey } = this.communicator.data;
        if (operateCanvasRef == null) { return; }
        if (shapeList == null) { return; }
        const ctx = operateCanvasRef.getContext('2d');

        const handleSize = 10; // 把手的大小
        const borderColor = this.selectColor; // 边框和把手的边框颜色
        const fillColor = 'rgba(0, 161, 255, 0.5)'; // 50% 透明度的填充颜色
        const handleFillColor = '#ffffff'; // 把手内部填充颜色

        ctx.save();
        ctx.translate(backgroundImagePosition.x, backgroundImagePosition.y);
        ctx.scale(virtualScale, virtualScale);

        shapeList.forEach(shape => {
            if (hotkey.Alt) {
                if (shape.proximityWarning) {
                    this.drawWarningSign(shape, ctx);
                    return;
                } else {
                    this.drawSuccessSign(shape, ctx);
                    return;
                }
            }
            if (!shape.active && !shape.selected) {
                ctx.fillStyle = this.normalColor;
                ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            } else {
                ctx.fillStyle = fillColor;
                ctx.fillRect(shape.x, shape.y, shape.width, shape.height);

                // 绘制边框
                ctx.strokeStyle = borderColor; // 设置边框颜色
                ctx.lineWidth = 2; // 设置边框宽度
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                if (shape.selected) { return; } // 如果是选中状态，不绘制把手
                // 绘制把手
                ctx.strokeStyle = borderColor; // 设置把手边框颜色
                ctx.fillStyle = handleFillColor; // 设置把手内部填充颜色

                // 四角把手
                this.drawHandle(ctx, shape.x - handleSize / 2, shape.y - handleSize / 2, handleSize); // 左上
                this.drawHandle(ctx, shape.x + shape.width - handleSize / 2, shape.y - handleSize / 2, handleSize); // 右上
                this.drawHandle(ctx, shape.x - handleSize / 2, shape.y + shape.height - handleSize / 2, handleSize); // 左下
                this.drawHandle(ctx, shape.x + shape.width - handleSize / 2, shape.y + shape.height - handleSize / 2, handleSize); // 右下

                // 中间把手
                this.drawHandle(ctx, shape.x + shape.width / 2 - handleSize / 2, shape.y - handleSize / 2, handleSize); // 上中
                this.drawHandle(ctx, shape.x + shape.width / 2 - handleSize / 2, shape.y + shape.height - handleSize / 2, handleSize); // 下中
                this.drawHandle(ctx, shape.x - handleSize / 2, shape.y + shape.height / 2 - handleSize / 2, handleSize); // 左中
                this.drawHandle(ctx, shape.x + shape.width - handleSize / 2, shape.y + shape.height / 2 - handleSize / 2, handleSize); // 右中
            }
        });

        ctx.restore();
    }
    drawWarningSign(shape, ctx) {
        console.log('drawWarningSign');
        const centerX = shape.x + shape.width / 2; // 中心点的x坐标
        const centerY = shape.y + shape.height / 2; // 中心点的y坐标
        const size = shape.width / 3; // × 符号的大小

        // 绘制半透明黄色背景
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'; // 半透明黄色背景
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);

        // 设置阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // 绘制 × 符号
        ctx.strokeStyle = '#FFFFFF'; // 白色 × 符号
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(centerX - size / 2, centerY - size / 2);
        ctx.lineTo(centerX + size / 2, centerY + size / 2);
        ctx.moveTo(centerX + size / 2, centerY - size / 2);
        ctx.lineTo(centerX - size / 2, centerY + size / 2);
        ctx.stroke();

        // 重置阴影效果
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    drawSuccessSign(shape, ctx) {
        console.log('drawSuccessSign');
        const centerX = shape.x + shape.width / 2; // 圆心的x坐标
        const centerY = shape.y + shape.height / 2; // 圆心的y坐标
        const radius = shape.width / 3; // 圆的半径

        // 绘制半透明绿色背景
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'; // 半透明绿色背景
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);

        // 设置阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // 绘制对勾符号
        ctx.strokeStyle = '#FFFFFF'; // 白色对勾
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(centerX - radius / 2, centerY); // 调整起始点
        ctx.lineTo(centerX - radius / 6, centerY + radius / 3); // 调整中间点
        ctx.lineTo(centerX + radius / 2, centerY - radius / 3); // 调整结束点
        ctx.stroke();

        // 重置阴影效果
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }





    drawHandle(ctx, x, y, size) {
        ctx.fillRect(x, y, size, size); // 绘制白色填充
        ctx.strokeRect(x, y, size, size); // 绘制边框
    }

    drawSelectRect() {
        const { operateCanvasRef, selectionRect } = this.communicator.data;
        if (operateCanvasRef == null) { return; }
        if (selectionRect == null) { return; }
        const ctx = operateCanvasRef.getContext('2d');
        ctx.save();
        ctx.strokeStyle = this.selectColor;
        ctx.lineWidth = 1;
        ctx.fillStyle = "rgba(0, 161, 255, 0.5)";
        ctx.fillRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
        ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
        ctx.restore();
    }

    drawDistanceLines() {
        const { operateCanvasRef, distanceLines, hotkey } = this.communicator.data;
        if (operateCanvasRef == null) { return; }
        if (distanceLines == null) { return; }
        if (hotkey.Alt) { return; }
        const ctx = operateCanvasRef.getContext('2d');
        ctx.save();
        ctx.strokeStyle = this.selectColor;
        ctx.lineWidth = 3;
        ctx.fillStyle = "rgba(0, 161, 255, 0.5)";
        ctx.font = "12px Arial";

        distanceLines.forEach(line => {
            // 绘制距离线
            ctx.beginPath();
            ctx.moveTo(line.start.x, line.start.y);
            ctx.lineTo(line.end.x, line.end.y);
            ctx.stroke();

            // 计算文字位置
            const text = `${line.distance}mm`;
            const textX = (line.start.x + line.end.x) / 2;
            const textY = (line.start.y + line.end.y) / 2;

            // 设置文字阴影
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;

            // 测量文字宽度和高度
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = 12; // 12px Arial 的大致高度

            // 绘制文字背景
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(textX - textWidth / 2 - 2, textY - textHeight / 2 - 2, textWidth + 4, textHeight + 4);

            // 绘制文字
            ctx.fillStyle = "black";
            ctx.fillText(text, textX - textWidth / 2, textY + textHeight / 4);
        });

        ctx.restore();
    }
    drawAlignmentLines() {
        const { operateCanvasRef, alignmentLines, virtualScale, backgroundImagePosition } = this.communicator.data;
        if (operateCanvasRef == null) { return; }
        if (alignmentLines == null) { return; }
        const ctx = operateCanvasRef.getContext('2d');

        const drawLine = (x1, y1, x2, y2, color) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        }
        alignmentLines.forEach(line => {
            // 绘制对齐线
            if (line.type === 'vertical') {
                drawLine(line.x, line.y1, line.x, line.y2, 'red');
            } else if (line.type === 'horizontal') {
                drawLine(line.x1, line.y, line.x2, line.y, 'red');
            }
        });

        ctx.restore();
    }
    clear() {

    }
}


export default RendererUtil;