<template>
    <div class="panel">
        <div class="left-panel">
            <OperationArea />
        </div>
        <div class="right-panel">
            <XCanvas :communicatorName="communicatorName">
                <div class="game-award">
                    <div class="award-title">设置游戏区奖符</div>
                    <div class="game-award-action">
                        <x-component label="游戏区名称" padding="0 0 18px 0">
                            <el-input placeholder="游戏区名称" v-model="communicator.data.currentGameArea.text" />
                        </x-component>
                        <x-component label="添加奖符数据" padding="0 0 18px 0">
                            <el-input type="textarea" placeholder="游戏区名称" :rows="2" v-model="awardInput" />
                        </x-component>
                        <div class="add-award">
                            <div class="qty">
                                <label>数量：</label>
                                <el-input-number :min="1" :max="10" :step="1" size="small" v-model="addAwardQty"
                                    style="width: 90px;" />
                            </div>
                            <el-button type="primary" size="small" @click="addAward">添加奖符</el-button>
                        </div>
                        <x-component label="已添加奖符数据(未使用)" padding="0 0 18px 0">
                            <el-tag class="tag" closable type="primary"
                                v-for="(item, index) in communicator.data.currentGameArea.awardList" :key="index" @close="removeAward(index)">
                                {{ item }}
                            </el-tag>
                        </x-component>
                        <x-component label="设置奖符数量（个）/揭开区" padding="0 0 18px 0">
                            <template #header>
                                <div class="set-award">
                                    <el-button type="danger" link @click="resetAward">重置</el-button>
                                    <el-button type="primary" link @click="equalAward">均分</el-button>
                                </div>
                            </template>
                            <template #default>
                                <div class="award-operate-list">
                                    <div class="award-operate-item" v-for="(item, index) in communicator.data.shapeList"
                                        :key="index">
                                        <label>{{ item.text }}</label>
                                        <el-input-number :min="1" :max="10" :step="1" style="width: 90px;" size="small"
                                            v-model="item.awardCount" />
                                    </div>
                                </div>
                            </template>
                        </x-component>
                        <x-component label="已使用奖符数据" padding="0 0 18px 0">
                            <el-tag class="tag" type="info" v-for="(item, index) in communicator.data.currentGameArea.awardUsedList" :key="index">
                                {{ item }}
                            </el-tag>
                        </x-component>
                    </div>
                    <div class="footer">
                        <el-button type="primary" plain @click="resetAll">重置</el-button>
                        <el-button type="primary" @click="allocationAward">确定分配</el-button>
                    </div>
                </div>

            </XCanvas>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, provide, inject, defineProps } from 'vue';
import OperationArea from './Components/OperationArea.vue';
import XCanvas from '@/components/functional/xcanvas/XCanvas.vue';
import XComponent from '@/components/container/XComponent.vue';
import Communicator from '@/utils/Communicator';

const props = defineProps({
    currentAdCard: {
        type: Object,
        default: null
    }
});

const communicatorName = 'revealAreaCommunicator';  // 通信器名称
// 实例化 Communicator 并创建响应式对象
const communicator = reactive(new Communicator());
const adCommunicator = inject('adCardCommunicator');
communicator.data.adCardSize = props.currentAdCard.adCardSize;
communicator.data.backgroundImage = props.currentAdCard.imageName;
// 将通信器提供给子组件
provide(communicatorName, communicator);

const awardInput = ref("");
const addAwardQty = ref(1);

const addAward = () => {
    if (awardInput.value === "") {
        return;
    }
    for (let i = 0; i < addAwardQty.value; i++) {
        communicator.data.currentGameArea.awardList.push(awardInput.value);
        console.log(communicator.data.currentGameArea.awardList);
    }
}

const resetAward = () => {
    const shapeList = communicator.data.shapeList.filter(item => item.id === communicator.data.currentGameArea.id);
    shapeList.forEach(item => {
        item.awardCount = 1;
    });
}

const equalAward = () => {
    const shapeList = communicator.data.shapeList.filter(item => item.id === communicator.data.currentGameArea.id);
    const awardCount = communicator.data.currentGameArea.awardList.length;
    const awardCountPerArea = Math.floor(awardCount / shapeList.length);
    shapeList.forEach(item => {
        item.awardCount = awardCountPerArea;
    });
}

const allocationAward = () => {
    let awardList = communicator.data.currentGameArea.awardList;
    //将奖符数据随机打乱
    awardList = awardList.sort(() => Math.random() - 0.5);
    const shapeList = communicator.data.shapeList.filter(item => item.id === communicator.data.currentGameArea.id);
    //将奖符数据根据shape.awardCount分配到shape.awardList中，并将已分配的奖符数据放入shape.awardUsedList中
    shapeList.forEach(item => {
        item.awardList = [];
        for (let i = 0; i < item.awardCount; i++) {
            if (awardList.length > 0) {
                let award = awardList.shift();
                item.awardList.push(award);
                communicator.data.currentGameArea.awardUsedList.push(award);
            }
        }
    });
}

const resetAll = () => {
    communicator.data.shapeList.forEach(item => {
        item.awardCount = 1;
    });
    communicator.data.currentGameArea.awardList.push(...communicator.data.currentGameArea.awardUsedList);
    communicator.data.currentGameArea.awardUsedList = [];
}

const removeAward = (index) => {
    communicator.data.currentGameArea.awardList.splice(index, 1);
}

</script>
<style scoped lang="scss">
.panel {
    display: flex;
    width: 100vw;
    height: 100vh;

    .left-panel {
        width: 270px;
        height: 100%;
        background-color: white;
        box-shadow: 4px 0px 10px 0px #00000014;
        z-index: 1;
    }

    .right-panel {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;

        .panel-header {
            height: 70px;
            background-color: white;
        }

        .panel-body {
            flex: 1;
            background-color: black;
        }

        .game-award {
            padding: 16px;

            .award-title {
                font-size: 20px;
                font-weight: bold;
                color: #333333;
                border-bottom: 1px solid #ebeef5;
                padding-bottom: 12px;
            }

            .game-award-action {
                display: flex;
                flex-direction: column;
                padding: 16px 0;

                .add-award {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;

                    span {
                        margin-right: 10px;
                    }
                }

                .tag {
                    margin-right: 5px !important;
                    margin-bottom: 5px !important;
                }

                .set-award {
                    display: flex;
                    justify-content: flex-end;
                    flex: 1;

                    .el-button.is-link {
                        padding: 0;
                        padding-top: 3px;
                    }
                }

                .award-operate-list {
                    display: flex;
                    flex-direction: column;
                    padding: 10px;
                    background-color: #E5E9F5;
                    border-radius: 5px;

                    .award-operate-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 10px;

                        &:last-child {
                            margin-bottom: 0;
                        }

                        label {
                            margin-right: 10px;
                            font-size: 12px;
                        }
                    }
                }
            }

            .footer {
                margin-top: 20px;
                text-align: center;
                width: 100%;
            }
        }
    }
}
</style>

<style lang="scss">
.game-award-action {}
</style>