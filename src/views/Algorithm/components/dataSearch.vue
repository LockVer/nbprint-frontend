<template>
    <div class="general-content">
        <x-component label="产品名称">
            <el-input clearable v-model="searchForm.productName" placeholder="请输入产品名称" />
        </x-component>
        <x-component label="客户">
            <el-input clearable v-model="searchForm.customerName" placeholder="请输入客户名称" />
        </x-component>
        <x-component label="业务员">
            <el-select v-model="searchForm.progressValue" clearable filterable placeholder="请选择进度" >
                <el-option v-for="item in progressValueOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
            </el-select>
        </x-component>
        <x-component label="状态">
            <el-select v-model="searchForm.orderStatus" clearable filterable placeholder="请选择状态" >
                <el-option v-for="item in progressValueOptions" :key="item.value" :label="item.label"
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
import { ref, reactive,watch } from 'vue';
import XComponent from '@/components/container/XComponent.vue';

const emit = defineEmits(['update:searchForm']);

const progressValueOptions = [
    {
        value: 'Option1',
        label: 'Option1',
    },
    {
        value: 'Option2',
        label: 'Option2',
    },
    {
        value: 'Option3',
        label: 'Option3',
    },
    {
        value: 'Option4',
        label: 'Option4',
    },
    {
        value: 'Option5',
        label: 'Option5',
    },
]
// 搜索表单数据
const searchForm = reactive({
    chineseName: '',
    customerName: '',
    smallCardSize: '',
    progressValue: '',
    orderStatus: '',
    startTime: null,// 搜索开始时间
    endTime: null,// 搜索结束时间
});
const createTime = ref(null); // 创建时间范围


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
        searchForm.startTime = formattedDates[0];
        searchForm.endTime = formattedDates[1];
    } else {
        searchForm.startTime = null;
        searchForm.endTime = null;
    }
}
watch(searchForm, (newVal) => {
    const filteredForm = {};
    for (const key in newVal) {
        if (newVal[key]) {
            filteredForm[key] = newVal[key];
        }
    }
    // console.log(filteredForm)
    emit('update:searchForm', filteredForm);
},{deep: true});


</script>

<style lang="scss" scoped>
.general-content {
    width: 100%;
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}
</style>