<template>
    <top-action-panel v-model:mode="mode" v-model:selectedAreas="selectedAreas" v-model:revealAreas="revealAreas"
        v-model:gameAreas="gameAreas" />
    <div class="reveal-area-editor" ref="editorRef" @contextmenu.prevent="handleContextMenu($event)">
        <canvas ref="canvasRef" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"></canvas>
        <game-area-panel :mode="mode" v-model:gameAreas="gameAreas" v-model:selectedGameArea="selectedGameArea" v-model:revealAreas="revealAreas"/>
        <mark-area-panel v-model:selectedGameArea="selectedGameArea"/>
        <context-menu :mode="mode" v-model:showContextMenu="showContextMenu" :contextMenuPosition="contextMenuPosition"
            :rightClickedArea="rightClickedArea" v-model:revealAreas="revealAreas" v-model:activeArea="activeArea" v-model:setQtyDialogVisible="setQtyDialogVisible"
            v-model:selectedGameArea="selectedGameArea"/>
        <set-mark-qty-panel v-model:setQtyDialogVisible="setQtyDialogVisible" v-model:selectedGameArea="selectedGameArea" v-model:activeArea="activeArea"/>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineExpose,provide } from 'vue';
import { cloneDeep } from 'lodash';
import { ElMessage, ElMessageBox } from 'element-plus';

import GameAreaPanel from './RevealAreaComponents/GameAreaPanel.vue';
import MarkAreaPanel from './RevealAreaComponents/MarkAreaPanel.vue';
import TopActionPanel from './RevealAreaComponents/TopActionPanel.vue';
import ContextMenu from './RevealAreaComponents/ContextMenu.vue';
import SetMarkQtyPanel from './RevealAreaComponents/SetMarkQtyPanel.vue';
/*
resizeArea = (x, y, resizeDirection, activeArea, revealAreas, alignLine, canvasRef)
updateCursor = (x, y, revealAreas, canvasRef)
determineResizeDirection = (x, y, area)
*/
import { resizeArea, updateCursor,determineResizeDirection } from './RevealAreaUtils/ResizeUtil';

import UnitConvertUtil from './RevealAreaUtils/UnitConvertUtil';
import DistanceDrawer from './RevealAreaUtils/DistanceDrawer';
import CanvasRenderer from './RevealAreaUtils/CanvasRenderer';


const props = defineProps({
    backgroundImageUrl: String,
    preAreas: Array,
    adCardSize: Array,
    imageSize: Object
});
const unitConvertUtil = new UnitConvertUtil(props.adCardSize, props.imageSize);
const mmToPx = unitConvertUtil.mmToPx.bind(unitConvertUtil);
const pxToMm = unitConvertUtil.pxToMm.bind(unitConvertUtil);

const canvasRef = ref(null);
const editorRef = ref(null);
const revealAreas = ref([]);
const gameAreas = ref(cloneDeep(props.preAreas || [])); // 存储游戏区的数组
const selectedGameArea = ref(null); // 当前选中的游戏区
const mode = ref('create'); // 当前模式：'select' 或 'create'
const selectedAreas = ref([]); // 被选中的区域数组
const activeArea = ref(null);
const dragging = ref(false);
const resizing = ref(false);
const resizeDirection = ref('');
const offsetX = ref(0);
const offsetY = ref(0);
const alignLine = ref([]);
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const setQtyDialogVisible = ref(false);
const rightClickedArea = ref(null);
const scale = ref(1); // 缩放比例

const distanceDrawer = new DistanceDrawer(pxToMm,revealAreas);

const canvasRendererOptions = {
    canvasRef: canvasRef,
    editorRef: editorRef,
    scale: scale,
    alignLine: alignLine,
    selectedGameArea: selectedGameArea,
    activeArea: activeArea,
    selectedAreas: selectedAreas,
    revealAreas: revealAreas,
    mode: mode,
    backgroundImageUrl: props.backgroundImageUrl,
    mmToPx: mmToPx,
    pxToMm: pxToMm,
    drawDistanceLines: distanceDrawer.drawDistanceLines.bind(distanceDrawer)
};
const canvasRenderer = new CanvasRenderer(canvasRendererOptions);
const drawCanvas = canvasRenderer.drawCanvas.bind(canvasRenderer);
const checkAlignLine = canvasRenderer.checkAlignLine.bind(canvasRenderer);

provide('drawCanvas', drawCanvas);


// 切换模式时的处理
watch(mode, (newMode) => {
    if (newMode === 'create') {
        selectedGameArea.value = null;
        selectedAreas.value = [];
        drawCanvas();
    }
});
watch(()=>selectedGameArea.value, (newVal) => {
    console.log(newVal)
});
watch(() => props.backgroundImageUrl, (newVal) => {
    if (canvasRef.value && editorRef.value) {
        drawCanvas();
    }
}, { immediate: true });

onMounted(() => {
    drawCanvas();
});

const handleContextMenu = (event) => {
    const rect = canvasRef.value.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale.value;
    const y = (event.clientY - rect.top) / scale.value;

    if (mode.value === 'select') {
        rightClickedArea.value = selectedGameArea.value.areas.find(area =>
            x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
        );
    } else {
        rightClickedArea.value = revealAreas.value.find(area =>
            x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
        );
    }

    if (rightClickedArea.value) {
        event.preventDefault(); // 阻止默认的上下文菜单
        showContextMenu.value = true;

        // 计算菜单的位置
        const editorRect = editorRef.value.getBoundingClientRect();
        contextMenuPosition.value = {
            x: event.clientX - editorRect.left + window.scrollX,
            y: event.clientY - editorRect.top   //因为是在弹窗中加载，所以不需要+window.scrollY
        };
        activeArea.value = rightClickedArea.value; // 设置当前激活的揭开区域
    } else {
        showContextMenu.value = false;
    }
};


const handleMouseDown = (event) => {

    if (mode.value === 'create') {
        const rect = canvasRef.value.getBoundingClientRect();
        const x = (event.clientX - rect.left) / scale.value;
        const y = (event.clientY - rect.top) / scale.value;

        dragging.value = false;
        resizing.value = false;
        activeArea.value = null;
        revealAreas.value.forEach(area => {
            if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
                offsetX.value = x - area.x;
                offsetY.value = y - area.y;
                activeArea.value = area;
                if (x > area.x + area.width - 10 || x < area.x + 10 || y > area.y + area.height - 10 || y < area.y + 10) {
                    resizing.value = true;
                    resizeDirection.value = determineResizeDirection(x, y, area);
                } else {
                    dragging.value = true;
                }
            }
        });

        if (!activeArea.value) {
            const newArea = { x, y, width: 0, height: 0 };
            revealAreas.value.push(newArea);
            activeArea.value = newArea;
            resizing.value = true;
            resizeDirection.value = 'bottom-right';
        }
    } else if (mode.value === 'select') {
        // 选择模式下的逻辑
        const rect = canvasRef.value.getBoundingClientRect();
        const x = (event.clientX - rect.left) / scale.value;
        const y = (event.clientY - rect.top) / scale.value;
        let areaAlreadySelected = false;

        // 检查点击的区域是否已经被选中
        selectedAreas.value.forEach((selectedArea) => {
            if (x >= selectedArea.x && x <= selectedArea.x + selectedArea.width && y >= selectedArea.y && y <= selectedArea.y + selectedArea.height) {
                areaAlreadySelected = true;
            }
        });

        // 如果点击的区域未被选中，则添加到 selectedAreas 数组
        if (!areaAlreadySelected) {
            revealAreas.value.forEach((area) => {
                if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
                    selectedAreas.value.push(area);
                }
            });
        } else {
            // 如果点击的区域已被选中，则取消选中
            selectedAreas.value = selectedAreas.value.filter((area) => {
                return !(x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height);
            });
        }
        drawCanvas();
    }


};


const handleMouseMove = (event) => {
    const rect = canvasRef.value.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale.value;
    const y = (event.clientY - rect.top) / scale.value;

    if (dragging.value) {
        activeArea.value.x = Math.max(0, Math.min(canvasRef.value.width / scale.value - activeArea.value.width, x - offsetX.value));
        activeArea.value.y = Math.max(0, Math.min(canvasRef.value.height / scale.value - activeArea.value.height, y - offsetY.value));
        checkAlignLine();
        drawCanvas();
    } else if (resizing.value) {
        resizeArea(x, y, resizeDirection, activeArea, revealAreas, alignLine, canvasRef);
        drawCanvas();
    } else {
        updateCursor(x, y, revealAreas, canvasRef);
    }
};




const handleMouseUp = () => {
    // 过滤掉过小的区域，例如小于10x10像素的区域
    revealAreas.value = revealAreas.value.filter(area => area.width > 15 && area.height > 15);

    dragging.value = false;
    resizing.value = false;
    activeArea.value = null;
    canvasRef.value.style.cursor = 'default';
    alignLine.value = null;
    drawCanvas();
};

const handleMouseLeave = () => {
    // 同样在鼠标离开时进行过滤
    revealAreas.value = revealAreas.value.filter(area => area.width > 15 && area.height > 15);
    dragging.value = false;
    resizing.value = false;
    //activeArea.value = null;
    canvasRef.value.style.cursor = 'default';
    drawCanvas(); // 重新绘制画布以更新显示
};

const getAreas = () => {
    if (revealAreas.value.length > 0) {
        ElMessage.error('还有区域未绑定游戏区！');
        return [];
    }
    const isOverlapping = (area1, area2, minSpacing) => {
        const { x: x1, y: y1, width: w1, height: h1 } = area1;
        const { x: x2, y: y2, width: w2, height: h2 } = area2;

        // Check if the distance between the right edge of area1 and left edge of area2 is greater than minSpacing
        const xOverlap = Math.abs(x1 + w1 - (x2)) < minSpacing;
        // Check if the distance between the bottom edge of area1 and top edge of area2 is greater than minSpacing
        const yOverlap = Math.abs(y1 + h1 - (y2)) < minSpacing;

        return xOverlap || yOverlap;
    };
    for (const gameArea of gameAreas.value) {
        const areas = gameArea.areas;
        if (areas.some((area1, index1) =>
            areas.some((area2, index2) => index1 !== index2 && isOverlapping(area1, area2, mmToPx(6)))
        )) {
            ElMessage.error('游戏区中的揭开区域间隔需要大于等于6mm！');
            return [];
        }
    }
    // const returnAreas = cloneDeep(gameAreas.value);
    // // 将游戏区域的坐标转换为毫米
    // returnAreas.forEach((gameArea) => {
    //     gameArea.areas.forEach((area) => {
    //         area.x = pxToMm(area.x);
    //         area.y = pxToMm(area.y);
    //         area.width = pxToMm(area.width);
    //         area.height = pxToMm(area.height);
    //         area.mark.forEach((mark) => {
    //             mark.x = pxToMm(mark.x);
    //             mark.y = pxToMm(mark.y);
    //             mark.width = pxToMm(mark.width);
    //             mark.height = pxToMm(mark.height);
    //         });
    //     });
    // });
    // console.log(returnAreas);
    // 返回当前的揭开区域数组，并根据区域的x,y进行排序后返回副本,先按y排序，再按x排序
    return cloneDeep(gameAreas.value);
};



defineExpose({
    drawCanvas,
    getAreas
})
</script>
<style lang="scss" scoped>
.reveal-area-editor {
    background: black;
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: space-between;
    position: relative;
    border-radius: 4px;
    cursor: not-allowed;
    height: calc(100vh - 60px - 40px - 16px - 16px - 48px);
}

.reveal-area-editor canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}




@keyframes appear-tv {
    0% {
        opacity: 0;
        transform: scaleY(0) scaleX(1);
    }

    50% {
        opacity: 1;
        transform: scaleY(1) scaleX(0);
    }

    100% {
        opacity: 1;
        transform: scaleY(1) scaleX(1);
    }
}

@keyframes disappear-tv {
    0% {
        opacity: 1;
        transform: scaleY(1) scaleX(1);
    }

    50% {
        opacity: 1;
        transform: scaleY(1) scaleX(0);
    }

    100% {
        opacity: 0;
        transform: scaleY(0) scaleX(1);

    }
}
</style>