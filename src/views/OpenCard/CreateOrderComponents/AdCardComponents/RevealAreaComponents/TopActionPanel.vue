<template>
    <div class="auto-action">
        <x-check-box v-model="mode" margin="0px 8px 0px 0px" :DataList="modeList" type="radio"></x-check-box>
        <el-button v-if="selectedAreas.length > 0 && mode === 'select'" @click="createGameArea"
            type="primary">创建游戏区</el-button>
        <el-button v-if="mode === 'select'" @click="allSelect" type="primary" plain>全选</el-button>
        <el-button v-if="mode === 'select'" @click="allNotSelect" type="primary" plain>取消全选</el-button>
        <el-button @click="clearArea" type="danger" plain>清空</el-button>
    </div>
</template>
<script setup>
import { inject } from 'vue';
import XCheckBox from '../../../../../components/functional/XCheckBox.vue';
import { v4 as uuidv4 } from 'uuid'; // 导入uuid库

const mode = defineModel("mode");
const selectedAreas = defineModel("selectedAreas");
const revealAreas = defineModel("revealAreas");
const gameAreas = defineModel("gameAreas");

const drawCanvas = inject('drawCanvas');
const modeList = [
    { text: '选择模式', value: "select" },
    { text: '创建模式', value: "create" }
];

const allSelect = () => {
    selectedAreas.value = revealAreas.value;
    drawCanvas();
};
const allNotSelect = () => {
    selectedAreas.value = [];
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
</script>
<style lang="scss" scoped>
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
</style>