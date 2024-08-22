<template>
    <el-dialog v-model="setQtyDialogVisible" :width="600" :destroy-on-close="true" title="该揭开区有几个奖符？"
        :close-on-click-modal="false" :close-on-press-escape="false">
        <el-slider v-model="prizeQty" :min="1"
            :max="selectedGameArea.range?.length == 0 ? 1 : selectedGameArea.range?.length" show-input />
        <template #footer>
            <el-button @click="closeQtyDialog">取消</el-button>
            <el-button type="primary" @click="confirmSetQty">确定</el-button>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref,inject } from 'vue';

const selectedGameArea = defineModel("selectedGameArea");
const activeArea = defineModel("activeArea");
const setQtyDialogVisible = defineModel("setQtyDialogVisible");

const drawCanvas = inject('drawCanvas');

const prizeQty = ref(1);

const confirmSetQty = () => {
    if (Array.isArray(activeArea.value.drawData)) {
        // 将当前区域的drawData还给selectedGameArea.value.range
        selectedGameArea.value.range.push(...activeArea.value.drawData);
    }

    // 从合并后的数组中随机取出N个元素
    const selectedRangeData = selectedGameArea.value.range
        .sort(() => 0.5 - Math.random()) // 打乱数组
        .slice(0, prizeQty.value); // 取前N个元素

    if (selectedRangeData.length < prizeQty.value) {
        ElMessage.error('奖符数据不足！');
        return;
    }
    // 更新drawData
    activeArea.value.drawData = selectedRangeData;

    // 创建一个计数器对象来记录selectedRangeData中每个元素的数量
    const countMap = selectedRangeData.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});

    // 从range中去除已选元素，确保只去除正确数量的重复元素
    selectedGameArea.value.range = selectedGameArea.value.range.filter(item => {
        if (countMap[item]) {
            countMap[item] -= 1;
            return false;
        }
        return true;
    });
    // 关闭对话框
    setQtyDialogVisible.value = false;

    drawCanvas();
};
const closeQtyDialog = () => {
    setQtyDialogVisible.value = false;
};
</script>
<style lang="scss" scoped></style>