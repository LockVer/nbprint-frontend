<template>
    <div class="operation-area">
        <div class="title">
            <span>添加揭开区</span>
        </div>
        <div class="content">
            <div class="step step-1" v-if="communicator.data.step == 1">
                <div class="small-title">
                    <span>Step1 创建揭开区</span>
                </div>
                <x-component label="已创建揭开区数量" padding="0 0 18px 0">
                    <el-input placeholder="已创建揭开区数量" :value="revealAreaCount" disabled />
                </x-component>
                <x-component label="自动排列间距(mm)" padding="0 0 18px 0">
                    <el-input-number v-model="communicator.data.minGridSize" :min="6" :max="20" :step="0.01" @change="handleChange" />
                    <!-- <el-input placeholder="自动排列间距" :value="(communicator.data.minGridSize||0).toFixed(1)" disabled /> -->
                </x-component>
                <div class="step-action">
                    <el-button type="primary" @click="nextStep" :disabled="revealAreaCount == 0">下一步</el-button>
                    <el-button type="primary" plain @click="closePanel">退出</el-button>
                </div>
            </div>
            <div class="step step-2" v-if="communicator.data.step == 2">
                <div class="small-title">
                    <span>Step2 创建游戏区</span>
                </div>
                <div class="game-list">
                    <div class="game-item" :class="{ 'active': item.active }"
                        v-for="(item, index) in communicator.data.gameList" :key="index" @click="selectGameItem(item)">
                        <div class="text">{{ item.text }}</div>
                        <span class="iconfont icon-close" @click="removeGameList(item)"></span>
                    </div>
                    <div class="no-game-list" v-if="(communicator.data.gameList||[]).length == 0">
                        <span>暂未创建游戏区</span>
                    </div>
                </div>
                <div class="step-action">
                    <el-button type="primary" @click="prevStep">上一步</el-button>
                    <el-button type="primary" plain @click="addDone">添加完成</el-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, inject, computed, watch,defineEmits } from 'vue';
import XComponent from '@/components/container/XComponent.vue';

const emits = defineEmits(['addDone', 'closePanel']);
const communicator = inject('revealAreaCommunicator');
communicator.data.step = 1; // 初始步骤
communicator.data.gameList = [];
const revealAreaCount = computed(() => {
    if (communicator.data.shapeList) {
        return communicator.data.shapeList.length;
    } else {
        return 0;
    }
});

const nextStep = () => {
    if (revealAreaCount == 0) {
        return;
    }
    communicator.data.step = communicator.data.step + 1;
    setActions();
}
const prevStep = () => {
    communicator.data.step = communicator.data.step - 1;
    setActions();
}

const setActions = () => {
    switch (communicator.data.step) {
        case 1:
            communicator.data.showHelperActions = ['alignTop', 'alignBottom', 'alignLeft', 'alignRight', 'alignMiddle', 'alignCenter', 'horizontal', 'vertical'];
            communicator.data.showMainActions = ['grid', 'rect', 'circular'];
            break;
        case 2:
            communicator.data.showHelperActions = ['createGameArea'];
            communicator.data.showMainActions = ['grid'];
            break;
        default:
            break;
    }
}

const removeGameList = (item) => {
    communicator.data.shapeList.filter(shape => shape.id == item.id).forEach(shape => {
        shape.id = "";
        shape.awardList = [];
    });
    const index = communicator.data.gameList.findIndex((game) => game === item);
    communicator.data.gameList.splice(index, 1);
    communicator.data.currentGameArea = null;
    communicator.data.showOperatePanel = false;
    communicator.data.rendererUtil.render();
}

const selectGameItem = (item) => {
    console.log('selectGameItem:', item);
    communicator.data.currentGameArea = item;
    communicator.data.gameList.forEach((game) => {
        if (game.id == item.id) {
            game.active = !game.active;
        } else {
            game.active = false;
        }
        communicator.data.showOperatePanel = game.active;
    });
    communicator.data.rendererUtil.render();
}
const addDone = () => {
    emits('addDone');
}

const closePanel = () => {
    emits('closePanel');
}
</script>
<style scoped lang="scss">
.operation-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;

    .title {
        height: 70px;
        width: 100%;
        display: flex;
        align-items: center;
        font-size: 24px;
        font-weight: bold;
        color: #333333;
        padding: 16px;
    }

    .content {
        display: flex;
        flex-direction: column;
        padding: 16px;

        .step {
            display: flex;
            flex-direction: column;
        }

        .small-title {
            font-size: 16px;
            font-weight: bold;
            color: #454545;
            margin-bottom: 16px;
        }

        .step-action {
            display: flex;
            flex-direction: column;

            .el-button {
                margin: 0;
                margin-bottom: 10px;
                height: 50px;
                width: 100%;
            }
        }

        .game-list {
            display: flex;
            flex-direction: column;

            padding: 10px;
            background-color: #E5E9F5;
            margin-bottom: 16px;
            border-radius: 5px;

            .game-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 5px;
                border-radius: 5px;
                background-color: white;
                margin-bottom: 5px;
                font-size: 12px;
                cursor: pointer;

                span {
                    cursor: pointer;
                    color: #FF3130;
                }

                &:last-child {
                    margin-bottom: 0;
                }

                &.active {
                    background-color: $primary-color;
                    color: white;
                }
            }
        }

        .no-game-list {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #909399;
        }
    }
}
</style>