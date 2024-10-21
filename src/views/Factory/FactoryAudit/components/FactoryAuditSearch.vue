<template>
    <div class="general-content">
        <x-component label="产品名称">
            <el-input v-model="searchForm.productName" placeholder="请输入产品名称" />
        </x-component>
        <x-component label="客户">
            <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" />
        </x-component>
        <x-component label="业务员">
            <el-input v-model="searchForm.businessPeople" placeholder="请输入业务员名称" />
        </x-component>
        <!-- <x-component label="进度">
            <el-select v-model="searchForm.progress" clearable filterable placeholder="请选择进度" >
                <el-option v-for="item in progressValueOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
            </el-select>
        </x-component> -->
        <x-component label="状态">
            <el-select v-model="searchForm.progressStatus" clearable filterable placeholder="请选择状态" >
                <el-option v-for="item in progressStatusValueOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
            </el-select>
        </x-component>
        <x-component label="创建时间">
            <el-date-picker v-model="createTime" type="daterange" style="width: 100%;" start-placeholder="开始日期"
                end-placeholder="结束日期" :default-value="[new Date(), new Date()]" @change="changeHandler" />
        </x-component>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import XComponent from '@/components/container/XComponent.vue';

const emit = defineEmits(['update:searchData']);
// 搜索进度数据
// const progressValueOptions = [
//     {
//         "label": "订单创建",
//         "value": "1"
//     },
//     {
//         "label": "工厂审核",
//         "value": "2"
//     },
//     {
//         "label": "业务自审",
//         "value": "3"
//     },
//     {
//         "label": "客户确认",
//         "value": "4"
//     },
//     {
//         "label": "算法规则",
//         "value": "5"
//     },
//     {
//         "label": "数据生成",
//         "value": "6"
//     },
//     {
//         "label": "工厂生产",
//         "value": "7"
//     },
//     {
//         "label": "物流运输",
//         "value": "8"
//     },
//     {
//         "label": "尾款支付",
//         "value": "9"
//     },
//     {
//         "label": "订单确认",
//         "value": "10"
//     }
// ]
// 搜索订单状态数据
const progressStatusValueOptions = [
    {
        "label": "待审核",
        "value": "1"
    },
    {
        "label": "已审核",
        "value": "2"
    },
    {
        "label": "未通过",
        "value": "3"
    }
]
// 搜索表单数据
const searchForm = reactive({
    productName: '',
    customerName: '',
    businessPeople: '',
    // progress: '',
    progressStatus: '',
});
const createTime = ref(null); // 创建时间范围
const startTime = ref(''); // 搜索开始时间
const endTime = ref(''); // 搜索结束时间


// 日期范围变化处理
const changeHandler = (value) => {
    if (value) {
        const formattedDates = value.map(date => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        });
        startTime.value = formattedDates[0];
        endTime.value = formattedDates[1];
    } else {
        startTime.value = '';
        endTime.value = '';
    }
    emitSearchData()
}

const emitSearchData = () => {
    emit('update:searchData', {
        ...searchForm,
        startTime: startTime.value,
        endTime: endTime.value
    });
}

watch(searchForm, emitSearchData, { deep: true });
</script>

<style lang="scss" scoped>
.general-content {
    width: 100%;
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}
</style>