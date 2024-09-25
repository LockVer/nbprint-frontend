<template>
    <div class="xcanvas">
        <helper-action @clickAction="clickAction" />
        <div class="canvas-area">

            <canvas ref="gridCanvasRef"></canvas>
            <canvas ref="operateCanvasRef" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp"
                @wheel="onWheel"></canvas>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, render, provide } from 'vue';
import HelperAction from './modules/HelperAction.vue';
import ErrorHandlerUtil from '@/utils/ErrorHandlerUtil';
import Communicator from '@/utils/Communicator';
import ImageHandlerUtil from './utils/ImageHandlerUtil';
import GridHandlerUtil from './utils/GridHandlerUtil';
import ScaleHandlerUtil from './utils/ScaleHandlerUtil';
import RendererUtil from './utils/RendererUtil';
import HotkeyBindingUtil from './utils/HotkeyBindingUtil';
import MouseHandlerUtil from './utils/MouseHandlerUtil';
import RectHandlerUtil from './utils/RectHandlerUtil';
import RectHandler from './utils/ToolbarUtils/RectHandler';
import StateUtil from './utils/StateUtil';

const errorHandlerUtil = new ErrorHandlerUtil();

const operateCanvasRef = ref(null);
const gridCanvasRef = ref(null);
// 实例化 Communicator 并创建响应式对象，此对象包含xcanvas中全部的数据
const communicator = reactive(new Communicator());
communicator.data.virtualScale = 1; //虚拟倍率，用于放大缩小显示
communicator.data.actualScale = 1;  //实际倍率，实际为显示大小和图片实际大小的比例
communicator.data.operateCanvasRef = operateCanvasRef;
communicator.data.gridCanvasRef = gridCanvasRef;
communicator.data.backgroundImage = null;
communicator.data.adCardSize = [267, 356]; // 广告卡片尺寸
communicator.data.backgroundImageSize = { width: 0, height: 0 }; // 背景图片尺寸
communicator.data.backgroundImagePosition = { x: 0, y: 0 }; // 背景图片位置
communicator.data.virtualMaxScale = 2; // 虚拟最大放大倍率
communicator.data.shapeList = []; // 形状列表
communicator.data.minGridSize = 6; // 最小网格大小
communicator.data.snapThreshold = 10; // 吸附阈值
communicator.data.allowSaveStateItem = ['virtualScale', 'actualScale', 'backgroundImagePosition', 'shapeList']; // 是否允许保存状态

provide('communicator', communicator);
const imageHandlerUtil = new ImageHandlerUtil(communicator);
const scaleHandlerUtil = new ScaleHandlerUtil(communicator);
const gridHandlerUtil = new GridHandlerUtil(communicator);
const rendererUtil = new RendererUtil(communicator);
const hotkeyBindingUtil = new HotkeyBindingUtil(communicator);
const mouseHandlerUtil = new MouseHandlerUtil(communicator);
communicator.data.rendererUtil = rendererUtil;

provide('rendererUtil', rendererUtil);

const historyStack = ref([]);
const redoStack = ref([]);

const initCanvasPage = () => {
    //第一步，加载背景图片
    imageHandlerUtil.loadImage('https://nbprint-release.oss-cn-shenzhen.aliyuncs.com/printing-proof/eb93a4d8-603f-4e52-9488-7b5630e9788c/resources/Howdy_Ho_00.jpg').then(() => {
        console.log('加载背景图片成功');
        //计算倍率
        scaleHandlerUtil.calculateScale();
        console.log('计算倍率成功');
        //计算背景图片位置
        imageHandlerUtil.calculateImageSizeAndPosition();
        console.log('计算背景图片位置成功');
        //生成网格
        gridHandlerUtil.generateGridData();
        console.log('生成网格成功');
        //绑定快捷键
        hotkeyBindingUtil.bindHotkey();
        console.log('绑定快捷键成功');
        //绑定鼠标事件
        mouseHandlerUtil.bindMouseEvent();
        console.log('绑定鼠标事件成功');
        //绘制
        rendererUtil.render();

        window.addEventListener('hotkeyPressed', hotkeyPressed);
        window.addEventListener('scaleChanged', scaleChanged);
        window.addEventListener('positionChanged', positionChanged);
        window.addEventListener('mouseUp', () => saveState());
        window.addEventListener('mouseMove', mouseMoveHandler);
        window.addEventListener('mouseDown', mouseDownHandler);
    }).catch((error) => errorHandlerUtil.showConfirm(error));
}

const hotkeyPressed = (event) => {
    const { hotkey } = communicator.data;
    switch (event.detail.hotkey) {
        case 'z':
            if (hotkey.Control)
                stateUtil.undo();
            break;
        case 'y':
            if (hotkey.Control)
                stateUtil.redo();
            break;
        default:
            break;
    }
    rendererUtil.render();
}
const scaleChanged = (event) => {
    const { shapeList } = communicator.data;
    shapeList.forEach((shape) => {
        if (shape.active) {
            shape.calculateDistanceLines();
        }
    });
    gridHandlerUtil.generateGridData();
    rendererUtil.render();
    rendererUtil.drawGrid();
    saveState();
}
const positionChanged = (event) => {
    rendererUtil.render();
}

const mouseMoveHandler = (event) => {
}

const mouseDownHandler = (event) => {
    rendererUtil.render();
}

const saveState = () => {
    //保存当前状态，如果没有变化则不保存
    if (historyStack.value.length > 0) {
        const currentState = historyStack.value[historyStack.value.length - 1];
        if (currentState.x === communicator.data.backgroundImagePosition.x &&
            currentState.y === communicator.data.backgroundImagePosition.y &&
            currentState.virtualScale === communicator.data.virtualScale) {
            return;
        }
    }
    historyStack.value.push({
        x: communicator.data.backgroundImagePosition.x,
        y: communicator.data.backgroundImagePosition.y,
        virtualScale: communicator.data.virtualScale
    })
    redoStack.value = [];
};

const restoreState = (state) => {
    communicator.data.backgroundImagePosition.x = state.x;
    communicator.data.backgroundImagePosition.y = state.y;
    communicator.data.virtualScale = state.virtualScale;
    gridHandlerUtil.generateGridData();
    rendererUtil.render();
    rendererUtil.drawGrid();
};

const undo = () => {
    // if (historyStack.value.length > 1) {
    //     const currentState = historyStack.value.pop();
    //     redoStack.value.push(currentState);
    //     const previousState = historyStack.value[historyStack.value.length - 1];
    //     restoreState(previousState);
    // }
    communicator.undo();
    rendererUtil.render();
};

const redo = () => {
    communicator.redo();
    // if (redoStack.value.length > 0) {
    //     const nextState = redoStack.value.pop();
    //     historyStack.value.push(nextState);
    //     restoreState(nextState);
    // }
};

const clickAction = (item) => {
    switch (item.mode) {
        case 'rect':
            const shape = {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                type: 'rect',
            }
            const rectHandler = new RectHandler(shape, communicator);
            communicator.data.shapeList.push(rectHandler);
            break;
        case 'circular':
            break;
        default:
            break;
    }
    rendererUtil.render();
};

onMounted(() => {
    initCanvasPage();
});
</script>

<style scoped lang="scss">
.xcanvas {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;



    .canvas-area {
        flex: 1;
        position: relative;
    }
}

canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}
</style>