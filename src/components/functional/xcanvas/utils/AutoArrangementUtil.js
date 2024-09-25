class AutoArrangementUtil {
    constructor(communicator) {
        this.communicator = communicator;
    }

    // 水平排列
    arrangeShapes() {
        const { shapeList, showImageSize, actualScale, mmToPx, minGridSize } = this.communicator.data;
        const selectedShapes = shapeList.filter(shape => shape.selected);

        if (selectedShapes.length === 0) {
            return;
        }

        // 间距 6mm 转换为像素值
        const spacing = mmToPx(minGridSize);

        // 找到最左边的矩形作为基准
        let baseShape = selectedShapes[0];
        selectedShapes.forEach(shape => {
            if (shape.x < baseShape.x || (shape.x === baseShape.x && shape.y < baseShape.y)) {
                baseShape = shape;
            }
        });

        // 基准位置
        let baseX = baseShape.x;
        let baseY = baseShape.y;

        // 当前行的起始位置
        let currentX = baseX;
        let currentY = baseY;
        let maxHeightInRow = 0;

        selectedShapes.forEach(shape => {
            // 如果当前行放不下当前形状，则换行
            if (currentX + shape.width > showImageSize.width) {
                currentX = baseX;
                currentY += maxHeightInRow + spacing;
                maxHeightInRow = 0;
            }

            // 如果换行后超出背景图区域，则停止排列
            if (currentY + shape.height > showImageSize.height) {
                return;
            }

            // 更新形状位置
            shape.x = currentX;
            shape.y = currentY;

            // 更新当前行的最大高度
            maxHeightInRow = Math.max(maxHeightInRow, shape.height);

            // 更新下一个形状的起始位置
            currentX += shape.width + spacing;
        });

        // 重新渲染
        this.communicator.data.rendererUtil.render();
    }

    // 垂直排列
    arrangeShapesVertically() {
        const { shapeList, showImageSize, actualScale, mmToPx, minGridSize } = this.communicator.data;
        const selectedShapes = shapeList.filter(shape => shape.selected);

        if (selectedShapes.length === 0) {
            return;
        }

        // 间距 6mm 转换为像素值
        const spacing = mmToPx(minGridSize);

        // 找到最上边的矩形作为基准
        let baseShape = selectedShapes[0];
        selectedShapes.forEach(shape => {
            if (shape.y < baseShape.y || (shape.y === baseShape.y && shape.x < baseShape.x)) {
                baseShape = shape;
            }
        });

        // 基准位置
        let baseX = baseShape.x;
        let baseY = baseShape.y;

        // 当前列的起始位置
        let currentX = baseX;
        let currentY = baseY;
        let maxWidthInColumn = 0;

        selectedShapes.forEach(shape => {
            // 如果当前列放不下当前形状，则换列
            if (currentY + shape.height > showImageSize.height) {
                currentY = baseY;
                currentX += maxWidthInColumn + spacing;
                maxWidthInColumn = 0;
            }

            // 如果换列后超出背景图区域，则停止排列
            if (currentX + shape.width > showImageSize.width) {
                return;
            }

            // 更新形状位置
            shape.x = currentX;
            shape.y = currentY;

            // 更新当前列的最大宽度
            maxWidthInColumn = Math.max(maxWidthInColumn, shape.width);

            // 更新下一个形状的起始位置
            currentY += shape.height + spacing;
        });

        // 重新渲染
        this.communicator.data.rendererUtil.render();
    }

    // 顶部对齐
    alignTop() {
        const { shapeList } = this.communicator.data;
        const selectedShapes = shapeList.filter(shape => shape.selected);

        if (selectedShapes.length === 0) {
            return;
        }

        const topY = Math.min(...selectedShapes.map(shape => shape.y));

        selectedShapes.forEach(shape => {
            shape.y = topY;
        });

        this.communicator.data.rendererUtil.render();
    }

    // 底部对齐
    alignBottom() {
        const { shapeList } = this.communicator.data;
        const selectedShapes = shapeList.filter(shape => shape.selected);

        if (selectedShapes.length === 0) {
            return;
        }

        const bottomY = Math.max(...selectedShapes.map(shape => shape.y + shape.height));

        selectedShapes.forEach(shape => {
            shape.y = bottomY - shape.height;
        });

        this.communicator.data.rendererUtil.render();
    }

    // 水平居中（以最左边的形状为基准）
    alignHorizontalCenter() {
        const { shapeList } = this.communicator.data;
        const selectedShapes = shapeList.filter(shape => shape.selected);

        if (selectedShapes.length === 0) {
            return;
        }

        const topY = Math.min(...selectedShapes.map(shape => shape.y));
        const bottomY = Math.max(...selectedShapes.map(shape => shape.y + shape.height));
        const centerY = (topY + bottomY) / 2;

        selectedShapes.forEach(shape => {
            shape.y = centerY - shape.height / 2;
        });

        this.communicator.data.rendererUtil.render();

    }

    // 左对齐
    alignLeft() {
        const { shapeList } = this.communicator.data;
        const selectedShapes = shapeList.filter(shape => shape.selected);

        if (selectedShapes.length === 0) {
            return;
        }

        const leftX = Math.min(...selectedShapes.map(shape => shape.x));

        selectedShapes.forEach(shape => {
            shape.x = leftX;
        });

        this.communicator.data.rendererUtil.render();
    }

    // 右对齐
    alignRight() {
        const { shapeList } = this.communicator.data;
        const selectedShapes = shapeList.filter(shape => shape.selected);

        if (selectedShapes.length === 0) {
            return;
        }

        const rightX = Math.max(...selectedShapes.map(shape => shape.x + shape.width));

        selectedShapes.forEach(shape => {
            shape.x = rightX - shape.width;
        });

        this.communicator.data.rendererUtil.render();
    }

    // 垂直居中（以最上边的形状为基准）
    alignVerticalCenter() {
        const { shapeList } = this.communicator.data;
        const selectedShapes = shapeList.filter(shape => shape.selected);

        if (selectedShapes.length === 0) {
            return;
        }

        const leftX = Math.min(...selectedShapes.map(shape => shape.x));
        const rightX = Math.max(...selectedShapes.map(shape => shape.x + shape.width));
        const centerX = (leftX + rightX) / 2;

        selectedShapes.forEach(shape => {
            shape.x = centerX - shape.width / 2;
        });

        this.communicator.data.rendererUtil.render();
    }
}

export default AutoArrangementUtil;
