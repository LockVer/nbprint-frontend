class DistanceDrawer {
    constructor(pxToMmFunc, revealAreas) {
        this.pxToMm = pxToMmFunc;
        this.revealAreas = revealAreas;
    }

    drawDistanceLines(canvasRef, scale, area) {
        const ctx = canvasRef.value.getContext('2d');
        ctx.strokeStyle = 'blue';
        ctx.fillStyle = 'blue';
        ctx.font = '12px Arial';
        ctx.lineWidth = 1;

        const paddingX = 5;
        const paddingY = 3;

        const edges = [
            { side: 'top', x1: area.x * scale + area.width * scale / 2, y1: area.y * scale, x2: area.x * scale + area.width * scale / 2, y2: 0 },
            { side: 'bottom', x1: area.x * scale + area.width * scale / 2, y1: (area.y + area.height) * scale, x2: area.x * scale + area.width * scale / 2, y2: canvasRef.value.height },
            { side: 'left', x1: area.x * scale, y1: area.y * scale + area.height * scale / 2, x2: 0, y2: area.y * scale + area.height * scale / 2 },
            { side: 'right', x1: (area.x + area.width) * scale, y1: area.y * scale + area.height * scale / 2, x2: canvasRef.value.width, y2: area.y * scale + area.height * scale / 2 }
        ];

        edges.forEach(edge => {
            let closestIntersection = null;
            let closestDistance = Infinity;
            let closestOtherArea = null;

            this.revealAreas.forEach(otherArea => {
                if (otherArea !== area) {
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

    getIntersections(line, rect, scale) {
        const intersections = [];
        const rectLines = [
            { x1: rect.x * scale, y1: rect.y * scale, x2: (rect.x + rect.width) * scale, y2: rect.y * scale },
            { x1: rect.x * scale, y1: (rect.y + rect.height) * scale, x2: (rect.x + rect.width) * scale, y2: (rect.y + rect.height) * scale },
            { x1: rect.x * scale, y1: rect.y * scale, x2: rect.x * scale, y2: (rect.y + rect.height) * scale },
            { x1: (rect.x + rect.width) * scale, y1: rect.y * scale, x2: (rect.x + rect.width) * scale, y2: (rect.y + rect.height) * scale }
        ];

        rectLines.forEach(rectLine => {
            const intersection = this.getLineIntersection(line, rectLine);
            if (intersection) {
                intersections.push(intersection);
            }
        });

        return intersections;
    }

    getLineIntersection(line1, line2) {
        const { x1, y1, x2, y2 } = line1;
        const { x1: x3, y1: y3, x2: x4, y2: y4 } = line2;

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return null;

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }

        return null;
    }

    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
}

export default DistanceDrawer;