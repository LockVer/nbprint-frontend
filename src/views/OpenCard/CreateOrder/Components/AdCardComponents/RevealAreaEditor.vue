<template>
    <div class="auto-action">
        <x-check-box v-model="mode" margin="0px 8px 0px 0px" :DataList="modeList" type="radio"></x-check-box>
        <el-button v-if="selectedAreas.length > 0 && mode === 'select'" @click="createGameArea"
            type="primary">创建游戏区</el-button>
        <el-button v-if="mode === 'select'" @click="allSelect" type="primary" plain>全选</el-button>
        <el-button v-if="mode === 'select'" @click="allNotSelect" type="primary" plain>取消全选</el-button>
        <el-button @click="clearArea" type="danger" plain>清空</el-button>
    </div>
    <div class="reveal-area-editor" ref="editorRef" @contextmenu.prevent="handleContextMenu($event)">
        <canvas ref="canvasRef" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"></canvas>
        <div v-if="mode === 'select'" class="game-area">
            <p class="title">游戏区</p>
            <div class="game-area-list">
                <div v-for="area in gameAreas" :key="area.id" class="game-area-item"
                    :class="{ selected: selectedGameArea && selectedGameArea.id === area.id }"
                    @click="toggleGameAreaSelection(area)">
                    <span>{{ area.name }}</span>
                    <span class="iconfont icon-close" @click.stop="removeGameArea(area)"></span>
                </div>
            </div>
        </div>
        <div class="pa-input" v-if="selectedGameArea">
            <!--关闭面板图标-->
            <p>游戏区名称</p>
            <el-input placeholder="请输入游戏区名称" v-model="selectedGameArea.name" @keydown="addRange" />
            <p>奖符数据</p>
            <el-tooltip class="box-item" effect="dark" content="输入数据后，按【回车】按键添加" placement="right">
                <el-input ref="inputRef" placeholder="请输入奖符数据" v-model="PAInput" @keydown="addRange" />
            </el-tooltip>
            <p>奖符数据列表</p>
            <div class="data-list">
                <el-tag type="primary" :key="index" @close="removeRange(index)" closable
                    v-for="(item, index) in selectedGameArea?.range">{{ item
                    }}</el-tag>
            </div>
        </div>
        <ul v-if="showContextMenu" class="context-menu"
            :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }">
            <li @click="copyArea">复制</li>
            <li @click="deleteArea">删除</li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineExpose } from 'vue';
import { cloneDeep } from 'lodash';
import { ElMessage, ElMessageBox } from 'element-plus';
import XCheckBox from '@/components/functional/XCheckBox.vue';

import { v4 as uuidv4 } from 'uuid'; // 导入uuid库
const props = defineProps({
    backgroundImageUrl: String,
    preAreas: Array,
    adCardSize: Array,
    imageSize: Object
});
let adCardWidth = 0;
let adCardHeight = 0;
const imageWidth = props.imageSize.width;
const imageHeight = props.imageSize.height;

console.log(props.adCardSize)
// 根据图片的宽高和广告卡片的宽高比例，计算广告卡片的宽高
if (imageWidth > imageHeight) {
    adCardWidth = Math.max(...(props.adCardSize));
    adCardHeight = Math.min(...(props.adCardSize));
} else {
    adCardWidth = Math.min(...(props.adCardSize));
    adCardHeight = Math.max(...(props.adCardSize));
}
//1mm等于多少像素
const mmToPx = (mm) => mm * imageWidth / adCardWidth;
const pxToMm = (px) => px * adCardWidth / imageWidth;
console.log(mmToPx(1));
console.log(pxToMm(1));

const canvasRef = ref(null);
const editorRef = ref(null);

const revealAreas = ref(cloneDeep(props.preAreas || []));
const gameAreas = ref([]); // 存储游戏区的数组
const selectedGameArea = ref(null); // 当前选中的游戏区
const mode = ref('create'); // 当前模式：'select' 或 'create'
const modeList = [
    { text: '选择模式', value: "select" },
    { text: '创建模式', value: "create" }
];
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
const PAInput = ref('');
const PAInputClass = ref('');
let rightClickedArea = null;
let scale = 1;

const allSelect = () => {
    selectedAreas.value = revealAreas.value;
    drawCanvas();
};
const allNotSelect = () => {
    selectedAreas.value = [];
    drawCanvas();
};

// 切换游戏区选中状态
const toggleGameAreaSelection = (area) => {
    if (selectedGameArea.value && selectedGameArea.value.id === area.id) {
        selectedGameArea.value = null;
    } else {
        selectedGameArea.value = area;
    }
    drawCanvas();
};


// 删除游戏区
const removeGameArea = (area) => {
    gameAreas.value = gameAreas.value.filter(gameArea => gameArea.id !== area.id);
    revealAreas.value.push(...area.areas);
    if (selectedGameArea.value && selectedGameArea.value.id === area.id) {
        selectedGameArea.value = null;
    }
    drawCanvas();
};

// 创建游戏区
const createGameArea = () => {
    const newGameArea = {
        id: uuidv4(),
        name: `游戏区${gameAreas.value.length + 1}`,
        areas: selectedAreas.value,
        range: [],
        selected: false
    };
    gameAreas.value.push(newGameArea);
    revealAreas.value = revealAreas.value.filter(area => !selectedAreas.value.includes(area));
    selectedAreas.value = [];
    drawCanvas();
};
const addRange = (e) => {
    if (e.key === 'Enter') {
        const range = PAInput.value.trim();
        if (range) {
            if (!selectedGameArea.value.range) {
                selectedGameArea.value.range = [];
            }
            //判断是否重复
            // if (selectedGameArea.value.range.includes(range)) {
            //     //提示重复
            //     ElMessage.error('奖符数据重复！')
            //     return;
            // }
            selectedGameArea.value.range.push(range);
            PAInput.value = '';
        }
    }
};
const removeRange = (index) => {
    selectedGameArea.value.range.splice(index, 1);
    console.log(selectedGameArea.value.range)
};
// 切换模式时的处理
watch(mode, (newMode) => {
    if (newMode === 'create') {
        selectedGameArea.value = null;
        selectedAreas.value = [];
        drawCanvas();
    }
});


const handleContextMenu = (event) => {
    const rect = canvasRef.value.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    // 查找是否点击了某个揭开区域
    rightClickedArea = revealAreas.value.find(area =>
        x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
    );

    if (rightClickedArea) {
        event.preventDefault(); // 阻止默认的上下文菜单
        showContextMenu.value = true;

        // 计算菜单的位置
        const editorRect = editorRef.value.getBoundingClientRect();
        console.log(editorRect.top, editorRect.left)
        contextMenuPosition.value = {
            x: event.clientX - editorRect.left + window.scrollX,
            y: event.clientY - editorRect.top   //因为是在弹窗中加载，所以不需要+window.scrollY
        };
        console.log(event.clientX, event.clientY, editorRect.left, editorRect.top, window.scrollX, window.scrollY, contextMenuPosition.value.x, contextMenuPosition.value.y)
        activeArea.value = rightClickedArea; // 设置当前激活的揭开区域
    } else {
        showContextMenu.value = false;
    }
};

const copyArea = () => {
    if (rightClickedArea) {
        // 创建一个新的区域对象，位置稍微偏移，以便用户可以看到复制出的新区域
        const newArea = { ...rightClickedArea, x: rightClickedArea.x + 10, y: rightClickedArea.y + 10 };
        revealAreas.value.push(newArea);
        drawCanvas();
    }
    showContextMenu.value = false;
};

const deleteArea = () => {
    if (rightClickedArea) {
        // 从数组中删除选中的区域
        revealAreas.value = revealAreas.value.filter(area => area !== rightClickedArea);
        drawCanvas();
    }
    showContextMenu.value = false;
};

const clearArea = () => {
    ElMessageBox.confirm('是否清空所有区域?')
        .then(() => {
            revealAreas.value = [];
            drawCanvas();
        })
        .catch(() => {
            // catch error
        })
};
// 监听点击事件，如果点击的不是菜单，则隐藏菜单
window.addEventListener('click', (event) => {
    if (!event.target.matches('.context-menu, .context-menu *')) {
        showContextMenu.value = false;
    }
});



const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

const drawCanvas = async () => {
    if (!canvasRef.value || !editorRef.value) {
        console.error('Canvas or editor not mounted yet');
        return;
    }
    const ctx = canvasRef.value.getContext('2d');
    //ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

    if (props.backgroundImageUrl) {
        console.log('props.backgroundImageUrl')
        const img = await loadImage(props.backgroundImageUrl);
        const editorWidth = editorRef.value.clientWidth;
        const editorHeight = editorRef.value.clientHeight;
        scale = Math.min(editorWidth / img.width, editorHeight / img.height);
        canvasRef.value.width = img.width * scale;
        canvasRef.value.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvasRef.value.width, canvasRef.value.height);
    }

    if (mode.value === 'create') {
        revealAreas.value.forEach(area => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
            ctx.strokeStyle = area === activeArea.value ? 'red' : '#FFF';
            ctx.strokeRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
        });
    } else if (mode.value === 'select') {
        if (selectedGameArea.value) {
            selectedGameArea.value.areas.forEach(area => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
                ctx.strokeStyle = area === activeArea.value ? 'red' : '#FFF';
                ctx.strokeRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
            });
        } else {
            revealAreas.value.forEach(area => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
                ctx.strokeStyle = area === activeArea.value ? 'red' : '#FFF';
                ctx.strokeRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
            });
        }
    }

    if (alignLine.value) {
        ctx.fillStyle = 'red';
        alignLine.value.forEach(line => {
            ctx.fillRect(line.x * scale, line.y * scale, line.width, line.height);
        });
    }
    if (activeArea.value) {
        drawDistanceLines(ctx, activeArea.value);
    }
    if (mode.value === 'select') {
        ctx.strokeStyle = 'red';
        selectedAreas.value.forEach((area) => {
            ctx.strokeRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
        });
    }
};

const drawDistanceLines = (ctx, area) => {
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

        //遍历所有区域，找到和当前边最近的交点
        revealAreas.value.forEach(otherArea => {
            if (otherArea !== area) {
                const intersections = getIntersections(edge, otherArea);
                intersections.forEach(intersection => {
                    const distance = getDistance(edge.x1, edge.y1, intersection.x, intersection.y);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIntersection = intersection;
                        closestOtherArea = otherArea;
                    }
                });
            }
        });

        //如果找到了最近的交点，画线到交点，否则画到边的另一端
        ctx.beginPath();
        ctx.moveTo(edge.x1, edge.y1);
        if (closestIntersection) {
            ctx.lineTo(closestIntersection.x, closestIntersection.y);
            edge.label = `${pxToMm(closestDistance / scale).toFixed(2)} mm`;
        } else {
            ctx.lineTo(edge.x2, edge.y2);
            const distance = edge.side === 'top' || edge.side === 'bottom' ? Math.abs(edge.y1 - edge.y2) : Math.abs(edge.x1 - edge.x2);
            edge.label = `${pxToMm(distance / scale).toFixed(2)} mm`;
        }
        ctx.stroke();

        //计算文本宽度和高度
        const textWidth = ctx.measureText(edge.label).width;
        const textHeight = 12;

        //计算文本位置
        const textX = (edge.x1 + (closestIntersection ? closestIntersection.x : edge.x2)) / 2 - textWidth / 2 - paddingX;
        const textY = (edge.y1 + (closestIntersection ? closestIntersection.y : edge.y2)) / 2 - textHeight / 2 - paddingY;

        //画文本背景
        ctx.fillStyle = 'white';
        ctx.fillRect(textX, textY, textWidth + 2 * paddingX, textHeight + 2 * paddingY);

        //画文本边框
        ctx.strokeStyle = 'black';
        ctx.strokeRect(textX, textY, textWidth + 2 * paddingX, textHeight + 2 * paddingY);

        //画文本
        ctx.fillStyle = 'black';
        ctx.fillText(edge.label, textX + paddingX, textY + textHeight + paddingY / 2);
    });
};

//获取线段和矩形的交点
const getIntersections = (line, rect) => {
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
        const intersection = getLineIntersection(line, rectLine);
        if (intersection) {
            intersections.push(intersection);
        }
    });

    return intersections;
};

//获取两条线段的交点
const getLineIntersection = (line1, line2) => {
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
const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};



const checkAlignLine = () => {
    //检查当前区域的x是否靠近数组中其他区域的x，如果是，则吸附到该区域的x，并赋值对齐线的数据给alignLine
    alignLine.value = [];
    //吸附像素
    const snapPixel = 20;
    revealAreas.value.forEach(area => {
        if (area === activeArea.value) return;
        //计算出当前区域靠哪个边最近，左右边为一组，上下边为一组，避免同时靠近左右边和上下边时，拉扯的情况
        const left = Math.abs(activeArea.value.x - area.x);
        const right = Math.abs(activeArea.value.x + activeArea.value.width - area.x - area.width);
        const top = Math.abs(activeArea.value.y - area.y);
        const bottom = Math.abs(activeArea.value.y + activeArea.value.height - area.y - area.height);

        if (left < snapPixel || right < snapPixel) {
            //吸附的新x坐标，如果矩形更靠近左边，则吸附到左边，否则吸附到右边
            if (left < right) {
                activeArea.value.x = area.x;
                alignLine.value.push({ x: area.x, y: 0, width: 1, height: canvasRef.value.height });
                if (activeArea.value.width == area.width) {
                    alignLine.value.push({ x: area.x + area.width, y: 0, width: 1, height: canvasRef.value.height });
                }
            } else {
                activeArea.value.x = area.x + area.width - activeArea.value.width;
                alignLine.value.push({ x: area.x + area.width, y: 0, width: 1, height: canvasRef.value.height });
                if (activeArea.value.width == area.width) {
                    alignLine.value.push({ x: area.x, y: 0, width: 1, height: canvasRef.value.height });
                }
            }
        }
        if (top < snapPixel || bottom < snapPixel) {
            //吸附的新y坐标，如果矩形更靠近上边，则吸附到上边，否则吸附到下边
            if (top < bottom) {
                activeArea.value.y = area.y;
                alignLine.value.push({ x: 0, y: area.y, width: canvasRef.value.width, height: 1 });
                if (activeArea.value.height == area.height) {
                    alignLine.value.push({ x: 0, y: area.y + area.height, width: canvasRef.value.width, height: 1 });
                }
            } else {
                activeArea.value.y = area.y + area.height - activeArea.value.height;
                alignLine.value.push({ x: 0, y: area.y + area.height, width: canvasRef.value.width, height: 1 });
                if (activeArea.value.height == area.height) {
                    alignLine.value.push({ x: 0, y: area.y, width: canvasRef.value.width, height: 1 });
                }
            }
        }
        console.log(alignLine.value)
    });
}





const handleMouseDown = (event) => {

    if (mode.value === 'create') {
        const rect = canvasRef.value.getBoundingClientRect();
        const x = (event.clientX - rect.left) / scale;
        const y = (event.clientY - rect.top) / scale;

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
        const x = (event.clientX - rect.left) / scale;
        const y = (event.clientY - rect.top) / scale;
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

const determineResizeDirection = (x, y, area) => {
    const nearLeft = Math.abs(x - area.x) < 10;
    const nearRight = Math.abs(x - (area.x + area.width)) < 10;
    const nearTop = Math.abs(y - area.y) < 10;
    const nearBottom = Math.abs(y - (area.y + area.height)) < 10;

    if (nearLeft && nearTop) return 'top-left';
    if (nearRight && nearTop) return 'top-right';
    if (nearLeft && nearBottom) return 'bottom-left';
    if (nearRight && nearBottom) return 'bottom-right';
    if (nearLeft) return 'left';
    if (nearRight) return 'right';
    if (nearTop) return 'top';
    if (nearBottom) return 'bottom';
    return '';
};

const handleMouseMove = (event) => {
    const rect = canvasRef.value.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    if (dragging.value) {
        console.log(pxToMm(activeArea.value.width), pxToMm(activeArea.value.height))
        activeArea.value.x = Math.max(0, Math.min(canvasRef.value.width / scale - activeArea.value.width, x - offsetX.value));
        activeArea.value.y = Math.max(0, Math.min(canvasRef.value.height / scale - activeArea.value.height, y - offsetY.value));
        checkAlignLine();
        drawCanvas();
    } else if (resizing.value) {
        resizeArea(x, y);
        drawCanvas();
    } else {
        updateCursor(x, y);
    }
};


const resizeArea = (x, y) => {
    switch (resizeDirection.value) {
        case 'top-left':
            resizeFromTop(y);
            resizeFromLeft(x);
            break;
        case 'top-right':
            resizeFromTop(y);
            resizeFromRight(x);
            break;
        case 'bottom-left':
            resizeFromBottom(y);
            resizeFromLeft(x);
            break;
        case 'bottom-right':
            resizeFromBottom(y);
            resizeFromRight(x);
            break;
        case 'left':
            resizeFromLeft(x);
            break;
        case 'right':
            resizeFromRight(x);
            break;
        case 'top':
            resizeFromTop(y);
            break;
        case 'bottom':
            resizeFromBottom(y);
            break;
    }
};

const resizeFromTop = (y) => {
    const originalHeight = activeArea.value.height;
    activeArea.value.height += activeArea.value.y - y;
    activeArea.value.y = y;
    if (activeArea.value.height < 10) {
        activeArea.value.y -= 10 - originalHeight;
        activeArea.value.height = 10;
    }
    //改变高度时，需要检查顶边是否和其他区域的顶边对齐，如果是，则显示对齐线
    alignLine.value = [];
    revealAreas.value.forEach(area => {
        if (area !== activeArea.value && Math.abs(activeArea.value.y - area.y) == 0) {
            activeArea.value.y = area.y;
            alignLine.value.push({ x: 0, y: area.y, width: canvasRef.value.width, height: 1 });
        }
    });
};

const resizeFromBottom = (y) => {
    const newY = Math.max(y, activeArea.value.y + 10);
    activeArea.value.height = newY - activeArea.value.y;
    //改变高度时，需要检查底边是否和其他区域的底边对齐，如果是，则显示对齐线
    alignLine.value = [];
    revealAreas.value.forEach(area => {
        if (area !== activeArea.value && Math.abs(activeArea.value.y + activeArea.value.height - area.y - area.height) == 0) {
            alignLine.value.push({ x: 0, y: area.y + area.height, width: canvasRef.value.width, height: 1 });
        }
    });
};

const resizeFromLeft = (x) => {
    const originalWidth = activeArea.value.width;
    activeArea.value.width += activeArea.value.x - x;
    activeArea.value.x = x;
    if (activeArea.value.width < 10) {
        activeArea.value.x -= 10 - originalWidth;
        activeArea.value.width = 10;
    }
    //改变宽度时，需要检查左边是否和其他区域的左边对齐，如果是，则显示对齐线
    alignLine.value = [];
    revealAreas.value.forEach(area => {
        if (area !== activeArea.value && Math.abs(activeArea.value.x - area.x) == 0) {
            alignLine.value.push({ x: area.x, y: 0, width: 1, height: canvasRef.value.height });
        }
    });
};

const resizeFromRight = (x) => {
    const newX = Math.max(x, activeArea.value.x + 10);
    activeArea.value.width = newX - activeArea.value.x;
    //改变宽度时，需要检查右边是否和其他区域的右边对齐，如果是，则显示对齐线
    alignLine.value = [];
    revealAreas.value.forEach(area => {
        if (area !== activeArea.value && Math.abs(activeArea.value.x + activeArea.value.width - area.x - area.width) == 0) {
            alignLine.value.push({ x: area.x + area.width, y: 0, width: 1, height: canvasRef.value.height });
        }
    });
};

const updateCursor = (x, y) => {
    let cursor = 'default';
    revealAreas.value.forEach(area => {
        if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
            const nearLeft = Math.abs(x - area.x) < 10;
            const nearRight = Math.abs(x - (area.x + area.width)) < 10;
            const nearTop = Math.abs(y - area.y) < 10;
            const nearBottom = Math.abs(y - (area.y + area.height)) < 10;

            if (nearTop && nearLeft) {
                cursor = 'nw-resize'; // Top left corner
            } else if (nearTop && nearRight) {
                cursor = 'ne-resize'; // Top right corner
            } else if (nearBottom && nearLeft) {
                cursor = 'sw-resize'; // Bottom left corner
            } else if (nearBottom && nearRight) {
                cursor = 'se-resize'; // Bottom right corner
            } else if (nearTop) {
                cursor = 'n-resize'; // Top edge
            } else if (nearBottom) {
                cursor = 's-resize'; // Bottom edge
            } else if (nearLeft) {
                cursor = 'w-resize'; // Left edge
            } else if (nearRight) {
                cursor = 'e-resize'; // Right edge
            } else {
                cursor = 'move'; // Inside the area but not near the edges
            }
        }
    });
    canvasRef.value.style.cursor = cursor;
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
    activeArea.value = null;
    canvasRef.value.style.cursor = 'default';
    drawCanvas(); // 重新绘制画布以更新显示
};

const getAreas = () => {
    if (revealAreas.value.length > 0) {
        ElMessage.error('还有区域未绑定游戏区！');
        return [];
    }
    console.log(gameAreas.value)
    // 返回当前的揭开区域数组，并根据区域的x,y进行排序后返回副本,先按y排序，再按x排序
    return cloneDeep(gameAreas.value);
};


watch(() => props.backgroundImageUrl, (newVal) => {
    console.log('watch')
    if (canvasRef.value && editorRef.value) {
        drawCanvas();
    }
}, { immediate: true });

onMounted(() => {
    drawCanvas();
});

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

.auto-action {
    width: 100%;
    height: 50px;
    margin-bottom: 10px;
    background-color: rgba(0, 0, 0, 0.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 10px;
}

.context-menu {
    position: absolute;
    z-index: 1000;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    list-style: none;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
}

.context-menu li {
    padding: 5px 10px;
    cursor: pointer;
}

.game-area {
    background-color: rgba(0, 0, 0, 0.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    width: 150px;
    position: absolute;
    top: 10px;
    left: 10px;
    height: calc(100% - 20px);
    padding: 10px;
    overflow-y: auto;
    background: #f0f0f0; // 增加背景颜色以增强显示对比度
}

.game-area .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
}

.game-area-list {
    margin-top: 10px;
}

.game-area-item {
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff; // 增加背景颜色以增强显示对比度
}

.game-area-item.selected {
    background-color: #409eff;
    color: #fff;
}

.iconfont {
    font-size: 12px;
    cursor: pointer;
}

.icon-close {
    color: #ff4d4f;
}

.reveal-area-editor p {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
}

.selected {
    background-color: #409eff;
    color: #fff;
}

.pa-input {
    position: absolute;
    z-index: 111;
    width: 200px;
    min-height: 200px;
    background: white;
    padding: 10px;
    top: 10px;
    right: 10px;
    border-radius: 4px;

    p {
        text-align: left;
    }

    .icon-close {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
        position: absolute;
        top: 5px;
        right: 5px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.2);
    }

    p {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .data-list {
        display: flex;
        flex-wrap: wrap;

        .el-tag {
            margin-right: 10px;
            margin-bottom: 10px;
        }
    }

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