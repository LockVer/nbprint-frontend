/*
    快捷键绑定工具类
*/
import AutoArrangementUtil from "./AutoArrangementUtil";

class HotkeyBindingUtil {
    constructor(communicator) {
        this.communicator = communicator;
        this.autoArrangementUtil = new AutoArrangementUtil(communicator);
        //跳过响应功能键
        const ignoreKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Meta'];
        //合并忽略的功能键
        if (this.communicator.data.ignoreKeys) {
            this.communicator.data.ignoreKeys.push(...ignoreKeys);
        } else {
            this.communicator.data.ignoreKeys = ignoreKeys;
        }
    }

    handleEvent(e) {
        const { shapeList } = this.communicator.data;
        this.handleDefaultEvent(e);
        // 遍历所有的形状，找到第一个包含鼠标位置的形状，然后处理事件
        let isFind = false;
        if (typeof (shapeList) !== 'undefined') {
            for (const shape of shapeList) {
                if (shape.active || shape.selected) {
                    isFind = true;
                    shape.handleEvent(e);
                }
            }
        }
        //如果没有找到包含鼠标位置的形状，那么则处理默认事件
        if (!isFind) {
            shapeList.forEach(shape => {
                if (shape.copyShape)
                    shape.handleEvent(e);
            })
        }

    }
    handleDefaultEvent(event) {
        switch (event.type) {
            case 'keydown':
                this.onKeyDown(event);
                break;
            case 'keyup':
                this.onKeyUp(event);
                break;
        }
    }
    // 绑定快捷键 
    bindHotkey() {
        const { operateCanvasRef } = this.communicator.data;
        operateCanvasRef.addEventListener('keydown', this.handleEvent.bind(this));
        operateCanvasRef.addEventListener('keyup', this.handleEvent.bind(this));
        if (!this.communicator.data.hotkey)
            this.communicator.data.hotkey = {};
    }
    // 按键按下
    onKeyDown = (e) => {
        e.preventDefault();
        if (this.communicator.data.ignoreKeys.includes(e.key)) {
            return;
        }
        let hotkey = e.key == ' ' ? 'Space' : e.key;
        this.communicator.data.hotkey[hotkey] = true;
        this.handleHotkeyPressed(hotkey);
        // 创建并分发自定义事件
        const event = new CustomEvent('hotkeyPressed', { detail: { hotkey } });
        window.dispatchEvent(event);
    }
    // 按键抬起
    onKeyUp = (e) => {
        e.preventDefault();
        if (this.communicator.data.ignoreKeys.includes(e.key)) {
            return;
        }
        let hotkey = e.key == ' ' ? 'Space' : e.key;
        this.communicator.data.hotkey[hotkey] = false;
        this.handleHotkeyUp(hotkey);
        // 创建并分发自定义事件
        const event = new CustomEvent('hotkeyReleased', { detail: { hotkey } });
        window.dispatchEvent(event);
    }
    // 解绑快捷键
    unbindHotkey() {
        const { operateCanvasRef } = this.communicator.data;
        operateCanvasRef.removeEventListener('keydown', this.onKeyDown);
        operateCanvasRef.removeEventListener('keyup', this.onKeyUp);
        this.communicator.data.hotkey = {};
    }
    //处理快捷键按下事件
    handleHotkeyPressed(hotkey) {
        //Ctrl + A
        if (this.communicator.data.hotkey.Control && hotkey == 'a') {
            this.communicator.data.shapeList.forEach(shape => {
                shape.selected = true;
            });
            this.communicator.data.rendererUtil.render();
        }
        //删除按键
        if (hotkey == 'Delete') {
            this.communicator.data.shapeList = this.communicator.data.shapeList.filter(shape => { return !shape.selected && !shape.active });
            console.log(this.communicator.data.shapeList)
        }
        //Ctrl + Q
        if (this.communicator.data.hotkey.Control && hotkey == 'q') {
            this.autoArrangementUtil.arrangeShapes();
        }
        //Ctrl + E
        if (this.communicator.data.hotkey.Control && hotkey == 'e') {
            this.autoArrangementUtil.arrangeShapesVertically();
        }
        if (this.communicator.data.hotkey.Alt) {
            this.communicator.data.shapeList.forEach(shape => {
                shape.checkProximity();
            })
            this.communicator.data.rendererUtil.render();
        }
    }
    //处理快捷键抬起事件
    handleHotkeyUp(hotkey) {
        if (hotkey == 'Alt') {
            console.log('抬起了Alt键');
            this.communicator.data.shapeList.forEach(shape => {
                shape.proximityWarning = false;
            })
            this.communicator.data.rendererUtil.render();
        }
    }
}
export default HotkeyBindingUtil;