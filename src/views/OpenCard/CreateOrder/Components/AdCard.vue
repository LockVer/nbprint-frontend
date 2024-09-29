<template>
    <x-card title="宣传卡信息">
        <div class="ad-card-header">
            <x-component label="宣传卡数量" padding="0 0 18px 0">
                <el-input-number v-model="communicator.data.adCardQty" :min="1" :max="10" />
            </x-component>
        </div>
        <div class="ad-card-list">
            <div class="ad-card-item" v-for="(item, index) in communicator.data.adCardList" :key="index">
                <div class="list-header">宣传卡{{ index + 1 }}</div>
                <div class="list-body">
                    <div class="row">
                        <x-component label="背景图" width="220px">
                            <x-input-upload v-model:size="item.imageSize" v-model:image="item.image"
                                @changeImage="changeBackgroundImage(item)"></x-input-upload>
                        </x-component>
                        <x-component label="宣传卡尺寸(mm)" width="220px">
                            <el-input placeholder="自动计算" :value="item.adCardSize" disabled></el-input>
                        </x-component>
                    </div>
                    <div class="row full">
                        <x-component label="有无揭开口">
                            <x-check-box :DataList="isOpenable" v-model="item.type" type="radio"></x-check-box>
                        </x-component>
                    </div>
                    <div class="row full" v-if="item.type == 'openable'">
                        <x-component label="揭开口方向">
                            <x-check-box v-model="item.openDirection" :DataList="openDirectionList"
                                type="radio"></x-check-box>
                        </x-component>
                    </div>
                    <div class="row full" v-if="item.type == 'openable'">
                        <x-component label="揭开区" width="220px">
                            <el-button class="xbutton" type="primary" :disabled="!(item.image)"
                                @click="showRevealArea(item)">
                                添加揭开区
                            </el-button>
                            <!-- <el-input placeholder="请添加揭开区" :value="getRevealAreaCount(index)" readonly
                                v-if="getRevealAreaCount(index) > 0" :disabled="getPrizeAreaCount(index) > 0">
                                <template #append>
                                    <el-button :disabled="getPrizeAreaCount(index) > 0" type="primary" link
                                        @click="addRevealArea(index)">修改</el-button>
                                </template>
</el-input> -->
                        </x-component>
                    </div>
                    <div class="row">
                        <x-component label="盒号" width="220px">
                            <el-input v-model="item.adBoxCode" placeholder="请填写盒号" />
                        </x-component>
                        <x-component label="盒号位置" column="span 2">
                            <x-check-box :DataList="adCardNoPostionList" v-model="item.adBoxCodePosition"
                                type="radio"></x-check-box>
                        </x-component>
                        <x-component label="设置自定义盒号位置" width="220px" @click="showBoxNumberDiglog(item)" v-if="item.adBoxCodePosition == 'CUSTOM'">
                            <el-button class="xbutton" type="primary">
                                添加盒号位置
                            </el-button>
                        </x-component>
                    </div>
                    <div class="row full">
                        <x-component label="备注" width="220px">
                            <el-input v-model="item.comment" placeholder="" />
                        </x-component>
                    </div>
                </div>
            </div>
        </div>
        <el-dialog v-model="boxNumberDialogVisible" :destroy-on-close="true" title="添加盒号位置" :show-close="false"
            :close-on-click-modal="false" :close-on-press-escape="false" :fullscreen="true" class="reveal-dialog">
            <!-- 添加揭开区的内容 -->
            <BoxNumberEditor ref="boxNumberAreaEditorRef" :currentAdCard="currentAdCard"
                @addDone="addDone" @closePanel="closePanel" />
        </el-dialog>
        <el-dialog v-model="revealDialogVisible" :destroy-on-close="true" title="添加揭开区" :show-close="false"
            :close-on-click-modal="false" :close-on-press-escape="false" :fullscreen="true" class="reveal-dialog">
            <!-- 添加揭开区的内容 -->
            <RevealAreaEditor ref="revealAreaEditorRef" :currentAdCard="currentAdCard" @addDone="addDone"
                @closePanel="closePanel" />
        </el-dialog>
    </x-card>
</template>
<script setup>
import { ref, reactive, provide, watch, defineModel } from 'vue';
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import XInputUpload from '@/components/functional/XInputUpload.vue';
import XCheckBox from '@/components/functional/XCheckBox.vue';
import RevealAreaEditor from './AdCardComponents/RevealArea/Editor.vue';
import BoxNumberEditor from './AdCardComponents/BoxNumberPosition/Editor.vue';
import Communicator from '@/utils/Communicator';
import CalculationUtils from './AdCardComponents/AdCardUtils/CalculationUtils';

const smallCard = defineModel("smallCard");
const initData = defineModel("initData");
const communicatorName = 'adCardCommunicator';  // 通信器名称

// 实例化 Communicator 并创建响应式对象
const communicator = reactive(new Communicator());
communicator.data.adCardQty = 1;    // 宣传卡数量
communicator.data.adCardList = [
    {
        imageSize: '',
        image: '',
        adCardSize: '',
        adBoxCode: '',
        type: 'non-openable',
        openDirection: 'T',
        adBoxCodePosition: 'BL',
        openRegions: [],
        boxNumberRegions: []
    }
];
communicator.data.adCardList = initData;
console.log('initData:', initData);
// 将通信器提供给子组件
provide(communicatorName, communicator);
// 选择是否有揭开口的选项
const isOpenable = [
    { text: '有', value: 'openable' },
    { text: '无', value: 'non-openable' }
];
// 揭开口方向选项
const openDirectionList = [
    { text: '上', value: 'T' },
    { text: '下', value: 'B' },
    { text: '左', value: 'L' },
    { text: '右', value: 'R' }
];
// 盒号位置选项
const adCardNoPostionList = [
    { text: '下左', value: 'BL' },
    { text: '下中', value: 'BC' },
    { text: '下右', value: 'BR' },
    { text: '自定义', value: 'CUSTOM' }
];
const revealDialogVisible = ref(false);
const boxNumberDialogVisible = ref(false);
const currentAdCard = ref(null);

watch(() => communicator.data.adCardQty, (newVal, oldVal) => {
    if (newVal > communicator.data.adCardList.length) {
        for (let i = communicator.data.adCardList.length; i < newVal; i++) {
            communicator.data.adCardList.push({
                imageSize: '',
                image: '',
                adCardSize: '',
                adBoxCode: '',
                type: 'non-openable',
                openDirection: 'T',
                adBoxCodePosition: 'BL',
                openRegions: [],
                boxNumberRegions: []
            });
        }
    } else {
        communicator.data.adCardList = communicator.data.adCardList.slice(0, newVal);
    }
});
watch(smallCard.value, (newVal, oldVal) => {
    communicator.data.adCardList.forEach((item) => {
        item.adCardSize = CalculationUtils.findMaxRectBWithRatio(smallCard.value.box, item.imageSize);
    });
}, { deep: true });


const showRevealArea = (item) => {
    currentAdCard.value = item;
    revealDialogVisible.value = true;
};
const showBoxNumberDiglog = (item) => {
    currentAdCard.value = item;
    boxNumberDialogVisible.value = true;
};
const changeBackgroundImage = (item) => {
    item.adCardSize = CalculationUtils.findMaxRectBWithRatio(smallCard.value.box, item.imageSize);
}
const addDone = () => {
    console.log(communicator.data)
    revealDialogVisible.value = false;
    boxNumberDialogVisible.value = false;
}

const closePanel = () => {
    revealDialogVisible.value = false;
    boxNumberDialogVisible.value = false;
}

</script>
<style scoped lang="scss">
.ad-card-header {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 10px;
}

.ad-card-list {
    display: flex;
    flex-direction: column;

    .ad-card-item {
        margin-bottom: 20px;
    }

    .list-header {
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 14px;
        padding: 6px 10px;
        color: $primary-color;
        background-color: rgba($color: $primary-color-light, $alpha: 0.04);
    }

    .list-body {
        display: grid;
        grid-template-columns: 1fr;
        /* 每个 row 占据一整行 */
        grid-gap: 10px;

        .row {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            grid-gap: 10px;

            &.full {
                grid-template-columns: 1fr;
            }
        }
    }
}
</style>
<style lang="scss">
.reveal-dialog {
    padding: 0;
    border-radius: 0px;

    .el-dialog__header {
        display: none;
    }
}
</style>