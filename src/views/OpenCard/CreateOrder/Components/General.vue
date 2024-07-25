<template>
    <x-card title="通用信息">
        <div class="general-content">
            <x-component label="名字" width="220px">
                <el-input v-model="initData.name" placeholder="请输入名称" />
            </x-component>
            <x-component label="译名" width="220px">
                <el-input v-model="initData.translatedName" placeholder="请输入译名" />
            </x-component>
            <x-component label="客户名字" width="220px">
                <el-input v-model="initData.client.clientName" placeholder="请输入客户名字" />
            </x-component>
            <x-component label="业务员" width="220px">
                <el-input v-model="initData.sales.employeeName" placeholder="请输入业务员" />
            </x-component>
            <x-component label="货币符号" width="220px">
                <el-select v-model="initData.currency" placeholder="请选择货币符号">
                    <el-option label="$" value="USD"></el-option>
                    <el-option label="¥" value="CNY"></el-option>
                </el-select>
            </x-component>
        </div>
    </x-card>
</template>

<script setup>
import { ref,watch } from 'vue';
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import { useStore } from 'vuex';


const initData = defineModel("initData");
const s

watch()

</script>


<style lang="scss" scoped>
@import '@/styles/variables.scss';

.general-content {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}
</style>
