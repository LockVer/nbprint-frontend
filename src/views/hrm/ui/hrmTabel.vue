<template>
    <x-card :title="title" :isHrmBtn="true">
        <div class="search-content">
            <x-component label="ID" :width="'15%'">
                <el-input v-model="searchForm.id" placeholder="请输入ID" />
            </x-component>
            <x-component label="姓名" :width="'15%'">
                <el-input v-model="searchForm.name" placeholder="请输入姓名" />
            </x-component>
            <x-component label="性别" :width="'15%'">
                <el-select v-model="searchForm.sex" placeholder="请选择性别">
                    <el-option label="Zone one" value="shanghai" />
                    <el-option label="Zone two" value="beijing" />
                </el-select>
            </x-component>
            <x-component label="职位" :width="'15%'">
                <el-select v-model="searchForm.positions" placeholder="请选择职位">
                    <el-option label="Zone one" value="shanghai" />
                    <el-option label="Zone two" value="beijing" />
                </el-select>
            </x-component>
        </div>
    </x-card>
</template>

<script setup>
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import { reactive } from 'vue'

const props = defineProps({
    title: {
        type: String,
        default: ""
    }
})

const searchForm = reactive({
    id: "",
    name: "",
    sex: "",
    positions: ""
})
</script>

<style lang="scss" scoped>
.search-content {
    display: flex;
    column-gap: 40px;
    margin-bottom: 20px;

    :deep(.el-select__suffix) {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        background: #F1F1F1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    :deep(.el-select__wrapper) {
        padding: 4px 8px;
    }
}
</style>