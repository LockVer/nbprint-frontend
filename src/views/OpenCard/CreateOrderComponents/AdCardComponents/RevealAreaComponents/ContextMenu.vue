<template>
    <ul v-if="showContextMenu" class="context-menu"
        :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }">
        <li v-if="mode == 'create'" @click="copyArea">复制</li>
        <li v-if="mode == 'create'" @click="deleteArea">删除</li>
        <li v-if="mode == 'select'" @click="setPrizeQty">设置奖符数量</li>
        <li v-if="mode == 'select'" @click="removePrizeQty">移出所有奖符</li>
    </ul>
</template>
<script setup>
import { ref, defineProps, defineEmits, onMounted,onUnmounted,inject } from 'vue';

const revealAreas = defineModel("revealAreas");
const showContextMenu = defineModel("showContextMenu");
const activeArea = defineModel("activeArea");
const setQtyDialogVisible = defineModel("setQtyDialogVisible");
const selectedGameArea = defineModel("selectedGameArea");


const props = defineProps({
    mode: String,
    contextMenuPosition: Object,
    rightClickedArea: Object,
});

const drawCanvas = inject('drawCanvas');
onMounted(() => {
    // 监听点击事件，如果点击的不是菜单，则隐藏菜单
    window.addEventListener('click', (event) => {
        if (!event.target.matches('.context-menu, .context-menu *')) {
            showContextMenu.value = false;
        }
    });
});

onUnmounted(() => {
    window.removeEventListener('click', (event) => {
        if (!event.target.matches('.context-menu, .context-menu *')) {
            showContextMenu.value = false;
        }
    });
});

const copyArea = () => {
    console.log(props.rightClickedArea);
    if (props.rightClickedArea) {
        // 创建一个新的区域对象，位置稍微偏移，以便用户可以看到复制出的新区域
        const newArea = { ...(props.rightClickedArea), x: props.rightClickedArea.x + 10, y: props.rightClickedArea.y + 10 };
        revealAreas.value.push(newArea);
        drawCanvas();
    }
    showContextMenu.value = false;
};


const deleteArea = () => {
    if (props.rightClickedArea) {
        // 从数组中删除选中的区域
        revealAreas.value = revealAreas.value.filter(area => area !== props.rightClickedArea);
        drawCanvas();
    }
    showContextMenu.value = false;
};

const setPrizeQty = () => {
    setQtyDialogVisible.value = true;
    showContextMenu.value = false;
    console.log(activeArea.value)
};
const removePrizeQty = () => {
    if (activeArea.value.drawData) {
        selectedGameArea.value.range.push(...activeArea.value.drawData);
        activeArea.value.drawData = [];
        drawCanvas();
    }
    showContextMenu.value = false;
};

</script>
<style lang="scss" scoped>
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
</style>