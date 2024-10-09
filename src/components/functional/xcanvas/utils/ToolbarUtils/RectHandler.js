import ShapeBase from "./ShapeBase";
class RectHandler extends ShapeBase {
    constructor(...args) {
        super(...args);
        this.dragging = false;
        this.dragDirection = '';
    }
    handleMouseDown(event) {
        const { rendererUtil, shapeList, hotkey } = this.communicator.data;

        //取消其他选中的形状
        shapeList.forEach(shape => {
            shape.active = false;
            if (shape.selected) {
                shape.setInitialPosition(); //设置初始位置
            }
        });

        //如果没有其他选中的形状，则取消选中当前形状
        if (this.selected) {
            const selectedShape = shapeList.filter(shape => shape.selected);
            if (selectedShape.length <= 1) {
                this.selected = false;
            }
        }

        console.log(hotkey.Control, this.selected)
        if (hotkey.Control) {
            this.selected = !this.selected;
        } else {
            this.active = true;
        }
        this.dragging = true;
        this.dragStart = event;
        this.dragStartRect = { x: this.x, y: this.y, width: this.width, height: this.height };
        this.dragDirection = this.getCursorStyle(event.x, event.y);
        this.calculateDistanceLines();
        this.calculateAlignmentLines(false);
        rendererUtil.render();
        // 处理 mousedown 事件
    }

    handleMouseMove(event) {
        const { operateCanvasRef } = this.communicator.data;
        operateCanvasRef.style.cursor = 'pointer';
        if (!this.active) {
            return;
        }
        const cursorStyle = this.getCursorStyle(event.x, event.y);
        operateCanvasRef.style.cursor = cursorStyle;
        if (this.dragging && this.dragDirection !== 'pointer') {
            this.resizeRect(event, this.dragDirection);
        }
        if (this.dragging && this.dragDirection === 'pointer') {
            this.moveRectPosition(event);
            this.calculateDistanceLines();
        }

    }

    handleMouseUp(event) {
        this.dragging = false;
        super.handleMouseUp(event);
    }
    getCursorStyle(mouseX, mouseY) {
        const { x, y, width, height } = this;
        const handleSize = this.handleSize;

        // 定义把手区域
        const handles = [
            { x: x - handleSize / 2, y: y - handleSize / 2, cursor: 'nw-resize' }, // 左上
            { x: x + width - handleSize / 2, y: y - handleSize / 2, cursor: 'ne-resize' }, // 右上
            { x: x - handleSize / 2, y: y + height - handleSize / 2, cursor: 'sw-resize' }, // 左下
            { x: x + width - handleSize / 2, y: y + height - handleSize / 2, cursor: 'se-resize' }, // 右下
            { x: x + width / 2 - handleSize / 2, y: y - handleSize / 2, cursor: 'n-resize' }, // 上中
            { x: x + width / 2 - handleSize / 2, y: y + height - handleSize / 2, cursor: 's-resize' }, // 下中
            { x: x - handleSize / 2, y: y + height / 2 - handleSize / 2, cursor: 'w-resize' }, // 左中
            { x: x + width - handleSize / 2, y: y + height / 2 - handleSize / 2, cursor: 'e-resize' } // 右中
        ];

        // 检测鼠标是否在某个把手区域内
        for (const handle of handles) {
            if (
                mouseX >= handle.x &&
                mouseX <= handle.x + handleSize &&
                mouseY >= handle.y &&
                mouseY <= handle.y + handleSize
            ) {
                return handle.cursor;
            }
        }

        // 如果不在任何把手区域内，返回默认样式
        return 'pointer';
    }
    moveRectPosition(e) {
        const { showImageSize, shapeList } = this.communicator.data;
        const dx = e.x - this.dragStart.x;
        const dy = e.y - this.dragStart.y;

        // 计算新的位置
        let newX = this.dragStartRect.x + dx;
        let newY = this.dragStartRect.y + dy;

        // 移动区域限制，不能超出背景图区域
        if (newX < 0) {
            newX = 0;
        }
        if (newY < 0) {
            newY = 0;
        }
        if (newX + this.width > showImageSize.width) {
            newX = showImageSize.width - this.width;
        }
        if (newY + this.height > showImageSize.height) {
            newY = showImageSize.height - this.height;
        }

        // 更新所有 active 形状的位置
        shapeList.forEach(shape => {
            if (shape.selected) {
                let snewX = shape.dragStartRect.x + dx;
                let snewY = shape.dragStartRect.y + dy;

                // 限制形状移动范围，不能超出背景图区域
                if (snewX < 0) {
                    snewX = 0;
                }
                if (snewY < 0) {
                    snewY = 0;
                }
                if (snewX + shape.width > showImageSize.width) {
                    snewX = showImageSize.width - shape.width;
                }
                if (snewY + shape.height > showImageSize.height) {
                    snewY = showImageSize.height - shape.height;
                }
                shape.x = snewX;
                shape.y = snewY;
            }
        });

        // 更新选择框的位置
        this.x = newX;
        this.y = newY;
        // 计算对齐线并应用吸附效果
        this.calculateAlignmentLines();
        this.communicator.data.rendererUtil.render();
    }

    resizeRect(e, handle) {
        const { showImageSize } = this.communicator.data;
        const dx = e.x - this.dragStart.x;
        const dy = e.y - this.dragStart.y;
        const { x, y, width, height } = this.dragStartRect;

        let newX = x;
        let newY = y;
        let newWidth = width;
        let newHeight = height;

        switch (handle) {
            case 'nw-resize':
                newX = x + dx;
                newY = y + dy;
                newWidth = width - dx;
                newHeight = height - dy;
                break;
            case 'ne-resize':
                newY = y + dy;
                newWidth = width + dx;
                newHeight = height - dy;
                break;
            case 'sw-resize':
                newX = x + dx;
                newWidth = width - dx;
                newHeight = height + dy;
                break;
            case 'se-resize':
                newWidth = width + dx;
                newHeight = height + dy;
                break;
            case 'n-resize':
                newY = y + dy;
                newHeight = height - dy;
                break;
            case 's-resize':
                newHeight = height + dy;
                break;
            case 'w-resize':
                newX = x + dx;
                newWidth = width - dx;
                break;
            case 'e-resize':
                newWidth = width + dx;
                break;
        }

        // 限制最小宽度和高度
        newWidth = Math.max(newWidth, 25);
        newHeight = Math.max(newHeight, 25);

        // 限制矩形在背景图内
        if (newX < 0) {
            newWidth += newX;
            newX = 0;
        }
        if (newY < 0) {
            newHeight += newY;
            newY = 0;
        }
        if (newX + newWidth > showImageSize.width) {
            newWidth = showImageSize.width - newX;
        }
        if (newY + newHeight > showImageSize.height) {
            newHeight = showImageSize.height - newY;
        }

        // 更新矩形的位置和大小
        this.x = newX;
        this.y = newY;
        this.width = newWidth;
        this.height = newHeight;

        this.communicator.data.rendererUtil.render();
    }
    setInitialPosition() {
        this.dragStartRect = { x: this.x, y: this.y, width: this.width, height: this.height };
    }
    // 计算矩形与其他形状之间的距离
    calculateDistanceLines() {
        const { showImageSize, shapeList, backgroundImagePosition, virtualScale, pxToMm } = this.communicator.data;
        this.distanceLines = [];

        // 计算矩形在实际显示中的位置和尺寸
        const rectX = this.x * virtualScale + backgroundImagePosition.x;
        const rectY = this.y * virtualScale + backgroundImagePosition.y;
        const rectWidth = this.width * virtualScale;
        const rectHeight = this.height * virtualScale;

        // 初始化光线终点为背景图片边缘
        let closestLines = {
            top: { x: rectX + rectWidth / 2, y: backgroundImagePosition.y },
            bottom: { x: rectX + rectWidth / 2, y: backgroundImagePosition.y + showImageSize.height * virtualScale },
            left: { x: backgroundImagePosition.x, y: rectY + rectHeight / 2 },
            right: { x: backgroundImagePosition.x + showImageSize.width * virtualScale, y: rectY + rectHeight / 2 }
        };

        // 定义一个辅助函数来检测光线与矩形的边缘碰撞
        const checkIntersection = (lineStart, lineEnd, rect) => {
            const intersections = [];

            const rectLines = [
                { start: { x: rect.x, y: rect.y }, end: { x: rect.x + rect.width, y: rect.y } }, // top
                { start: { x: rect.x, y: rect.y + rect.height }, end: { x: rect.x + rect.width, y: rect.y + rect.height } }, // bottom
                { start: { x: rect.x, y: rect.y }, end: { x: rect.x, y: rect.y + rect.height } }, // left
                { start: { x: rect.x + rect.width, y: rect.y }, end: { x: rect.x + rect.width, y: rect.y + rect.height } } // right
            ];

            rectLines.forEach(rectLine => {
                const denom = (rectLine.end.x - rectLine.start.x) * (lineEnd.y - lineStart.y) - (rectLine.end.y - rectLine.start.y) * (lineEnd.x - lineStart.x);
                if (denom !== 0) {
                    const ua = ((rectLine.end.y - rectLine.start.y) * (lineStart.x - rectLine.start.x) - (rectLine.end.x - rectLine.start.x) * (lineStart.y - rectLine.start.y)) / denom;
                    const ub = ((lineEnd.y - lineStart.y) * (lineStart.x - rectLine.start.x) - (lineEnd.x - lineStart.x) * (lineStart.y - rectLine.start.y)) / denom;
                    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
                        const intersection = {
                            x: lineStart.x + ua * (lineEnd.x - lineStart.x),
                            y: lineStart.y + ua * (lineEnd.y - lineStart.y)
                        };
                        intersections.push(intersection);
                    }
                }
            });

            return intersections;
        };

        // 检查每个方向上的光线与其他形状的碰撞
        shapeList.forEach(shape => {
            if (shape !== this) {
                const shapeX = shape.x * virtualScale + backgroundImagePosition.x;
                const shapeY = shape.y * virtualScale + backgroundImagePosition.y;
                const shapeWidth = shape.width * virtualScale;
                const shapeHeight = shape.height * virtualScale;

                const shapeRect = { x: shapeX, y: shapeY, width: shapeWidth, height: shapeHeight };

                // 左侧光线
                const leftIntersections = checkIntersection(
                    { x: rectX, y: rectY + rectHeight / 2 },
                    { x: backgroundImagePosition.x, y: rectY + rectHeight / 2 },
                    shapeRect
                );
                leftIntersections.forEach(intersection => {
                    const distance = rectX - intersection.x;
                    if (distance < rectX - closestLines.left.x) {
                        closestLines.left = intersection;
                    }
                });

                // 右侧光线
                const rightIntersections = checkIntersection(
                    { x: rectX + rectWidth, y: rectY + rectHeight / 2 },
                    { x: backgroundImagePosition.x + showImageSize.width * virtualScale, y: rectY + rectHeight / 2 },
                    shapeRect
                );
                rightIntersections.forEach(intersection => {
                    const distance = intersection.x - (rectX + rectWidth);
                    if (distance < closestLines.right.x - (rectX + rectWidth)) {
                        closestLines.right = intersection;
                    }
                });

                // 上侧光线
                const topIntersections = checkIntersection(
                    { x: rectX + rectWidth / 2, y: rectY },
                    { x: rectX + rectWidth / 2, y: backgroundImagePosition.y },
                    shapeRect
                );
                topIntersections.forEach(intersection => {
                    const distance = rectY - intersection.y;
                    if (distance < rectY - closestLines.top.y) {
                        closestLines.top = intersection;
                    }
                });

                // 下侧光线
                const bottomIntersections = checkIntersection(
                    { x: rectX + rectWidth / 2, y: rectY + rectHeight },
                    { x: rectX + rectWidth / 2, y: backgroundImagePosition.y + showImageSize.height * virtualScale },
                    shapeRect
                );
                bottomIntersections.forEach(intersection => {
                    const distance = intersection.y - (rectY + rectHeight);
                    if (distance < closestLines.bottom.y - (rectY + rectHeight)) {
                        closestLines.bottom = intersection;
                    }
                });
            }
        });

        // 计算最终距离并保留两位小数
        const distances = {
            top: pxToMm((rectY - closestLines.top.y) / virtualScale).toFixed(2),
            bottom: pxToMm((closestLines.bottom.y - (rectY + rectHeight)) / virtualScale).toFixed(2),
            left: pxToMm((rectX - closestLines.left.x) / virtualScale).toFixed(2),
            right: pxToMm((closestLines.right.x - (rectX + rectWidth)) / virtualScale).toFixed(2)
        };
        // 保存距离线和文本信息
        this.distanceLines.push(
            { type: 'vertical', start: { x: rectX + rectWidth / 2, y: rectY }, end: { x: rectX + rectWidth / 2, y: closestLines.top.y }, distance: distances.top },
            { type: 'vertical', start: { x: rectX + rectWidth / 2, y: rectY + rectHeight }, end: { x: rectX + rectWidth / 2, y: closestLines.bottom.y }, distance: distances.bottom },
            { type: 'horizontal', start: { x: rectX, y: rectY + rectHeight / 2 }, end: { x: closestLines.left.x, y: rectY + rectHeight / 2 }, distance: distances.left },
            { type: 'horizontal', start: { x: rectX + rectWidth, y: rectY + rectHeight / 2 }, end: { x: closestLines.right.x, y: rectY + rectHeight / 2 }, distance: distances.right }
        );

        this.communicator.data.distanceLines = this.distanceLines;
        this.communicator.data.rendererUtil.render();
    }

    checkProximity() {
        const { shapeList, pxToMm } = this.communicator.data;
        // 遍历所有选中的形状，检测它们与其他形状之间的距离
        this.proximityWarning = false; // 初始化警告标识参数
        shapeList.forEach(shape => {
            if (shape === this) {
                return;
            }
            const distance = this.getDistanceBetweenShapes(shape, this);
            if (pxToMm(distance) < this.distanceThreshold) {
                this.proximityWarning = true;
                return;
            }
        });
    }

    // 计算两个形状之间的最小距离
    getDistanceBetweenShapes(shape1, shape2) {
        const xDist = Math.max(0, Math.abs(shape1.x - shape2.x) - (shape1.width + shape2.width) / 2);
        const yDist = Math.max(0, Math.abs(shape1.y - shape2.y) - (shape1.height + shape2.height) / 2);
        return Math.sqrt(xDist * xDist + yDist * yDist);
    }

    calculateAlignmentLines(isSnap = true) {
        if (!this.active || this.selected) {
            this.communicator.data.alignmentLines = []; return;
        }

        const { shapeList, virtualScale, backgroundImagePosition, snapThreshold, hotkey } = this.communicator.data;
        const shiftKey = hotkey.Shift;
        //动态吸附阈值
        let snapThresholdSwitch = (shiftKey || !isSnap) ? 1 : snapThreshold;
        this.alignmentLines = [];

        // 计算矩形在实际显示中的位置和尺寸
        let rectX = this.x * virtualScale + backgroundImagePosition.x;
        let rectY = this.y * virtualScale + backgroundImagePosition.y;
        let rectWidth = this.width * virtualScale;
        let rectHeight = this.height * virtualScale;

        let snapped = false;

        // 遍历所有形状，检测是否对齐
        shapeList.forEach(shape => {
            if (shape !== this) {
                const shapeX = shape.x * virtualScale + backgroundImagePosition.x;
                const shapeY = shape.y * virtualScale + backgroundImagePosition.y;
                const shapeWidth = shape.width * virtualScale;
                const shapeHeight = shape.height * virtualScale;

                // 检测垂直对齐
                if (Math.abs(rectX - shapeX) < snapThresholdSwitch) {
                    this.alignmentLines.push({ type: 'vertical', x: shapeX, y1: Math.min(rectY, shapeY), y2: Math.max(rectY + rectHeight, shapeY + shapeHeight) });
                    if ((!shiftKey && isSnap)) {
                        rectX = shapeX;
                        this.x = (shapeX - backgroundImagePosition.x) / virtualScale; // 吸附
                        snapped = true;
                    }
                }
                if (Math.abs(rectX + rectWidth - (shapeX + shapeWidth)) < snapThresholdSwitch) {
                    this.alignmentLines.push({ type: 'vertical', x: shapeX + shapeWidth, y1: Math.min(rectY, shapeY), y2: Math.max(rectY + rectHeight, shapeY + shapeHeight) });
                    if ((!shiftKey && isSnap)) {
                        rectX = shapeX + shapeWidth - rectWidth;
                        this.x = (rectX - backgroundImagePosition.x) / virtualScale; // 吸附
                        snapped = true;
                    }

                }

                // 检测水平对齐
                if (Math.abs(rectY - shapeY) < snapThresholdSwitch) {
                    this.alignmentLines.push({ type: 'horizontal', x1: Math.min(rectX, shapeX), x2: Math.max(rectX + rectWidth, shapeX + shapeWidth), y: shapeY });
                    if ((!shiftKey && isSnap)) {
                        rectY = shapeY;
                        this.y = (shapeY - backgroundImagePosition.y) / virtualScale; // 吸附
                        snapped = true;
                    }
                }
                if (Math.abs(rectY + rectHeight - (shapeY + shapeHeight)) < snapThresholdSwitch) {
                    this.alignmentLines.push({ type: 'horizontal', x1: Math.min(rectX, shapeX), x2: Math.max(rectX + rectWidth, shapeX + shapeWidth), y: shapeY + shapeHeight });
                    if ((!shiftKey && isSnap)) {
                        rectY = shapeY + shapeHeight - rectHeight;
                        this.y = (rectY - backgroundImagePosition.y) / virtualScale; // 吸附
                        snapped = true;
                    }
                }
            }
        });

        // 如果吸附了，重新计算对齐线
        if (snapped && isSnap) {
            this.alignmentLines = [];
            shapeList.forEach(shape => {
                if (shape !== this) {
                    const shapeX = shape.x * virtualScale + backgroundImagePosition.x;
                    const shapeY = shape.y * virtualScale + backgroundImagePosition.y;
                    const shapeWidth = shape.width * virtualScale;
                    const shapeHeight = shape.height * virtualScale;

                    // 检测垂直对齐
                    if (Math.abs(rectX - shapeX) < 1) {
                        this.alignmentLines.push({ type: 'vertical', x: shapeX, y1: Math.min(rectY, shapeY), y2: Math.max(rectY + rectHeight, shapeY + shapeHeight) });
                    }
                    if (Math.abs(rectX + rectWidth - (shapeX + shapeWidth)) < 1) {
                        this.alignmentLines.push({ type: 'vertical', x: shapeX + shapeWidth, y1: Math.min(rectY, shapeY), y2: Math.max(rectY + rectHeight, shapeY + shapeHeight) });
                    }

                    // 检测水平对齐
                    if (Math.abs(rectY - shapeY) < 1) {
                        this.alignmentLines.push({ type: 'horizontal', x1: Math.min(rectX, shapeX), x2: Math.max(rectX + rectWidth, shapeX + shapeWidth), y: shapeY });
                    }
                    if (Math.abs(rectY + rectHeight - (shapeY + shapeHeight)) < 1) {
                        this.alignmentLines.push({ type: 'horizontal', x1: Math.min(rectX, shapeX), x2: Math.max(rectX + rectWidth, shapeX + shapeWidth), y: shapeY + shapeHeight });
                    }
                }
            });
        }

        this.communicator.data.alignmentLines = this.alignmentLines;
        this.communicator.data.rendererUtil.render();
    }
    calculateAndStoreShapeSizeText() {
        const { virtualScale, pxToMm } = this.communicator.data;

        // 计算矩形的边框长度（以毫米为单位）
        const widthMm = pxToMm(this.width).toFixed(2);
        const heightMm = pxToMm(this.height).toFixed(2);

        // 计算文本显示位置（边框中间位置）
        const positions = [
            { x: this.x + this.width / 2, y: this.y - 10, text: `${widthMm} mm` }, // 上边框中间
            { x: this.x + this.width / 2, y: this.y + this.height + 10, text: `${widthMm} mm` }, // 下边框中间
            { x: this.x - 10, y: this.y + this.height / 2, text: `${heightMm} mm` }, // 左边框中间
            { x: this.x + this.width + 10, y: this.y + this.height / 2, text: `${heightMm} mm` } // 右边框中间
        ];

        // 保存到 this.communicator.data.shapeSizeText 数组中
        this.shapeSizeText = positions;
    }


}

export default RectHandler;