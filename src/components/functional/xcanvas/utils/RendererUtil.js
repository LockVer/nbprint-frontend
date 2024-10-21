import FontLoader from "./FontLoader";
import { ElMessageBox } from "element-plus";

/*
* 渲染器工具类
*/
class RendererUtil {
    constructor(communicator) {
        this.communicator = communicator;
        this.hoverColor = 'green';
        this.selectColor = '#00a1ff';
        this.normalColor = 'rgba(0,0,0,0.65)';
        this.warningColor = 'rgba(255, 165,0,0.5)';
        this.fontLoader = new FontLoader();
    }
    // 渲染
    render() {
        this.clear();
        this.drawImage();
        this.drawRects();
        this.drawSelectRect();
        this.drawDistanceLines();
        this.drawAlignmentLines();
        this.drawAwardText();
        this.drawShapeSizeText();
    }
    drawImage() {
        const { operateCanvasRef, backgroundImageObject, backgroundImagePosition, backgroundImageSize, virtualScale, showImageSize } = this.communicator.data;
        const imageCanvas = operateCanvasRef;
        if (imageCanvas == null) { return; }
        const ctx = imageCanvas.getContext('2d');
        ctx.clearRect(0, 0, imageCanvas.clientWidth, imageCanvas.clientHeight);
        ctx.save();
        ctx.translate(backgroundImagePosition.x, backgroundImagePosition.y);
        ctx.scale(virtualScale, virtualScale);
        ctx.drawImage(backgroundImageObject, 0, 0, backgroundImageSize.width, backgroundImageSize.height);
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

        const color1 = 'rgba(255, 255, 255, 0.5)'; // 白色 50% 透明度
        const color2 = 'rgba(192, 192, 192, 0.5)'; // 灰色 50% 透明度

        // 绘制网格
        for (let i = 0; i < cols.length - 1; i++) {
            for (let j = 0; j < rows.length - 1; j++) {
                const x = cols[i];
                const y = rows[j];
                const width = cols[i + 1] - x;
                const height = rows[j + 1] - y;

                // 交替填充颜色
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
        const { operateCanvasRef, shapeList, virtualScale, actualScale, backgroundImagePosition, hotkey, gameList } = this.communicator.data;
        if (operateCanvasRef == null) { return; }
        if (shapeList == null) { return; }
        const ctx = operateCanvasRef.getContext('2d');

        const handleSize = 10 / actualScale; // 把手的大小
        const borderColor = this.selectColor; // 边框和把手的边框颜色
        const fillColor = 'rgba(0, 161, 255, 0.5)'; // 50% 透明度的填充颜色
        const handleFillColor = '#ffffff'; // 把手内部填充颜色

        ctx.save();
        ctx.translate(backgroundImagePosition.x, backgroundImagePosition.y);
        ctx.scale(virtualScale, virtualScale);

        shapeList.forEach(shape => {
            if (hotkey.Alt) {
                shape.checkProximity();
                if (shape.proximityWarning) {
                    this.drawWarningSign(shape, ctx);
                    return;
                } else {
                    this.drawSuccessSign(shape, ctx);
                    return;
                }
            }
            if (!shape.active && !shape.selected) {
                if (shape.id && shape.borderColor) {
                    const game = gameList.find(item => item.id === shape.id);
                    if (game && game.active) {
                        // 上边框渐变
                        let gradient = ctx.createLinearGradient(shape.x, shape.y, shape.x + shape.width, shape.y);
                        gradient.addColorStop(0, 'red');
                        gradient.addColorStop(0.2, 'orange');
                        gradient.addColorStop(0.4, 'yellow');
                        gradient.addColorStop(0.6, 'green');
                        gradient.addColorStop(0.8, 'blue');
                        gradient.addColorStop(1, 'purple');
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(shape.x, shape.y);
                        ctx.lineTo(shape.x + shape.width, shape.y);
                        ctx.stroke();

                        // 右边框渐变
                        gradient = ctx.createLinearGradient(shape.x + shape.width, shape.y, shape.x + shape.width, shape.y + shape.height);
                        gradient.addColorStop(0, 'red');
                        gradient.addColorStop(0.2, 'orange');
                        gradient.addColorStop(0.4, 'yellow');
                        gradient.addColorStop(0.6, 'green');
                        gradient.addColorStop(0.8, 'blue');
                        gradient.addColorStop(1, 'purple');
                        ctx.strokeStyle = gradient;
                        ctx.beginPath();
                        ctx.moveTo(shape.x + shape.width, shape.y);
                        ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
                        ctx.stroke();

                        // 下边框渐变
                        gradient = ctx.createLinearGradient(shape.x + shape.width, shape.y + shape.height, shape.x, shape.y + shape.height);
                        gradient.addColorStop(0, 'purple');
                        gradient.addColorStop(0.2, 'blue');
                        gradient.addColorStop(0.4, 'green');
                        gradient.addColorStop(0.6, 'yellow');
                        gradient.addColorStop(0.8, 'orange');
                        gradient.addColorStop(1, 'red');
                        ctx.strokeStyle = gradient;
                        ctx.beginPath();
                        ctx.moveTo(shape.x + shape.width, shape.y + shape.height);
                        ctx.lineTo(shape.x, shape.y + shape.height);
                        ctx.stroke();

                        // 左边框渐变
                        gradient = ctx.createLinearGradient(shape.x, shape.y + shape.height, shape.x, shape.y);
                        gradient.addColorStop(0, 'purple');
                        gradient.addColorStop(0.2, 'blue');
                        gradient.addColorStop(0.4, 'green');
                        gradient.addColorStop(0.6, 'yellow');
                        gradient.addColorStop(0.8, 'orange');
                        gradient.addColorStop(1, 'red');
                        ctx.strokeStyle = gradient;
                        ctx.beginPath();
                        ctx.moveTo(shape.x, shape.y + shape.height);
                        ctx.lineTo(shape.x, shape.y);
                        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
                        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                        ctx.stroke();
                        // 绘制文字
                        ctx.font = '12px Arial';
                        ctx.fillStyle = 'white';
                        ctx.textBaseline = 'top'; // 设置文本基线为顶部对齐
                        // 绘制文字边框
                        ctx.lineWidth = 3; // 边框宽度
                        ctx.strokeStyle = 'black'; // 边框颜色
                        ctx.strokeText(shape.text, shape.x + 5, shape.y - 15);

                        ctx.fillText(shape.text, shape.x + 5, shape.y - 15);
                    } else {
                        ctx.fillStyle = this.normalColor;
                        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                        ctx.strokeStyle = shape.borderColor;
                        ctx.lineWidth = 5;
                        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                    }
                } else {
                    ctx.fillStyle = this.normalColor;
                    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                }
            } else {
                ctx.fillStyle = fillColor;
                ctx.strokeStyle = borderColor;
                if (shape.selected) {
                    if (shape.id) {
                        ctx.fillStyle = "rgba(0, 161, 255, 0.3)";
                        ctx.strokeStyle = shape.borderColor;
                    }
                    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                    ctx.lineWidth = 2; // 设置边框宽度
                    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                    return;
                } else {
                    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                    ctx.lineWidth = 2; // 设置边框宽度
                    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                } // 如果是选中状态，不绘制把手
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
        const { operateCanvasRef, distanceLines, hotkey, showShapeDistance } = this.communicator.data;
        if (!showShapeDistance) { return; }
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
    async drawAwardText() {
        const { operateCanvasRef, shapeList, virtualScale, backgroundImagePosition, mmToPx } = this.communicator.data;
        if (operateCanvasRef == null) { return; }
        if (shapeList == null) { return; }
        const ctx = operateCanvasRef.getContext('2d');
        ctx.save();
        ctx.translate(backgroundImagePosition.x, backgroundImagePosition.y);
        ctx.scale(virtualScale, virtualScale);
        ctx.fillStyle = 'white';
        const loadPromises = shapeList.map((shape) => {
            if (shape.fontFamily) {
                return this.fontLoader.loadFont(shape.fontName, shape.fontFamily);
            }
            return true; // 如果没有 fontFamily，视为成功
        });
        // 使用 Promise.all 等待所有字体加载完成
        const results = await Promise.all(loadPromises);
        // 检查是否所有字体都加载成功
        const allLoaded = results.every(result => result === true);
        if (!allLoaded) {
            ElMessageBox.alert('字体加载失败，请检查字体文件是否正确。', '错误', {
                type: 'error'
            });
            return;
        }

        shapeList.forEach((shape) => {
            const padding = mmToPx(3);
            const cellPadding = mmToPx(1); // Padding between cells
            let fontSize = 200; // 初始化字体大小
            const texts = shape.awardList;
            if (texts == null) { return; }
            if (shape.fontSize) {
                if (shape.fontSize > shape.maxFontSize) {
                    shape.fontSize = shape.maxFontSize;
                }
                fontSize = shape.fontSize;
            }
            // 确定行数和列数
            const cols = Math.ceil(Math.sqrt(texts.length));
            const rows = Math.ceil(texts.length / cols);

            // 计算适合形状内所有文本的最大字体大小
            const cellWidth = (shape.width - 2 * padding - (cols - 1) * cellPadding) / cols;
            const cellHeight = (shape.height - 2 * padding - (rows - 1) * cellPadding) / rows;

            // 调整字体大小以适应单元格尺寸
            if (!shape.fontSize) {
                ctx.font = `${fontSize}px ${shape.fontName ? shape.fontName : 'Arial'}`;
                while (true) {
                    let fits = true;
                    for (const text of texts) {
                        const lines = text.split('\n');
                        const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
                        const totalHeight = lines.length * fontSize;
                        if (maxWidth > cellWidth || totalHeight > cellHeight) {
                            fits = false;
                            break;
                        }
                    }
                    if (fits) {
                        shape.maxFontSize = fontSize;
                        break;
                    }
                    fontSize -= 1;
                    ctx.font = `${fontSize}px ${shape.fontName ? shape.fontName : 'Arial'}`;
                }
            }
            // 设置字体样式
            ctx.font = `${fontSize}px ${shape.fontName ? shape.fontName : 'Arial'}`;
            ctx.textBaseline = 'top';

            // 计算位置
            const positions = [];
            for (let i = 0; i < texts.length; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = shape.x + padding + col * (cellWidth + cellPadding);
                const y = shape.y + padding + row * (cellHeight + cellPadding);
                positions.push({ x, y });
            }
            shape.mark = [];
            // 渲染文字
            for (let i = 0; i < texts.length; i++) {
                const { x, y } = positions[i];
                const lines = texts[i].split('\n');
                const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
                const totalHeight = lines.length * fontSize;
                const offsetX = (cellWidth - maxWidth) / 2;
                const offsetY = (cellHeight - totalHeight) / 2;
                for (let j = 0; j < lines.length; j++) {
                    const lineWidth = ctx.measureText(lines[j]).width;
                    ctx.fillText(lines[j], x + (cellWidth - lineWidth) / 2, y + offsetY + j * fontSize);
                    shape.mark.push({
                        x: x + (cellWidth - lineWidth) / 2,
                        y: y + offsetY + j * fontSize,
                        width: lineWidth,
                        height: fontSize,
                        text: lines[j],
                        fontSize: fontSize,
                        fontName: shape.fontName ? shape.fontName : 'Arial',
                        fontFamily: shape.fontFamily ? shape.fontFamily : ''
                    });
                }
            }
        })
        ctx.restore();
    }
    drawShapeSizeText() {
        const { operateCanvasRef, shapeList, virtualScale, backgroundImagePosition, showShapeSizeText } = this.communicator.data;
        if (!showShapeSizeText) { return; }
        if (operateCanvasRef == null) { return; }
        if (shapeList == null) { return; }
        console.log('drawShapeSizeText');
        const ctx = operateCanvasRef.getContext('2d');
        ctx.save();
        ctx.translate(backgroundImagePosition.x, backgroundImagePosition.y);
        ctx.scale(virtualScale, virtualScale);

        shapeList.forEach(item => {
            item.calculateAndStoreShapeSizeText();
            item.shapeSizeText.forEach(sitem => {
                const { x, y, text } = sitem;

                // 设置文字阴影
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.shadowBlur = 4;

                // 测量文字宽度和高度
                ctx.font = '12px Arial';
                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const textHeight = 12; // 12px Arial 的大致高度

                // 绘制文字背景
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.fillRect(x - textWidth / 2 - 2, y - textHeight / 2 - 2, textWidth + 4, textHeight + 4);

                // 绘制文字
                ctx.fillStyle = "black";
                ctx.fillText(text, x - textWidth / 2, y + textHeight / 4);
            })
        });

        ctx.restore();
    }

    clear() {

    }
}


export default RendererUtil;