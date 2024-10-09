class DistanceDrawer {
    constructor(pxToMmFunc, revealAreas, selectedGameArea) {
        this.pxToMm = pxToMmFunc;
        this.revealAreas = revealAreas;
        this.selectedGameArea = selectedGameArea;
    }
    // 绘制距离线的方法
    drawDistanceLines(canvasRef, scale, area) {
        const ctx = canvasRef.value.getContext('2d');
        ctx.strokeStyle = 'blue';
        ctx.fillStyle = 'blue';
        ctx.font = '12px Arial';
        ctx.lineWidth = 1;

        const paddingX = 5;  // 文本框的水平内边距
        const paddingY = 3;  // 文本框的垂直内边距
        const edges = [
            { side: 'top', x1: area.x * scale + area.width * scale / 2, y1: area.y * scale, x2: area.x * scale + area.width * scale / 2, y2: 0 },
            { side: 'bottom', x1: area.x * scale + area.width * scale / 2, y1: (area.y + area.height) * scale, x2: area.x * scale + area.width * scale / 2, y2: canvasRef.value.height },
            { side: 'left', x1: area.x * scale, y1: area.y * scale + area.height * scale / 2, x2: 0, y2: area.y * scale + area.height * scale / 2 },
            { side: 'right', x1: (area.x + area.width) * scale, y1: area.y * scale + area.height * scale / 2, x2: canvasRef.value.width, y2: area.y * scale + area.height * scale / 2 }
        ];
        // 遍历每条边，计算与其他区域的距离
        edges.forEach(edge => {
            let closestIntersection = null;  // 最近的交点
            let closestDistance = Infinity;  // 最近的距离
            let closestOtherArea = null;  // 最近的其他区域
            let areas = this.selectedGameArea.value ? this.selectedGameArea.value.areas : this.revealAreas.value;
            areas.forEach(otherArea => {
                 // 排除当前处理的区域
                if (otherArea !== area) {
                    // 获取当前边与其他区域的交点
                    const intersections = this.getIntersections(edge, otherArea, scale);
                    intersections.forEach(intersection => {
                        const distance = this.getDistance(edge.x1, edge.y1, intersection.x, intersection.y);
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestIntersection = intersection;
                            closestOtherArea = otherArea;
                        }
                    });
                }
            });


            ctx.beginPath();
            ctx.moveTo(edge.x1, edge.y1);
            if (closestIntersection) {
                ctx.lineTo(closestIntersection.x, closestIntersection.y);
                edge.label = `${this.pxToMm(closestDistance / scale).toFixed(2)} mm`;
            } else {
                ctx.lineTo(edge.x2, edge.y2);
                const distance = edge.side === 'top' || edge.side === 'bottom' ? Math.abs(edge.y1 - edge.y2) : Math.abs(edge.x1 - edge.x2);
                edge.label = `${this.pxToMm(distance / scale).toFixed(2)} mm`;
            }
            ctx.stroke();

            const textWidth = ctx.measureText(edge.label).width;
            const textHeight = 12;

            const textX = (edge.x1 + (closestIntersection ? closestIntersection.x : edge.x2)) / 2 - textWidth / 2 - paddingX;
            const textY = (edge.y1 + (closestIntersection ? closestIntersection.y : edge.y2)) / 2 - textHeight / 2 - paddingY;

            ctx.fillStyle = 'white';
            ctx.fillRect(textX, textY, textWidth + 2 * paddingX, textHeight + 2 * paddingY);

            ctx.strokeStyle = 'black';
            ctx.strokeRect(textX, textY, textWidth + 2 * paddingX, textHeight + 2 * paddingY);

            ctx.fillStyle = 'black';
            ctx.fillText(edge.label, textX + paddingX, textY + textHeight + paddingY / 2);
        });
    }

    //获取线段和矩形的交点
    getIntersections = (line, rect, scale) => {
        const intersections = [];
        //矩形的四条边
        const rectLines = [
            { x1: rect.x * scale, y1: rect.y * scale, x2: (rect.x + rect.width) * scale, y2: rect.y * scale }, // Top
            { x1: rect.x * scale, y1: (rect.y + rect.height) * scale, x2: (rect.x + rect.width) * scale, y2: (rect.y + rect.height) * scale }, // Bottom
            { x1: rect.x * scale, y1: rect.y * scale, x2: rect.x * scale, y2: (rect.y + rect.height) * scale }, // Left
            { x1: (rect.x + rect.width) * scale, y1: rect.y * scale, x2: (rect.x + rect.width) * scale, y2: (rect.y + rect.height) * scale } // Right
        ];
        //遍历矩形的四条边，找到和线段相交的边
        rectLines.forEach(rectLine => {
            const intersection = this.getLineIntersection(line, rectLine);
            if (intersection) {
                intersections.push(intersection);
            }
        });

        return intersections;
    };

    //获取两条线段的交点
    getLineIntersection = (line1, line2) => {
        const { x1: x1, y1: y1, x2: x2, y2: y2 } = line1;
        const { x1: x3, y1: y3, x2: x4, y2: y4 } = line2;

        // 两条线段的斜率
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return null; // 平行

        // 交点的坐标
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        // 如果交点在两条线段上，则返回交点坐标
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }

        return null;
    };

    //获取两点之间的距离
    getDistance = (x1, y1, x2, y2) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };


}

export default DistanceDrawer;