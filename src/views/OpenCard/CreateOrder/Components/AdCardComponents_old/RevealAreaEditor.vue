<template>
    <!-- 顶部操作面板 -->
    <top-action-panel v-model:mode="mode" v-model:selectedAreas="selectedAreas" v-model:revealAreas="revealAreas"
        v-model:gameAreas="gameAreas" v-mode:selectedGameArea="selectedGameArea" v-mode:activeArea="activeArea" />
    <!-- 揭开区编辑器 -->
    <div class="reveal-area-editor" ref="editorRef" @contextmenu.prevent="handleContextMenu($event)">
        <!-- 画布元素，用于绘制和交互 -->
        <canvas 
            ref="canvasRef" 
            @mousedown="handleMouseDown" 
            @mousemove="handleMouseMove" 
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"
        ></canvas>
        <!-- 游戏区域面板，显示和管理游戏区域 -->
        <game-area-panel 
            :mode="mode" 
            v-model:gameAreas="gameAreas" 
            v-model:selectedGameArea="selectedGameArea"
            v-model:revealAreas="revealAreas" />
        <!-- 标记区域面板，显示和管理标记区域 -->
        <mark-area-panel v-model:selectedGameArea="selectedGameArea" />
        <!-- 右键菜单，显示上下文菜单 -->
        <context-menu 
            :mode="mode" 
            v-model:showContextMenu="showContextMenu" 
            :contextMenuPosition="contextMenuPosition"
            :rightClickedArea="rightClickedArea" 
            v-model:revealAreas="revealAreas" 
            v-model:activeArea="activeArea"
            v-model:setQtyDialogVisible="setQtyDialogVisible" 
            v-model:selectedGameArea="selectedGameArea" />
        <!-- 设置标记数量面板，显示和管理标记数量设置对话框 -->
        <set-mark-qty-panel 
            v-model:setQtyDialogVisible="setQtyDialogVisible"
            v-model:selectedGameArea="selectedGameArea" 
            v-model:activeArea="activeArea" 
        />
    </div>
</template>

<script setup>
import { ref, onMounted, watch, provide } from 'vue';
import { cloneDeep } from 'lodash';
import { ElMessage, ElMessageBox } from 'element-plus';

import GameAreaPanel from './RevealAreaComponents/GameAreaPanel.vue';
import MarkAreaPanel from './RevealAreaComponents/MarkAreaPanel.vue';
import TopActionPanel from './RevealAreaComponents/TopActionPanel.vue';
import ContextMenu from './RevealAreaComponents/ContextMenu.vue';
import SetMarkQtyPanel from './RevealAreaComponents/SetMarkQtyPanel.vue';

import { resizeArea, updateCursor, determineResizeDirection } from './RevealAreaUtils/ResizeUtil';

import UnitConvertUtil from './RevealAreaUtils/UnitConvertUtil';
import DistanceDrawer from './RevealAreaUtils/DistanceDrawer';
import CanvasRenderer from './RevealAreaUtils/CanvasRenderer';


const props = defineProps({
    backgroundImageUrl: String,
    preAreas: Array,
    adCardSize: Array,
    imageSize: Object
});
// 实例化单位转换工具类
const unitConvertUtil = new UnitConvertUtil(props.adCardSize, props.imageSize);
const mmToPx = unitConvertUtil.mmToPx.bind(unitConvertUtil); // 毫米转像素
const pxToMm = unitConvertUtil.pxToMm.bind(unitConvertUtil); // 像素转毫米

const canvasRef = ref(null);
const editorRef = ref(null); // 编辑器引用
const revealAreas = ref([]); // 揭开区域数组
const gameAreas = ref(cloneDeep(props.preAreas || [])); // 存储游戏区的数组
const selectedGameArea = ref(null); // 当前选中的游戏区
const mode = ref('create'); // 当前模式：'select' 或 'create'
const selectedAreas = ref([]); // 被选中的区域数组
const activeArea = ref(null); // 当前激活的区域
const dragging = ref(false); // 是否正在拖拽
const resizing = ref(false); // 是否正在调整大小
const resizeDirection = ref(''); // 调整大小的方向
const offsetX = ref(0); // 鼠标 X 方向的偏移量
const offsetY = ref(0);
const alignLine = ref([]);  // 对齐线数组
const showContextMenu = ref(false); // 是否显示上下文菜单
const contextMenuPosition = ref({ x: 0, y: 0 });
const setQtyDialogVisible = ref(false); // 设置数量对话框是否可见
const rightClickedArea = ref(null);
const scale = ref(1); // 缩放比例
// 实例化距离绘制工具类
const distanceDrawer = new DistanceDrawer(pxToMm, revealAreas, selectedGameArea);

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
// 实例化画布渲染器
const canvasRenderer = new CanvasRenderer(canvasRendererOptions);
const drawCanvas = canvasRenderer.drawCanvas.bind(canvasRenderer); // 绑定画布绘制方法
const checkAlignLine = canvasRenderer.checkAlignLine.bind(canvasRenderer); // 绑定检查对齐线

provide('drawCanvas', drawCanvas);


// 切换模式时的处理
watch(mode, (newMode) => {
    if (newMode === 'create') {
        selectedGameArea.value = null;
        selectedAreas.value = [];
        drawCanvas();
    }
});
watch(() => selectedGameArea.value, (newVal) => {
    // console.log(newVal)
});
watch(() => props.backgroundImageUrl, (newVal) => {
    if (canvasRef.value && editorRef.value) {
        drawCanvas();
    }
}, { immediate: true });

onMounted(() => {
    drawCanvas();
});

// 鼠标右键方法同时阻止默认的右键菜单
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

// 处理鼠标按下事件
const handleMouseDown = (event) => {
    if (mode.value === 'create') {
        const rect = canvasRef.value.getBoundingClientRect(); // 获取画布的边界矩形
        const x = (event.clientX - rect.left) / scale.value; // 计算鼠标点击的 X 坐标（相对于画布）
        const y = (event.clientY - rect.top) / scale.value; // 计算鼠标点击的 Y 坐标（相对于画布）

        dragging.value = false;
        resizing.value = false;
        activeArea.value = null;
        // 遍历所有揭开区域，判断鼠标点击的位置是否在某个区域内
        revealAreas.value.forEach(area => {
            
            if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
                offsetX.value = x - area.x;
                offsetY.value = y - area.y;
                activeArea.value = area;
                // 判断鼠标点击的位置是否在区域的边缘，用于调整大小
                if (x > area.x + area.width - 10 || x < area.x + 10 || y > area.y + area.height - 10 || y < area.y + 10) {
                    resizing.value = true;
                    resizeDirection.value = determineResizeDirection(x, y, area);// 确定调整大小的方向
                } else {
                    dragging.value = true;
                }
            }
        });
        // 如果点击的位置不在任何现有区域内，则创建一个新的区域
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

        // 如果点击的区域未被选中，并且没有选中游戏区时，则添加到 selectedAreas 数组
        if (!areaAlreadySelected && !selectedGameArea.value) {
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
        //在选择模式时，如果选中了游戏区，则鼠标点击时判断是否选中了揭开区域，选中则设置为activeArea
        //此举是为了能在鼠标点击时显示当前选择的揭开区域的距离指示器
        if (selectedGameArea.value) {
            selectedGameArea.value.areas.forEach(area => {
                if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
                    activeArea.value = area;
                }
            });
        }

        console.log(activeArea.value)
        drawCanvas();
    }


};

// 处理鼠标移动事件
const handleMouseMove = (event) => {
    const rect = canvasRef.value.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale.value;
    const y = (event.clientY - rect.top) / scale.value;

    if (dragging.value) {
        // 更新当前激活区域的位置，确保区域不会超出画布边界
        activeArea.value.x = Math.max(0, Math.min(canvasRef.value.width / scale.value - activeArea.value.width, x - offsetX.value));
        activeArea.value.y = Math.max(0, Math.min(canvasRef.value.height / scale.value - activeArea.value.height, y - offsetY.value));
        checkAlignLine(); // 检查对齐线
        drawCanvas();
    } else if (resizing.value) {
        resizeArea(x, y, resizeDirection, activeArea, revealAreas, alignLine, canvasRef);
        drawCanvas();
    } else {
        //如果没有选中游戏区，则更新鼠标样式
        if (!selectedGameArea.value)
            updateCursor(x, y, revealAreas, canvasRef);
    }
};



// 处理鼠标抬起事件
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
// 处理鼠标离开事件
const handleMouseLeave = () => {
    // 同样在鼠标离开时进行过滤
    revealAreas.value = revealAreas.value.filter(area => area.width > 15 && area.height > 15);
    dragging.value = false;
    resizing.value = false;
    canvasRef.value.style.cursor = 'default';
    drawCanvas(); // 重新绘制画布以更新显示
};

// 获取区域信息
const getAreas = () => {
    // 如果有未绑定游戏区的揭开区域，显示错误信息并返回空数组
    if (revealAreas.value.length > 0) {
        ElMessage.error('还有区域未绑定游戏区！');
        return [];
    }
    // 判断两个区域是否重叠
    const isOverlapping = (area1, area2, minSpacing) => {
        const { x: x1, y: y1, width: w1, height: h1 } = area1;
        const { x: x2, y: y2, width: w2, height: h2 } = area2;
        // 判断 X 轴方向/Y 轴方向是否重叠
        const overlapX = x1 < x2 + w2 + minSpacing && x1 + w1 + minSpacing > x2;
        const overlapY = y1 < y2 + h2 + minSpacing && y1 + h1 + minSpacing > y2;

        return overlapX && overlapY;
    };

    // 检查每个游戏区内部的揭开区域是否重叠
    for (const gameArea of gameAreas.value) {
         // 获取当前游戏区的所有揭开区域
        const areas = gameArea.areas;
        // 遍历每个区域，检查是否有重叠的区域
        if (areas.some((area1, index1) =>
            areas.some((area2, index2) => index1 !== index2 && isOverlapping(area1, area2, mmToPx(6)))
        )) {
            // 如果发现重叠，显示错误信息并返回空数组
            ElMessageBox.alert('游戏区中的揭开区域间隔需要大于等于 6mm！', '保存失败', {
                    confirmButtonText: 'OK',
                    callback: (action) => {

                    },
                })
            return [];
        }
    }

    // 检查不同游戏区的揭开区域之间是否重叠
    for (let i = 0; i < gameAreas.value.length; i++) {
        for (let j = i + 1; j < gameAreas.value.length; j++) {
            const areas1 = gameAreas.value[i].areas;
            const areas2 = gameAreas.value[j].areas;
            if (areas1.some(area1 =>
                areas2.some(area2 => isOverlapping(area1, area2, mmToPx(6)))
            )) {
                ElMessageBox.alert('游戏区中的揭开区域间隔需要大于等于 6mm！', '保存失败', {
                    confirmButtonText: 'OK',
                    callback: (action) => {

                    },
                })
                //ElMessage.error('不同游戏区的揭开区域间隔需要大于等于 6mm！');
                console.log(`Removing game area at index ${j} due to overlap.`)
                // 只清空当前正在绘制的游戏区
                revealAreas.value = [];
                return [];
            }
        }
    }

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