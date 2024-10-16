/*
    MouseHandlerUtil.js
    鼠标处理工具类
*/
class MouseHandlerUtil {
    constructor(communicator) {
        this.communicator = communicator;
        this.selecting = false;  // 是否正在选择
        this.selectionStart = null;  // 选择框起始点
        this.selectionEnd = null;  // 选择框当前点
    }
    handleEvent(e) {
        if (this.selecting) { this.handleDefaultEvent(e); return; } //如果正在选择，则不冒泡鼠标事件
        const { offsetX, offsetY } = e;
        const { shapeList, backgroundImagePosition, virtualScale, hotkey } = this.communicator.data;
        if (hotkey.Space) {   //如果按下了空格键，则不冒泡鼠标事件
            this.communicator.data.distanceLines = [];
            this.handleDefaultEvent(e);
            return;
        }
        // 遍历所有的形状，找到第一个包含鼠标位置的形状，然后处理事件
        let isFind = false;
        if (typeof (shapeList) !== 'undefined') {
            const x = (offsetX - backgroundImagePosition.x) / virtualScale;
            const y = (offsetY - backgroundImagePosition.y) / virtualScale;
            for (const shape of shapeList) {
                if (shape.contains({ x: x, y: y })) {
                    isFind = true;
                }
                if (shape.dragging || shape.contains({ x: x, y: y })) {
                    shape.handleEvent({ x: x, y: y, type: e.type, offsetX, offsetY });
                }
            }
        }
        //如果没有找到包含鼠标位置的形状，那么则处理默认事件
        if (!isFind) {
            this.communicator.data.distanceLines = [];    //如果没有找到包含鼠标位置的形状，则清空距离线
            this.handleDefaultEvent(e);
        }
    }
    handleDefaultEvent(event) {
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
            case 'mouseleave':
                this.handleMouseLeave(event);
                break;
        }
    }
    handleMouseDown(e) {
        const { hotkey, backgroundImagePosition, shapeList, rendererUtil, operateCanvasRef } = this.communicator.data;
        operateCanvasRef.focus();
        if (hotkey.Space) {
            // 拖动
            this.dragging = true;
            this.dragStart = { x: e.clientX - backgroundImagePosition.x, y: e.clientY - backgroundImagePosition.y };
        } else {
            // 开始选择
            this.selecting = true;
            this.selectionStart = { x: e.offsetX, y: e.offsetY };
            this.selectionEnd = { x: e.offsetX, y: e.offsetY };
        }
        //如果点击的空白区域，则取消所有选中的形状 
        shapeList.forEach(shape => {
            shape.active = false;
            shape.selected = false;
        });
        rendererUtil.render();
    }
    handleMouseMove(e) {
        const { hotkey, backgroundImagePosition, operateCanvasRef, shapeList } = this.communicator.data;
        if (hotkey.Space && this.dragging) {
            backgroundImagePosition.x = e.clientX - this.dragStart.x;
            backgroundImagePosition.y = e.clientY - this.dragStart.y;
            operateCanvasRef.style.cursor = 'grabbing';
            console.log('backgroundImagePosition:', backgroundImagePosition);
            const event = new CustomEvent('positionChanged');
            window.dispatchEvent(event);
        } else if (this.selecting) {
            // 更新选择框的当前点
            this.selectionEnd = { x: e.offsetX, y: e.offsetY };
            this.communicator.data.selectionRect = this.getSelectionRect();
            shapeList.forEach(shape => {
                if (this.isShapeInRect(shape, this.communicator.data.selectionRect)) {
                    shape.selected = true;
                } else {
                    shape.selected = false;
                }
            });
            this.communicator.data.rendererUtil.render();
        } else {
            operateCanvasRef.style.cursor = 'default';
        }
    }
    handleMouseUp(e) {
        const { operateCanvasRef } = this.communicator.data;
        operateCanvasRef.style.cursor = 'default';

        this.selecting = false;
        this.communicator.data.selectionRect = null;
        this.communicator.data.alignmentLines = [];
        this.communicator.data.rendererUtil.render();
        this.draggingShapes = false;
        this.dragging = false;
        const event = new CustomEvent('mouseUp');
        window.dispatchEvent(event);
    }
    handleMouseLeave(e) {
        console.log('handleMouseLeave');
        this.selecting = false;
        this.communicator.data.selectionRect = null;
        this.communicator.data.rendererUtil.render();
    }
    getSelectionRect() {
        const { selectionStart, selectionEnd } = this;
        return {
            x: Math.min(selectionStart.x, selectionEnd.x),
            y: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionStart.x - selectionEnd.x),
            height: Math.abs(selectionStart.y - selectionEnd.y)
        };
    }

    isShapeInRect(shape, rect) {
        const { backgroundImagePosition, virtualScale } = this.communicator.data;
        const shapeBounds = shape.getBounds();  // 假设形状有 getBounds 方法返回其边界

        // 将 shapeBounds 转换为 canvas 坐标
        const shapeX = shapeBounds.x * virtualScale + backgroundImagePosition.x;
        const shapeY = shapeBounds.y * virtualScale + backgroundImagePosition.y;
        const shapeWidth = shapeBounds.width * virtualScale;
        const shapeHeight = shapeBounds.height * virtualScale;

        // 检查形状是否在选择框内
        return shapeX >= rect.x &&
            shapeY >= rect.y &&
            shapeX + shapeWidth <= rect.x + rect.width &&
            shapeY + shapeHeight <= rect.y + rect.height;
    }

    // 鼠标滚轮
    mouseWheel = (e) => {
        const { hotkey, operateCanvasRef, virtualScale, actualScale, virtualMaxScale, backgroundImagePosition } = this.communicator.data;
        const imageCanvas = operateCanvasRef;
        const rect = imageCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const wheel = e.deltaY < 0 ? 1.1 : 0.9;
        let newScale = virtualScale * wheel;

        if (newScale < actualScale * 0.5) {
            newScale = actualScale * 0.5;
        } else if (newScale > actualScale * virtualMaxScale) {
            newScale = actualScale * virtualMaxScale;
        }

        backgroundImagePosition.x = mouseX - (mouseX - backgroundImagePosition.x) * (newScale / virtualScale);
        backgroundImagePosition.y = mouseY - (mouseY - backgroundImagePosition.y) * (newScale / virtualScale);
        this.communicator.data.virtualScale = newScale;
        this.communicator.data.alignmentLines = [];
        const event = new CustomEvent('scaleChanged');
        window.dispatchEvent(event);
    }
    bindMouseEvent() {
        const { operateCanvasRef } = this.communicator.data;
        if (!operateCanvasRef) return;
        operateCanvasRef.addEventListener('mousedown', this.handleEvent.bind(this));
        operateCanvasRef.addEventListener('mousemove', this.handleEvent.bind(this));
        operateCanvasRef.addEventListener('mouseup', this.handleEvent.bind(this));
        operateCanvasRef.addEventListener('mouseleave', this.handleEvent.bind(this));
        operateCanvasRef.addEventListener('wheel', this.mouseWheel);
    }
    // 解绑鼠标事件
    unbindMouseEvent() {
        const { operateCanvasRef } = this.communicator.data;
        if (!operateCanvasRef) return;
        operateCanvasRef.removeEventListener('mousedown', this.mouseDown);
        operateCanvasRef.removeEventListener('mousemove', this.mouseMove);
        operateCanvasRef.removeEventListener('mouseup', this.mouseUp);
        operateCanvasRef.removeEventListener('mouseleave', this.mouseLeave);
        operateCanvasRef.removeEventListener('wheel', this.mouseWheel);
    }
}
export default MouseHandlerUtil;