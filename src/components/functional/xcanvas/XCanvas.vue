<template>
    <div class="xcanvas">
        <helper-action @clickAction="clickAction" @addDone="addDone" @closePanel="closePanel" />
        <div class="canvas-area">

            <slot></slot>
            <div class="canvas-box">
                <canvas ref="gridCanvasRef"></canvas>
                <canvas ref="backgroundCanvasRef"></canvas>
                <canvas ref="operateCanvasRef" tabindex="0" @mousedown="onMouseDown" @mousemove="onMouseMove"
                    @mouseup="onMouseUp" @wheel="onWheel"></canvas>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, render, provide, inject, defineProps, defineEmits } from 'vue';
import HelperAction from './modules/HelperAction.vue';
import ErrorHandlerUtil from '@/utils/ErrorHandlerUtil';
import Communicator from '@/utils/Communicator';
import ImageHandlerUtil from './utils/ImageHandlerUtil';
import GridHandlerUtil from './utils/GridHandlerUtil';
import ScaleHandlerUtil from './utils/ScaleHandlerUtil';
import RendererUtil from './utils/RendererUtil';
import HotkeyBindingUtil from './utils/HotkeyBindingUtil';
import MouseHandlerUtil from './utils/MouseHandlerUtil';
import RectHandler from './utils/ToolbarUtils/RectHandler';
const props = defineProps({
    communicatorName: {
        type: String,
        default: "communicator"
    },
    initData: {
        type: Object,
        default: () => { }
    }
});
const emits = defineEmits(['addDone', 'closePanel']);

const errorHandlerUtil = new ErrorHandlerUtil();

const operateCanvasRef = ref(null);
const gridCanvasRef = ref(null);

let communicator = inject(props.communicatorName);

// 实例化 Communicator 并创建响应式对象，此对象包含xcanvas中全部的数据
if (!communicator) {
    console.log('未找到通信器，创建新的通信器');
    communicator = reactive(new Communicator());
} else {
    console.log('找到通信器');
}
communicator.data.virtualScale ??= 1; //虚拟倍率，用于放大缩小显示
communicator.data.actualScale ??= 1;  //实际倍率，实际为显示大小和图片实际大小的比例
communicator.data.operateCanvasRef = operateCanvasRef;
communicator.data.gridCanvasRef = gridCanvasRef;
communicator.data.backgroundImage ??= "https://nbprint-release.oss-cn-shenzhen.aliyuncs.com/printing-proof/eb93a4d8-603f-4e52-9488-7b5630e9788c/resources/Howdy_Ho_00.jpg";
communicator.data.adCardSize ??= [267, 356]; // 广告卡片尺寸
communicator.data.backgroundImageSize = { width: 0, height: 0 }; // 背景图片尺寸
communicator.data.backgroundImagePosition = { x: 0, y: 0 }; // 背景图片位置
communicator.data.virtualMaxScale ??= 2; // 虚拟最大放大倍率
communicator.data.shapeList = []; // 形状列表
communicator.data.gameList ??= []; // 游戏列表
communicator.data.minGridSize ??= 6; // 最小网格大小
communicator.data.snapThreshold ??= 10; // 吸附阈值
communicator.data.showOperatePanel ??= false; // 是否显示操作面板
communicator.data.allowSaveStateItem ??= ['virtualScale', 'actualScale', 'backgroundImagePosition', 'shapeList']; // 是否允许保存状态

provide('communicator', communicator);
const imageHandlerUtil = new ImageHandlerUtil(communicator);
const scaleHandlerUtil = new ScaleHandlerUtil(communicator);
const gridHandlerUtil = new GridHandlerUtil(communicator);
const rendererUtil = new RendererUtil(communicator);
const hotkeyBindingUtil = new HotkeyBindingUtil(communicator);
const mouseHandlerUtil = new MouseHandlerUtil(communicator);
communicator.data.rendererUtil = rendererUtil;
communicator.data.errorHandlerUtil = errorHandlerUtil;
const initCanvasPage = () => {
    //第一步，加载背景图片
    imageHandlerUtil.loadImage(communicator.data.backgroundImage).then(() => {
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

        initShapeList();
        //绘制
        rendererUtil.render();

        window.addEventListener('scaleChanged', scaleChanged);
        window.addEventListener('positionChanged', positionChanged);
        window.addEventListener('mouseMove', mouseMoveHandler);
        window.addEventListener('mouseDown', mouseDownHandler);
    }).catch((error) => errorHandlerUtil.showConfirm(error));
}

const initShapeList = () => {
    const { mmToPx } = communicator.data;

    if (!communicator.data.regions) {
        return;
    }
    console.log('communicator.data.regions:', communicator.data.regions);

    communicator.data.shapeList = communicator.data.regions.map((region) => {
        console.log('region:', region);
        const rect = {
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
            awardList: region.awardList || [],
            id: region.id || '',
            text: region.text || '',
            borderColor: region.borderColor || 'black',
            fontSize:region.fontSize,
            fontFamily:region.fontFamily,
            fontName:region.fontName,
            type: 'rect'
        }
        if (region.mark) {
            rect.mark = region.mark.map((item) => {
                return {
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                    fontSize: mmToPx(item.fontSize),
                    fontName: item.fontName,
                    fontFamily: item.fontFamily,
                    text: item.text
                }
            })
        }

        const rectHandler = new RectHandler(rect, communicator);
        console.log('rectHandler:', rectHandler);
        return rectHandler;
    });
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
}
const positionChanged = (event) => {
    rendererUtil.render();
}

const mouseMoveHandler = (event) => {
}

const mouseDownHandler = (event) => {
    rendererUtil.render();
}

const clickAction = (item) => {
    const { actualScale } = communicator.data;

    switch (item.mode) {
        case 'rect':
            const shape = {
                x: 0,
                y: 0,
                width: 100 / actualScale,
                height: 100 / actualScale,
                type: 'rect',
            }
            if (communicator.data.shapeList.length >= communicator.data.maxShapeCount) {
                errorHandlerUtil.showWarning('已超过最大添加数量！');
                return;
            }
            const rectHandler = new RectHandler(shape, communicator);
            communicator.data.shapeList.push(rectHandler);
            break;
        case 'circular':
            errorHandlerUtil.showWarning('功能暂未开放');
            break;
        default:
            break;
    }
    rendererUtil.render();
};

onMounted(() => {
    initCanvasPage();
});


const addDone = () => {
    console.log('addDone');
    emits('addDone');
}
const closePanel = () => {
    console.log('closePanel');
    emits('closePanel');
}
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
        display: flex;
        height: calc(100% - 70px);



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