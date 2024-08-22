<template>
    <div class="prize-page">
        <div class="reveal-area-editor" ref="editorRef" @contextmenu.prevent="handleContextMenu($event)">
            <canvas ref="bgCanvasRef"></canvas>
            <canvas ref="canvasRef" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"
                @mouseleave="handleMouseLeave"></canvas>
            <div class="pa-input" :class="PAInputClass">
                <!--关闭面板图标-->
                <span class="iconfont icon-close" @click="closeActive"></span>
                <p>奖符数据</p>
                <el-tooltip class="box-item" effect="dark" content="输入数据后，按【回车】按键添加" placement="right">
                    <el-input ref="inputRef" placeholder="请输入奖符数据" v-model="PAInput" @keydown="addRange" />
                </el-tooltip>
                <p>奖符数据列表</p>
                <div class="data-list">
                    <el-tag type="primary" :key="index" @close="removeRange(index)" closable
                        v-for="(item, index) in activeArea?.range">{{ item
                        }}</el-tag>
                </div>
            </div>
            <ul v-if="showContextMenu" class="context-menu"
                :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }">
                <li @click="copyArea">复制</li>
                <!-- <li @click="autoCreateArea(1, null, true)">自动100%填充</li>
                <li @click="autoCreateArea(0.5, 'vertical', true)">垂直1/2填充</li>
                <li @click="autoCreateArea(0.5, 'horizontal', true)">水平1/2填充</li> -->
                <li @click="deleteArea">删除</li>
            </ul>
        </div>
        <div class="auto-action">
            <el-button @click="autoCreateArea(1)">自动100%填充</el-button>
            <el-button @click="autoCreateArea(0.5, 'vertical')">垂直1/2填充</el-button>
            <el-button @click="autoCreateArea(0.5, 'horizontal')">水平1/2填充</el-button>
            <el-button @click="clearArea" type="danger" plain>清空</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch} from 'vue';
import { cloneDeep } from 'lodash';
import { ElMessage } from 'element-plus'
import { ElMessageBox } from 'element-plus'
const props = defineProps({
    backgroundImageUrl: String,
    externalRevealAreas: Array,
    preAreas: Array
});

const canvasRef = ref(null);
const bgCanvasRef = ref(null);
const editorRef = ref(null);
const inputRef = ref(null);
const revealAreas = ref(cloneDeep(props.preAreas || []));
const lastActiveArea = ref(null);
const activeArea = ref(null);
const dragging = ref(false);
const resizing = ref(false);
const resizeDirection = ref('');
const offsetX = ref(0);
const offsetY = ref(0);
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const PAInput = ref('');
const PAInputClass = ref('');

let currentArea = null;
let rightClickedArea = null;
let scale = 1;

onMounted(() => {
    drawCanvas();
});

watch(() => props.backgroundImageUrl, (newVal) => {
    console.log('watch')
    if (canvasRef.value && editorRef.value) {
        drawCanvas();
    }
}, { immediate: true });

watch(activeArea, (newVal) => {
    if (newVal) {
        PAInput.value = '';
        PAInputClass.value = 'appear-tv';
    } else {
        PAInputClass.value = 'disappear-tv';
    }
});
//全局键盘监控，监控tab键，切换选中区域
window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        if (revealAreas.value.length > 0) {
            if (!activeArea.value) {
                activeArea.value = revealAreas.value[0];
            } else {
                const index = revealAreas.value.indexOf(activeArea.value);
                if (index === revealAreas.value.length - 1) {
                    activeArea.value = revealAreas.value[0];
                } else {
                    activeArea.value = revealAreas.value[index + 1];
                }
            }
            inputRef.value.focus();
            drawCanvas();
        }
    }
});
const closeActive = () => {
    activeArea.value = null;
    drawCanvas();
};
const addRange = (e) => {
    if (e.key === 'Enter') {
        const range = PAInput.value.trim();
        if (range) {
            if (!activeArea.value.range) {
                activeArea.value.range = [];
            }
            //判断是否重复
            if (activeArea.value.range.includes(range)) {
                //提示重复
                ElMessage.error('奖符数据重复！')
                return;
            }
            activeArea.value.range.push(range);
            PAInput.value = '';
        }
    }
};
const removeRange = (index) => {
    activeArea.value.range.splice(index, 1);
    console.log(activeArea.value.range)
};
const handleContextMenu = (event) => {
    const rect = canvasRef.value.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    // 查找是否点击了某个揭开区域
    rightClickedArea = revealAreas.value.find(area =>
        x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
    );

    // 如果点击了揭开区域，则显示右键菜单
    if(!rightClickedArea){
        rightClickedArea = props.externalRevealAreas.find(area =>
            x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
        );
    }

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

const autoCreateArea = (ratio, direction, isFullCurrentArea) => {
    if (!canvasRef.value) {
        return;
    }
    const proceedWithAreaCreation = () => {
        /*
        自动创建奖符区域，此功能为相对于externalRevealAreas的全部填充，例如ratio=1则将添加externalRevealAreas对应数量的1:1区域，位置大小都和externalRevealAreas中的相同，
        ratio为0.5时，则根据direction的值，分别对应externalRevealAreas中所有区域的大小位置，每个区域添加2个0.5:0.5的区域，一个在上一个在下或一个在左一个在右，
        例如direction为vertical时，一个在上一个在下，direction为horizontal时，一个在左一个在右。
        ratio还可以是其他值，例如0.25，0.75等，表示相对于externalRevealAreas的大小的比例。
        isFullCurrentArea为真时，只对当前选中的externalRevealAreas区域进行填充，不对所有externalRevealAreas进行填充
        */
        revealAreas.value = [];
        const newAreas = [];

        props.externalRevealAreas.forEach(area => {
            const newArea = { ...area, parentArea: area };
            if (ratio === 1) {
                newAreas.push(newArea);
            } else {
                const newWidth = area.width * ratio;
                const newHeight = area.height * ratio;
                if (direction === 'vertical') {
                    newAreas.push({ x: area.x, y: area.y, width: area.width, height: newHeight, parentArea: area });
                    newAreas.push({ x: area.x, y: area.y + area.height - newHeight, width: area.width, height: newHeight, parentArea: area });
                } else if (direction === 'horizontal') {
                    newAreas.push({ x: area.x, y: area.y, width: newWidth, height: area.height, parentArea: area });
                    newAreas.push({ x: area.x + area.width - newWidth, y: area.y, width: newWidth, height: area.height, parentArea: area });
                }
            }
        });
        console.log(newAreas);
        revealAreas.value.push(...newAreas);
        drawCanvas();
    };
    if (revealAreas.value.length > 0) {
        ElMessageBox.confirm('当前有已创建的区域，继续将清除已创建的区域，是否继续?')
            .then(() => {
                proceedWithAreaCreation()
            })
            .catch(() => {
                // catch error
                isContinue = false;
            })
    } else {
        proceedWithAreaCreation()
    }
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
    console.log('drawCanvas')
    if (!canvasRef.value || !editorRef.value) {
        console.error('Canvas or editor not mounted yet');
        return;
    }

    const ctx = canvasRef.value.getContext('2d');

    //ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    if (props.backgroundImageUrl) {
        console.log('props.backgroundImageUrl', props.backgroundImageUrl)
        const img = await loadImage(props.backgroundImageUrl);

        const editorWidth = editorRef.value.clientWidth;
        const editorHeight = editorRef.value.clientHeight;
        scale = Math.min(editorWidth / img.width, editorHeight / img.height);
        canvasRef.value.width = img.width * scale;
        canvasRef.value.height = img.height * scale;
        const bgCtx = bgCanvasRef.value.getContext('2d');
        bgCanvasRef.value.width = canvasRef.value.width;
        bgCanvasRef.value.height = canvasRef.value.height;
        bgCtx.drawImage(img, 0, 0, bgCanvasRef.value.width, bgCanvasRef.value.height);

        // // 绘制全屏半透明蒙版
        // ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        // ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);

        //ctx.drawImage(img, 0, 0, canvasRef.value.width, canvasRef.value.height);
    }
    // 绘制全屏半透明蒙版
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);

    // 清除externalRevealAreas区域，使其全透明，显示背景图
    ctx.globalCompositeOperation = 'destination-out';
    props.externalRevealAreas.forEach(area => {
        ctx.clearRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
    });
    ctx.globalCompositeOperation = 'source-over';
    revealAreas.value.forEach(area => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
        ctx.strokeStyle = area === activeArea.value ? 'red' : '#FFF';
        ctx.strokeRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
    });
};


// 判断是否在externalRevealAreas区域内
const isInsideExternalAreas = (x, y, currentArea) => {
    if (currentArea) {
        return x >= currentArea.x && x <= currentArea.x + currentArea.width && y >= currentArea.y && y <= currentArea.y + currentArea.height
    }
    return props.externalRevealAreas.some(area =>
        x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
    );
};


const handleMouseDown = (event) => {
    const rect = canvasRef.value.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    if (!isInsideExternalAreas(x, y)) {
        return; // 如果不在允许的区域内，不处理鼠标按下事件
    }

    dragging.value = false;
    resizing.value = false;
    activeArea.value = null;
    // 找到当前点击的 externalRevealArea
    currentArea = props.externalRevealAreas.find(area =>
        x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
    );
    console.log('currentArea', currentArea)
    revealAreas.value.forEach(area => {
        if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
            offsetX.value = x - area.x;
            offsetY.value = y - area.y;
            activeArea.value = area;
            lastActiveArea.value = area;
            console.log('activeArea', activeArea.value)
            if (x > area.x + area.width - 10 || x < area.x + 10 || y > area.y + area.height - 10 || y < area.y + 10) {
                resizing.value = true;
                resizeDirection.value = determineResizeDirection(x, y, area);
            } else {
                dragging.value = true;
            }
        }
    });
    if (!activeArea.value) {
        const newArea = { x, y, width: 0, height: 0, parentArea: currentArea };
        revealAreas.value.push(newArea);
        activeArea.value = newArea;
        resizing.value = true;
        resizeDirection.value = 'bottom-right';
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
    if (!isInsideExternalAreas(x, y, currentArea)) {
        canvasRef.value.style.cursor = 'not-allowed'; // 修改鼠标样式为禁止
        return; // 如果不在允许的区域内，不处理鼠标移动事件
    } else {
        canvasRef.value.style.cursor = 'move'; // 修改鼠标样式为默认
    }

    if (dragging.value) {
        //activeArea.value.x = Math.max(0, Math.min(canvasRef.value.width / scale - activeArea.value.width, x - offsetX.value));
        //activeArea.value.y = Math.max(0, Math.min(canvasRef.value.height / scale - activeArea.value.height, y - offsetY.value));
        const maxX = activeArea.value.parentArea.x + activeArea.value.parentArea.width - activeArea.value.width;
        const maxY = activeArea.value.parentArea.y + activeArea.value.parentArea.height - activeArea.value.height;
        const newX = Math.min(Math.max(activeArea.value.parentArea.x, x - offsetX.value), maxX);
        const newY = Math.min(Math.max(activeArea.value.parentArea.y, y - offsetY.value), maxY);
        activeArea.value.x = newX;
        activeArea.value.y = newY;
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
};

const resizeFromBottom = (y) => {
    const newY = Math.max(y, activeArea.value.y + 10);
    activeArea.value.height = newY - activeArea.value.y;
};

const resizeFromLeft = (x) => {
    const originalWidth = activeArea.value.width;
    activeArea.value.width += activeArea.value.x - x;
    activeArea.value.x = x;
    if (activeArea.value.width < 10) {
        activeArea.value.x -= 10 - originalWidth;
        activeArea.value.width = 10;
    }
};

const resizeFromRight = (x) => {
    const newX = Math.max(x, activeArea.value.x + 10);
    activeArea.value.width = newX - activeArea.value.x;
};

const updateCursor = (x, y) => {
    if (!isInsideExternalAreas(x, y)) {
        canvasRef.value.style.cursor = 'not-allowed';
        return;
    }

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
    //判断选中区域是否在revealAreas中，如果不在则说明此区域过小，则将选中区域恢复到上一个选中区域
    if (activeArea.value && !revealAreas.value.includes(activeArea.value)) {
        activeArea.value = lastActiveArea.value;
    }
    dragging.value = false;
    resizing.value = false;
    currentArea = null;
    //activeArea.value = null;
    canvasRef.value.style.cursor = 'default';
    inputRef.value.focus();
    drawCanvas(); // 重新绘制画布以更新显示
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
    //判断每个奖符的奖符列表范围 range 是否填写，未填写则提示报错并选中此区域。
    const errorArea = revealAreas.value.find(area => !area.range || area.range.length === 0);
    console.log('errorArea', errorArea)
    if (errorArea) {
        activeArea.value = errorArea;
        inputRef.value.focus();
        lastActiveArea.value = errorArea;
        drawCanvas();
        ElMessage.error('请填写奖符数据！');
        return false;
    }
    return revealAreas.value;
};
defineExpose({
    drawCanvas,
    getAreas
})
</script>

<style lang="scss" scoped>
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

.reveal-area-editor {
    background: black;
    flex: 1;
    height: 600px;
    overflow: auto;
    display: flex;
    justify-content: center;
    position: relative;
    border-radius: 4px;

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
        opacity: 0;

        &.appear-tv {
            transform: scale(0.5);
            transition: all 0.5s ease-in-out;
            animation: appear-tv 0.5s forwards;
        }

        &.disappear-tv {
            transform: scale(1);
            transition: all 0.5s ease-in-out;
            animation: disappear-tv 0.5s forwards;
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
    margin-top: 10px;
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
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.context-menu li {
    padding: 5px 15px;
    cursor: pointer;
}

.context-menu li:hover {
    background-color: #f0f0f0;
}
</style>
