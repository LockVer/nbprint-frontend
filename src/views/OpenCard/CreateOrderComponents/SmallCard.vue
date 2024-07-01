<template>
    <x-card title="小卡信息">
        <x-component label="尺寸(mm)" padding="0 0 10px 0">
            <x-check-box v-model="initData.size" :DataList="cardSizeList" type="radio"></x-check-box>
        </x-component>
        <x-component label="揭开口数量" padding="0 0 10px 0">
            <x-check-box v-model="initData.openQuantity" :DataList="cardOpenList" type="radio"></x-check-box>
        </x-component>
        <x-component label="小卡单价" width="220px" padding="0 0 18px 0">
            <el-input v-model="initData.price" placeholder="请输入小卡单价" />
        </x-component>
        <x-component label="盒数" padding="0 0 18px 0">
            <el-input-number v-model="initData.boxCount" :min="1" />
        </x-component>
        <x-component label="每盒数量" padding="0 0 18px 0">
            <el-input-number v-model="initData.quantityPerBox" :min="1" />
        </x-component>
        <div class="bg-img">
            <x-component label="正面背景" width="48%">
                <x-image-upload v-model="initData.frontImage"></x-image-upload>
            </x-component>
            <x-component label="小卡揭开面背景" width="48%">
                <x-image-upload v-model="initData.backImage"></x-image-upload>
            </x-component>
        </div>
    </x-card>
</template>

<script setup>
import { ref } from 'vue';
import XCard from '../../../components/container/XCard.vue';
import XComponent from '../../../components/container/XComponent.vue';
import XCheckBox from '../../../components/functional/XCheckBox.vue';
import XImageUpload from '../../../components/functional/XImageUpload.vue';

const initData = defineModel("initData");

const cardSizeList = [
    { text: '48*76', value: { width: 48, height: 76 } },
    { text: '48*96', value: { width: 48, height: 96 } },
    { text: '47.5*66', value: { width: 47.5, height: 66 } },
    { text: '50.8*88.9', value: { width: 50.8, height: 88.9 } },
    { text: '51*76', value: { width: 51, height: 76 } },
    { text: '51*51', value: { width: 51, height: 51 } },
    { text: '42*71', value: { width: 42, height: 71 } },
    { text: '44*60', value: { width: 44, height: 60 } },
];

const cardOpenList = [
    { text: '1', value: 1 },
    { text: '3', value: 3 },
    { text: '5', value: 5 }
];

</script>

<style lang="scss" scoped>
.bg-img {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>
