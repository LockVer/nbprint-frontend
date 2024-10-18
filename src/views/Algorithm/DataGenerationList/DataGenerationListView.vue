<template>
    <x-card title="数据生成" v-model:modelValue="isSpinning"  :isListTitle="true" @updateOrderStatus="updateOrderStatusHandler">
        <!-- 搜索 -->
        <data-search @update:search-form="updateSearchForm" />
    </x-card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import XCard from '@/components/container/XCard.vue';
import dataSearch from '../components/dataSearch.vue';
import AlgorithmService from '@/services/AlgorithmService';
import { ElMessage, ElMessageBox } from 'element-plus';

const searchFormData = ref({}); // 搜索表单数据
const currentPage = ref(1); // 当前页码
const pageSize = ref(12); // 每页大小
const isSpinning = ref(false); // 控制刷新图标旋转
const isUpdateClickable = ref(true); // 控制刷新按钮是否可点击
const dataGenerationList = ref([]); // 数据生成列表
const algorithmService =  new AlgorithmService()

onMounted(() => {
    // 初始化请求
    loadData();
})
// 更新搜索表单
const updateSearchForm = (val) => {
    if(Object.keys(val).length === 0) {
        loadData();
    } else {
        searchFormData.value = val
        loadData();
    }
};
// 刷新数据
const updateOrderStatusHandler = async () => {
    if (!isUpdateClickable.value) {
        isSpinning.value = false; // 立即停止旋转
        ElMessage.warning('请勿频繁点击, 5秒后再试！');
        return;
    }
    isUpdateClickable.value = false; // 设置按钮不可点击
    isSpinning.value = true; // 开始旋转
    const startTime = Date.now(); // 记录开始时间

    try {
        await loadData();
    } finally {
        const elapsedTime = Date.now() - startTime; // 计算经过的时间
        const remainingTime = 600 - elapsedTime; // 计算剩余时间
        const delay = remainingTime > 0 ? remainingTime : 0; // 确保延迟时间为正数

        // 使用 setTimeout 延迟停止旋转，确保旋转时间至少为 600 毫秒
        setTimeout(() => {
            isSpinning.value = false; // 停止旋转
        }, delay);
        // 设置按钮在 5 秒后可点击
        setTimeout(() => {
            isUpdateClickable.value = true; // 设置按钮可点击
        }, 5000);
    }
};
// 请求数据生成数据
const loadData =  async () => {
    let params = {
        "pageSize": pageSize.value,
        "pageNum": currentPage.value
    }
    if (searchFormData.value) {
        params = Object.assign(params, searchFormData.value);
    }

    algorithmService.getAlgorithmList(params).then((res) => {
        dataGenerationList.value = res.data;
        console.log(res)
    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
    });
}
</script>

<style lang="scss" scoped></style>