class ShapeBase {
    constructor(shape, communicator) {
        this.x = shape.x;
        this.y = shape.y;
        this.width = shape.width;
        this.height = shape.height;
        this.active = false;
        this.handleSize = 10
        this.awardCount = 0;
        this.awardList = shape.awardList || [];
        this.text = shape.text || '';
        this.id = shape.id;
        this.borderColor = shape.borderColor || '';
        this.communicator = communicator;
        this.distanceThreshold = communicator.data.minGridSize;
        this.fontSize = shape.fontSize || null;
        this.fontFamily = shape.fontFamily || null;
        this.fontName = shape.fontName || null;
    }

    contains(e) {
        const x = this.active ? this.x - this.handleSize / 2 : this.x;
        const y = this.active ? this.y - this.handleSize / 2 : this.y;
        const width = this.active ? this.width + this.handleSize : this.width;
        const height = this.active ? this.height + this.handleSize : this.height;
        return e.x >= x && e.x <= x + width && e.y >= y && e.y <= y + height;
    }

    handleEvent(event) {
        switch (event.type) {
            case 'mousedown':
                this.handleMouseDown(event);
                break;
            case 'mousemove':
                this.handleMouseMove(event);
                break;
            case 'mouseup':
                this.handleMouseUp(event);
                break;
            case 'keydown':
                this.handleKeyDown(event);
                break;
            case 'keyup':
                this.handleKeyUp(event);
                break;
        }
    }

    handleMouseDown(e) {

    }

    handleMouseMove(e) {

    }

    handleMouseUp(e) {
        console.log('鼠标抬起');
        this.communicator.data.alignmentLines = [];
    }
    handleKeyDown(e) {
        const { hotkey, shapeList, showImageSize, virtualScale } = this.communicator.data;

        if (hotkey.Control) {
            switch (e.key) {
                case 'c':
                    //复制当前类对象
                    console.log('复制当前类对象');
                    shapeList.forEach((shape) => {
                        if (shape.active || shape.selected)
                            shape.copyShape = true;
                        else
                            shape.copyShape = false;
                    })
                    break;
                case 'v':
                    //粘贴当前类对象
                    console.log('粘贴当前类对象');
                    if (this.communicator.data.shapeList.length >= this.communicator.data.maxShapeCount) {
                        this.communicator.data.errorHandlerUtil.showWarning('已超过最大添加数量！');
                        return;
                    }
                    if (this.copyShape) {
                        const newShape = new this.constructor({
                            x: this.x + 20,
                            y: this.y + 20,
                            width: this.width,
                            height: this.height
                        }, this.communicator)
                        newShape.selected = true;
                        this.communicator.data.shapeList.push(newShape);
                        this.communicator.data.rendererUtil.render();
                    }
                    break;
            }
        } else {
            const moveDistance = 1 * virtualScale;
            console.log('moveDistance:', moveDistance);
            switch (e.key) {
                //上移
                case 'ArrowUp':
                    console.log('上移');
                    this.y -= moveDistance;
                    if (this.y < 0) {
                        this.y = 0;
                    }
                    this.calculateDistanceLines();
                    this.calculateAlignmentLines(false);
                    break;
                //下移
                case 'ArrowDown':
                    console.log('下移');
                    this.y += moveDistance;
                    if (this.y > showImageSize.height - this.height) {
                        this.y = showImageSize.height - this.height;
                    }
                    this.calculateDistanceLines();
                    this.calculateAlignmentLines(false);
                    break;
                //左移
                case 'ArrowLeft':
                    console.log('左移');
                    this.x -= moveDistance;
                    if (this.x < 0) {
                        this.x = 0;
                    }
                    this.calculateDistanceLines();
                    this.calculateAlignmentLines(false);
                    break;
                //右移
                case 'ArrowRight':
                    console.log('右移');
                    this.x += moveDistance;
                    if (this.x > showImageSize.width - this.width) {
                        this.x = showImageSize.width - this.width;
                    }
                    this.calculateDistanceLines();
                    this.calculateAlignmentLines(false);
                    break;
            }
            console.log('this.x:', this.x, 'this.y:', this.y);
            this.communicator.data.rendererUtil.render();
        }
    }
    handleKeyUp(e) {

    }
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        }
    }
    saveData() {

    }
}

export default ShapeBase;