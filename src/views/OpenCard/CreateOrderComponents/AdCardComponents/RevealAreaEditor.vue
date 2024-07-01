<template>
    <div class="reveal-area-editor" ref="editorRef" @contextmenu.prevent="handleContextMenu($event)">
        <canvas ref="canvasRef" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"></canvas>

        <ul v-if="showContextMenu" class="context-menu"
            :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }">
            <li @click="copyArea">复制</li>
            <li @click="deleteArea">删除</li>
        </ul>
    </div>
    <div class="auto-action">
        <el-button @click="clearArea" type="danger" plain>清空</el-button>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineExpose } from 'vue';
import { cloneDeep } from 'lodash';
import { ElMessageBox } from 'element-plus';
const props = defineProps({
    backgroundImageUrl: String,
    preAreas: Array
});

const canvasRef = ref(null);
const editorRef = ref(null);

const revealAreas = ref(cloneDeep(props.preAreas || []));

const activeArea = ref(null);
const dragging = ref(false);
const resizing = ref(false);
const resizeDirection = ref('');
const offsetX = ref(0);
const offsetY = ref(0);
const alignLine = ref([]);
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
let rightClickedArea = null;
let scale = 1;

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
    revealAreas.value.forEach(area => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
        ctx.strokeStyle = area === activeArea.value ? 'red' : '#FFF';
        ctx.strokeRect(area.x * scale, area.y * scale, area.width * scale, area.height * scale);
    });
    // 绘制对齐线
    if (alignLine.value) {
        ctx.fillStyle = 'red';
        alignLine.value.forEach(line => {
            ctx.fillRect(line.x * scale, line.y * scale, line.width, line.height);
        });
    }
};

onMounted(() => {
    drawCanvas();
});

watch(() => props.backgroundImageUrl, (newVal) => {
    console.log('watch')
    if (canvasRef.value && editorRef.value) {
        drawCanvas();
    }
}, { immediate: true });

const handleMouseDown = (event) => {
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

const checkAlignLine = () => {
    //检查当前区域的x是否靠近数组中其他区域的x，如果是，则吸附到该区域的x，并赋值对齐线的数据给alignLine
    alignLine.value = [];
    //吸附像素
    const snapPixel = 20;
    revealAreas.value.forEach(area => {
        //计算出当前区域靠哪个边最近，左右边为一组，上下边为一组，避免同时靠近左右边和上下边时，拉扯的情况
        const left = Math.abs(activeArea.value.x - area.x);
        const right = Math.abs(activeArea.value.x + activeArea.value.width - area.x - area.width);
        const top = Math.abs(activeArea.value.y - area.y);
        const bottom = Math.abs(activeArea.value.y + activeArea.value.height - area.y - area.height);

        if (area != activeArea.value && (left < snapPixel || right < snapPixel)) {
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
        if (area != activeArea.value && (top < snapPixel || bottom < snapPixel)) {
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
    // //检查当前区域的x是否靠近数组中其他区域的x，如果是，则吸附到该区域的x，并赋值对齐线的数据给alignLine
    // alignLine.value= null;
    // revealAreas.value.forEach(area => {
    //     //判断是否靠近左边
    //     if (area !== activeArea.value && Math.abs(activeArea.value.x - area.x) < 10) {
    //         activeArea.value.x = area.x;
    //         alignLine.value = { x: area.x, y: 0, width: 1, height: canvasRef.value.height };
    //     }
    //     //判断是否靠近右边
    //     if (area !== activeArea.value && Math.abs(activeArea.value.x + activeArea.value.width - area.x - area.width) < 10) {
    //         activeArea.value.x = area.x + area.width - activeArea.value.width;
    //         alignLine.value = { x: area.x + area.width, y: 0, width: 1, height: canvasRef.value.height };
    //     }
    //     //判断是否靠近上边
    //     if (area !== activeArea.value && Math.abs(activeArea.value.y - area.y) < 10) {
    //         activeArea.value.y = area.y;
    //         alignLine.value = { x: 0, y: area.y, width: canvasRef.value.width, height: 1 };
    //     }
    //     //判断是否靠近下边
    //     if (area !== activeArea.value && Math.abs(activeArea.value.y + activeArea.value.height - area.y - area.height) < 10) {
    //         activeArea.value.y = area.y + area.height - activeArea.value.height;
    //         alignLine.value = { x: 0, y: area.y + area.height, width: canvasRef.value.width, height: 1 };
    //     }
    // });
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
    drawCanvas(); // 重新绘制画布以更新显示
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
    // 返回当前的揭开区域数组，并根据区域的x,y进行排序后返回副本,先按y排序，再按x排序
    return cloneDeep(revealAreas.value).sort((a, b) => a.y - b.y || a.x - b.x);
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
    height: 600px;
    overflow: auto;
    display: flex;
    justify-content: space-between;
    position: relative;
    border-radius: 4px;

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
