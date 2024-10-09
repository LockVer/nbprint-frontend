class CanvasRenderer {
    constructor(options) {
        // 初始化类属性
        this.scale = options.scale;
        this.mode = options.mode;
        this.activeArea = options.activeArea;
        this.revealAreas = options.revealAreas; // 所有显示区域
        this.selectedAreas = options.selectedAreas;
        this.alignLine = options.alignLine;
        this.selectedGameArea = options.selectedGameArea;
        this.backgroundImageUrl = options.backgroundImageUrl;
        this.canvasRef = options.canvasRef;
        this.editorRef = options.editorRef;
        this.mmToPx = options.mmToPx;
        this.pxToMm = options.pxToMm;
        this.drawDistanceLines = options.drawDistanceLines;
    }

    // 加载图片
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img); // 加载成功
            img.onerror = reject; // 加载失败
            img.src = src;
        });
    }

    // 绘制canvas
    async drawCanvas() {
        if (!this.canvasRef.value || !this.editorRef.value) {
            console.error('Canvas or editor not mounted yet');
            return;
        }
        const ctx = this.canvasRef.value.getContext('2d');
        if (this.backgroundImageUrl) {
            const img = await this.loadImage(this.backgroundImageUrl);
            const editorWidth = this.editorRef.value.clientWidth;
            const editorHeight = this.editorRef.value.clientHeight;
            this.scale.value = Math.min(editorWidth / img.width, editorHeight / img.height);
            this.canvasRef.value.width = img.width * this.scale.value;
            this.canvasRef.value.height = img.height * this.scale.value;
            // 绘制背景图片
            ctx.drawImage(img, 0, 0, this.canvasRef.value.width, this.canvasRef.value.height);
        }
        // 绘制区域和文本
        this.renderAreas(ctx);
        this.renderAlignLines(ctx);
        if (this.activeArea.value) {
            this.drawDistanceLines(this.canvasRef, this.scale.value, this.activeArea.value);
        }
    }
    // 渲染区域
    renderAreas(ctx) {
        switch (this.mode.value) {
            case 'create':
                this.createModeRenderAreas(ctx);
                break;
            case 'select':
                this.selectModeRenderAreas(ctx);
                break;
        }
    }

    createModeRenderAreas(ctx) {
        this.revealAreas.value.forEach(area => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(area.x * this.scale.value, area.y * this.scale.value, area.width * this.scale.value, area.height * this.scale.value);
            ctx.strokeStyle = area === this.activeArea.value ? 'red' : '#FFF';
            ctx.strokeRect(area.x * this.scale.value, area.y * this.scale.value, area.width * this.scale.value, area.height * this.scale.value);
        });
    }
    selectModeRenderAreas(ctx) {


        if (this.selectedGameArea.value) {
            this.selectedGameArea.value.areas.forEach(area => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 设置填充颜色
                ctx.fillRect(area.x * this.scale.value, area.y * this.scale.value, area.width * this.scale.value, area.height * this.scale.value); // 绘制矩形
                ctx.strokeStyle = area === this.activeArea.value ? 'red' : '#FFF'; // 设置边框颜色
                ctx.strokeRect(area.x * this.scale.value, area.y * this.scale.value, area.width * this.scale.value, area.height * this.scale.value); // 绘制边框矩形
                if (area.drawData) {
                    this.renderRangeText(area, area.drawData); // 渲染文本
                }
            });
        } else {
            this.revealAreas.value.forEach(area => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(area.x * this.scale.value, area.y * this.scale.value, area.width * this.scale.value, area.height * this.scale.value);
                ctx.strokeStyle = area === this.activeArea.value ? 'red' : '#FFF';
                ctx.strokeRect(area.x * this.scale.value, area.y * this.scale.value, area.width * this.scale.value, area.height * this.scale.value);
            });
        }
        //如果有选中的游戏区，则不可选中其他区域
        if (this.selectedGameArea.value) {
            this.selectedAreas.value = [];
        }
        if (this.selectedAreas.value) {
            ctx.strokeStyle = 'red';
            this.selectedAreas.value.forEach((area) => {
                ctx.strokeRect(area.x * this.scale.value, area.y * this.scale.value, area.width * this.scale.value, area.height * this.scale.value);
            });
        }
    }

    renderAlignLines(ctx) {
        if (this.alignLine.value) {
            ctx.fillStyle = 'red';
            this.alignLine.value.forEach(line => {
                ctx.fillRect(line.x * this.scale.value, line.y * this.scale.value, line.width, line.height);
            });
        }
    }

    async renderRangeText(area, rangeData) {
        const ctx = this.canvasRef.value.getContext('2d');
        let fontSize = 30; // 初始字体大小
        const minFontSize = 7; // 最小字体大小
        const padding = this.mmToPx(3); // 边界间距
        let columns = 1; // 初始列数
        const maxColumns = 3; // 最大列数
        let maxWidth = (area.width - 2 * padding) * this.scale.value / columns; // 最大宽度
        let sectionHeight; // 均分区域的高度

        ctx.textBaseline = 'middle'; // 设置文本基线为中间对齐
        ctx.fillStyle = 'white';

        let deawTextArea = [];
        for (let i = 0; i < rangeData.length; i++) {
            let fits = false;
            let text = rangeData[i];
            let textWidth, textHeight;

            // 重置列数和字体大小
            columns = 1;
            fontSize = 30;
            maxWidth = (area.width - 2 * padding) * this.scale.value / columns;

            // 尝试降低字体大小以适应区域
            while (!fits && columns <= maxColumns) {
                sectionHeight = ((area.height - 2 * padding) * this.scale.value / Math.ceil(rangeData.length / columns)); // 重新计算均分区域的高度
                while (fontSize >= minFontSize && !fits) {
                    ({ width: textWidth, height: textHeight } = this.measureText(ctx, text, fontSize));
                    if (textWidth <= maxWidth && textHeight <= sectionHeight) {
                        fits = true; // 文本适应当前区域
                    } else {
                        fontSize--; // 减小字体大小尝试再次适应
                    }
                }
                if (!fits && columns < maxColumns) {
                    columns++; // 增加列数
                    fontSize = 30; // 重置字体大小
                    maxWidth = (area.width - 2 * padding) * this.scale.value / columns; // 重新计算最大宽度
                } else {
                    break;
                }
            }

            if (!fits) {
                // 如果最小字体也不适应，则跳过当前文本
                ElMessageBox.alert('应用已经尽力自适应文本，但是奖符数量过多过长无法渲染，请调整文本或区域大小后重试！', '超出限制', {
                    confirmButtonText: '好的',
                });
                this.selectedGameArea.value.range.push(...this.activeArea.value.drawData); // 将奖符还给游戏区
                this.activeArea.value.drawData = [];
                break;
            }

            // 计算文本渲染位置
            const columnWidth = (area.width - 2 * padding) * this.scale.value / columns;
            const columnIndex = i % columns;
            const rowIndex = Math.floor(i / columns);
            const x = (area.x + padding) * this.scale.value + columnWidth * columnIndex + (columnWidth - textWidth) / 2; // 水平居中
            const y = (area.y + padding) * this.scale.value + sectionHeight * rowIndex + sectionHeight / 2; // 垂直居中
            ctx.fillText(text, x, y);
            // 保存绘制的文本区域并且恢复缩放比例
            deawTextArea.push({ x: x / this.scale.value, y: y / this.scale.value, width: textWidth / this.scale.value, height: textHeight / this.scale.value, text: text, fontSize: fontSize });
        }
        area.mark = deawTextArea; // 保存绘制的文本区域
    }

    measureText(ctx, text, fontSize) {
        ctx.font = `${fontSize}px Arial`;
        return {
            width: ctx.measureText(text).width,
            height: fontSize + 4, // 字体的高度约等于字体大小
        };
    }

    checkAlignLine() {
        this.alignLine.value = [];
        const snapPixel = 20;
        this.revealAreas.value.forEach(area => {
            if (area === this.activeArea.value) return;
            const left = Math.abs(this.activeArea.value.x - area.x);
            const right = Math.abs(this.activeArea.value.x + this.activeArea.value.width - area.x - area.width);
            const top = Math.abs(this.activeArea.value.y - area.y);
            const bottom = Math.abs(this.activeArea.value.y + this.activeArea.value.height - area.y - area.height);

            if (left < snapPixel || right < snapPixel) {
                if (left < right) {
                    this.activeArea.value.x = area.x;
                    this.alignLine.value.push({ x: area.x, y: 0, width: 1, height: this.canvasRef.value.height });
                    if (this.activeArea.value.width === area.width) {
                        this.alignLine.value.push({ x: area.x + area.width, y: 0, width: 1, height: this.canvasRef.value.height });
                    }
                } else {
                    this.activeArea.value.x = area.x + area.width - this.activeArea.value.width;
                    this.alignLine.value.push({ x: area.x + area.width, y: 0, width: 1, height: this.canvasRef.value.height });
                    if (this.activeArea.value.width === area.width) {
                        this.alignLine.value.push({ x: area.x, y: 0, width: 1, height: this.canvasRef.value.height });
                    }
                }
            }
            if (top < snapPixel || bottom < snapPixel) {
                if (top < bottom) {
                    this.activeArea.value.y = area.y;
                    this.alignLine.value.push({ x: 0, y: area.y, width: this.canvasRef.value.width, height: 1 });
                    if (this.activeArea.value.height === area.height) {
                        this.alignLine.value.push({ x: 0, y: area.y + area.height, width: this.canvasRef.value.width, height: 1 });
                    }
                } else {
                    this.activeArea.value.y = area.y + area.height - this.activeArea.value.height;
                    this.alignLine.value.push({ x: 0, y: area.y + area.height, width: this.canvasRef.value.width, height: 1 });
                    if (this.activeArea.value.height === area.height) {
                        this.alignLine.value.push({ x: 0, y: area.y, width: this.canvasRef.value.width, height: 1 });
                    }
                }
            }
        });
    }
}

export default CanvasRenderer;