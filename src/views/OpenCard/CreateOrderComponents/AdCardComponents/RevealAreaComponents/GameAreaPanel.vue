<template>
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
</template>
<script setup>
import { ref,defineProps,inject } from 'vue';

const props = defineProps({
    mode: String
});

const gameAreas = defineModel("gameAreas");
const selectedGameArea = defineModel("selectedGameArea");
const revealAreas = defineModel("revealAreas");

const drawCanvas = inject('drawCanvas');
// 切换游戏区选中状态
const toggleGameAreaSelection = (area) => {
    if (selectedGameArea.value && selectedGameArea.value.id === area.id) {
        selectedGameArea.value = null;
    } else {
        selectedGameArea.value = area;
    }
    console.log(selectedGameArea);
    drawCanvas();
};


// 删除游戏区
const removeGameArea = (area) => {
    gameAreas.value = gameAreas.value.filter(gameArea => gameArea.id !== area.id);
    // 移出游戏区时，清除该游戏区中所有揭开区的奖符数据
    area.areas.forEach((area) => {
        area.drawData = [];
    });
    revealAreas.value.push(...area.areas);
    if (selectedGameArea.value && selectedGameArea.value.id === area.id) {
        selectedGameArea.value = null;
    }
    drawCanvas();
};
</script>
<style lang="scss" scoped>
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
</style>