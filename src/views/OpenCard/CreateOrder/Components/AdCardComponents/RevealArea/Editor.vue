<template>
    <div class="panel">
        <div class="left-panel">
            <OperationArea @addDone="addDone" @closePanel="closePanel" />
        </div>
        <div class="right-panel">
            <XCanvas :communicatorName="communicatorName">
                <div class="operatePanel" v-if="communicator.data.showOperatePanel && communicator.data.step == 2">
                    <div class="game-award">
                        <div class="award-title">设置游戏区奖符</div>
                        <div class="game-award-action">
                            <x-component label="游戏区名称" padding="0 0 18px 0">
                                <el-input placeholder="游戏区名称" v-model="communicator.data.currentGameArea.text" />
                            </x-component>
                            <x-component label="添加奖符数据" padding="0 0 18px 0">
                                <el-input type="textarea" placeholder="请输入奖符数据" :rows="2" v-model="awardInput" />
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
                                    v-for="(item, index) in communicator.data.currentGameArea.awardList" :key="index"
                                    @close="removeAward(index)">
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
                                        <div class="award-operate-item" v-for="(item, index) in currentGameShapeList"
                                            :key="index">
                                            <label>{{ item.text }}</label>
                                            <el-input-number :min="0" :max="10" :step="1" style="width: 90px;"
                                                size="small" v-model="item.awardCount" />
                                        </div>
                                    </div>
                                </template>
                            </x-component>
                            <x-component label="已使用奖符数据" padding="0 0 18px 0">
                                <el-tag class="tag" type="info"
                                    v-for="(item, index) in communicator.data.currentGameArea.awardUsedList"
                                    :key="index">
                                    {{ item }}
                                </el-tag>
                            </x-component>
                        </div>
                        <div class="footer">
                            <el-button type="primary" plain @click="resetAll">重置</el-button>
                            <el-button type="primary" @click="allocationAward">确定分配</el-button>
                        </div>
                    </div>
                </div>
                <div class="font-settings" v-if="communicator.data.showFontPanel">
                    <div class="game-award">
                        <div class="award-title">
                            <span>揭开区字体格式</span>
                            <el-button type="primary" link @click="openAddFont">
                                配置字体
                            </el-button>
                        </div>
                        <div class="game-award-action">
                            <x-component label="字体" padding="0 0 18px 0">
                                <el-select v-model="selectFontFamily" placeholder="Select" @change="changeFontFamily">
                                    <el-option v-for="item in fontFamilyList" :key="item.value" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                            </x-component>
                            <x-component label="字号" padding="0 0 18px 0">
                                <el-input-number v-model="selectFontSize" :min="12" :max="100"
                                    @change="changeFontSize" />
                            </x-component>
                            <x-component label="自动计算" padding="0 0 18px 0">
                                <el-button type="primary" plain @click="reCalcFontSize">重置字号，并自动计算</el-button>
                            </x-component>
                        </div>
                    </div>
                </div>
            </XCanvas>
        </div>
        <div class="addfont-dialog">
            <el-dialog v-model="addFontDialogVisible" width="750px">
                <div class="dialog-header">
                    <span>配置字体</span>
                    <span class="iconfont icon-close" @click="addFontDialogVisible = false"></span>
                </div>
                <div class="line"></div>
                <el-table :data="allFontList" style="width: 100%" max-height="300">
                    <el-table-column prop="fontName" label="字体名称" />
                    <el-table-column prop="fileName" label="文件名称" />
                    <el-table-column fixed="right" label="操作" width="100">
                        <template #default="scope">
                            <el-button link type="danger" v-if="!scope.row.isDefault" size="small" @click.stop="deleteFont(scope.row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="add-font-box">
                    <div class="tip">添加字体</div>
                    <div class="add-font-upload">
                        <el-input placeholder="请输入字体名称" v-model="addFontName" width="200px" />
                        <x-input-upload v-model:file="addFontFile" :autoUpload="false" link uploadType="file" />
                        <el-button type="primary" @click="uploadFont">添加</el-button>
                    </div>
                </div>
            </el-dialog>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, provide, inject, defineProps, defineEmits, toRaw, onMounted, computed, watch } from 'vue';
import OperationArea from './Components/OperationArea.vue';
import XCanvas from '@/components/functional/xcanvas/XCanvas.vue';
import XComponent from '@/components/container/XComponent.vue';
import Communicator from '@/utils/Communicator';
import XInputUpload from '@/components/functional/XInputUpload.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { all } from 'axios';
const commonClass = inject('commonClass');
const emits = defineEmits(['addDone', 'closePanel']);

const props = defineProps({
    currentAdCard: {
        type: Object,
        default: null
    }
});

const selectFontFamily = ref('Arial');
const fontFamilyList = computed(() => {
    return allFontList.value.map(font => ({
        label: font.fontName,
        value: font.ossPath
    }));
});
const selectFontUrl = ref('');
const selectFontSize = ref(12);
const addFontDialogVisible = ref(false);
const addFontName = ref('');
const addFontFile = ref(null);
const allFontList = ref([]);
const getFontList = () => {
    allFontList.value = [];
    allFontList.value.push({
        fontName: 'Arial',
        fileName: '',
        ossPath: '0',
        isDefault: true
    });
    commonClass.getFontList().then((res) => {
        console.log('getFontList:', res);
        allFontList.value.push(...res.data);
    }).catch((err) => {
        ElMessage.error(err);
        console.log(err);
    });
}
const openAddFont = () => {
    getFontList();
    addFontDialogVisible.value = true;
    addFontName.value = '';
    addFontFile.value = null;
}
const uploadFont = () => {
    console.log('uploadFont');
    console.log('addFontName:', addFontName.value);
    console.log('addFontFile:', addFontFile.value);
    if (!addFontName.value) {
        ElMessage.error('请输入字体名称');
        return;
    }
    if (!addFontFile.value) {
        ElMessage.error('请上传字体文件');
        return;
    }

    commonClass.uploadFont(addFontFile.value, addFontName.value).then((res) => {
        addFontName.value = '';
        addFontFile.value = null;
        getFontList();
    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
    });
}
const deleteFont = (row) => {
    console.log('deleteFont:', row);
    ElMessageBox.confirm('确定删除该字体？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        commonClass.deleteFont(row.id).then((res) => {
            getFontList();
        }).catch((err) => {
            console.log(err);
            ElMessage.error(err);
        });
    }).catch(() => {
        ElMessage.info('已取消删除');
    });
}

const communicatorName = 'revealAreaCommunicator';  // 通信器名称
// 实例化 Communicator 并创建响应式对象
const communicator = reactive(new Communicator());
const adCommunicator = inject('adCardCommunicator');
communicator.data.adCardSize = props.currentAdCard.adCardSize;
communicator.data.backgroundImage = props.currentAdCard.image;
communicator.data.showShapeDistance = true;
const currentGameShapeList = computed(() => {
    //过滤出当前游戏区的shapeList，不修改原始数据
    return communicator.data.shapeList.filter(item => item.id === communicator.data.currentGameArea.id);
});
const initData = () => {
    getFontList();
    if (!props.currentAdCard.adCardStatus) {
        return;
    }
    communicator.data.allowSaveStateItem = props.currentAdCard.adCardStatus.allowSaveStateItem;
    communicator.data.gameList = props.currentAdCard.adCardStatus.gameList;
    communicator.data.gameList.forEach((game) => {
        game.active = false;
    });
    communicator.data.regions = props.currentAdCard.openRegions;
    console.log('communicator.data:', communicator.data);
}

onMounted(() => {
    initData();
});
// console.log('props.currentAdCard.adCardStatus:', toRaw(props.currentAdCard.adCardStatus));

// communicator.data = Object.assign(communicator.data, toRaw(props.currentAdCard.adCardStatus));

// console.log('communicator.data1:', communicator.data);
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
    awardInput.value = "";
}

const resetAward = () => {
    const shapeList = communicator.data.shapeList.filter(item => item.id === communicator.data.currentGameArea.id);
    shapeList.forEach(item => {
        item.awardCount = 0;
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
    console.log('allocationAward');
    let awardList = communicator.data.currentGameArea.awardList;
    //将奖符数据随机打乱
    awardList = awardList.sort(() => Math.random() - 0.5);
    const shapeList = communicator.data.shapeList.filter(item => item.id === communicator.data.currentGameArea.id);
    //将奖符数据根据shape.awardCount分配到shape.awardList中，并将已分配的奖符数据放入shape.awardUsedList中
    shapeList.forEach(item => {
        for (let i = 0; i < item.awardCount; i++) {
            if (awardList.length > 0) {
                let award = awardList.shift();
                item.awardList.push(award);
                communicator.data.currentGameArea.awardUsedList.push(award);
            }
        }
    });
    communicator.data.rendererUtil.render();
}

const resetAll = () => {
    communicator.data.shapeList.forEach(item => {
        if (item.id === communicator.data.currentGameArea.id) {
            item.awardList = [];
            item.awardCount = 1;
        }
    });
    communicator.data.currentGameArea.awardList.push(...communicator.data.currentGameArea.awardUsedList);
    communicator.data.currentGameArea.awardUsedList = [];
    communicator.data.rendererUtil.render();
}

const removeAward = (index) => {
    communicator.data.currentGameArea.awardList.splice(index, 1);
}

const addDone = () => {
    const { shapeList, pxToMm } = communicator.data;
    let isPass = true;
    shapeList.forEach((shape) => {
        shape.checkProximity();
        if (shape.proximityWarning) {
            isPass = false;
            return;
        }
    });
    console.log('isPass:', isPass);
    if (!isPass) {
        communicator.data.errorHandlerUtil.showConfirm('揭开区之间距离过近，请调整后再进行尝试.按住【Alt】可显示区域距离是否合适。');
        return;
    }
    props.currentAdCard.openRegions = shapeList.map((shape) => {
        console.log('shape:', shape);
        return {
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            awardList: shape.awardList,
            mark: shape.mark.map((item) => {
                return {
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                    fontSize: pxToMm(item.fontSize),
                    text: item.text,
                    fontFamily: item.fontFamily,
                    fontName: item.fontName
                }
            }),
            id: shape.id,
            borderColor: shape.borderColor,
            text: shape.text,
            fontSize: shape.fontSize,
            fontFamily: shape.fontFamily,
            fontName: shape.fontName    
        }
    });
    props.currentAdCard.adCardStatus = toRaw({
        adCardSize: communicator.data.adCardSize,
        adCardQty: communicator.data.adCardQty,
        adCardList: communicator.data.adCardList,
        allowSaveStateItem: communicator.data.allowSaveStateItem,
        backgroundImage: communicator.data.backgroundImage,
        gameList: communicator.data.gameList
    });
    console.log('props.currentAdCard:', props.currentAdCard);
    emits('addDone');
}
const closePanel = () => {
    emits('closePanel');
}

const changeFontFamily = (value) => {
    console.log('changeFontFamily:', value);
    const { shapeList } = communicator.data;
    shapeList.forEach((shape) => {
        if (shape.active || shape.selected) {
            shape.fontFamily = value;
            shape.fontName = fontFamilyList.value.find(item => item.value === value).label;
        }
    });
    console.log(shapeList)
}

const changeFontSize = (value) => {
    const { shapeList } = communicator.data;
    shapeList.forEach((shape) => {
        if (shape.active || shape.selected) {
            shape.fontSize = value;
        }
    });
}

const reCalcFontSize = () => {
    const { shapeList } = communicator.data;
    shapeList.forEach((shape) => {
        if (shape.active || shape.selected) {
            shape.fontSize = null;
        }
    });
    communicator.data.rendererUtil.render();
}

watch(communicator.data, (val) => {
    if (!val.shapeList) return;
    const selectedList = val.shapeList.filter(item => {
        return item.active || item.selected;
    })
    if (selectedList.length > 0) {
        communicator.data.showFontPanel = true;
        communicator.data.currentFontFamily = selectedList[0].fontFamily;
        communicator.data.currentFontSize = selectedList[0].fontSize;
        selectFontFamily.value = selectedList[0].fontFamily;
        selectFontSize.value = selectedList[0].fontSize;
        selectFontUrl.value = selectedList[0].fontUrl;
    } else {
        communicator.data.showFontPanel = false;
    }
}, {
    deep: true,
    immediate: true
});

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

        .operatePanel {
            width: 270px;
            min-height: 200px;
            max-height: calc(100% - 20px);
            overflow-y: auto;
            align-self: flex-start;
            background-color: white;
            box-shadow: 4px 0px 10px 0px #00000014;
            z-index: 1;
            margin: 10px;
            border-radius: 5px;
        }

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
                display: flex;
                align-items: center;
                justify-content: space-between;
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

.font-settings {
    width: 270px;
    overflow-y: auto;
    background-color: white;
    box-shadow: 0px 0px 10px 0px #00000014;
    z-index: 1;
    right: 10px;
    top: 10px;
    position: absolute;
    border-radius: 5px;
}

.addfont-dialog {
    .dialog-header {
        font-size: 24px;
        font-weight: 700;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .iconfont {
            font-size: 24px;
            cursor: pointer;

            &:hover {
                color: #FF3130;
            }
        }
    }

    .line {
        margin: 10px 0;
    }

    .tip {
        font-size: 16px;
        margin-bottom: 10px;
    }

    .process-tip {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }

    .footer {
        margin-top: 20px;
        text-align: center;
        width: 100%;
    }

    .add-font-box {
        padding: 10px;
        background-color: #FAFBFD;
        margin-top: 10px;

        .add-font-upload {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            align-items: center;

            .el-button {
                width: 100px;
                margin-left: auto;
            }
        }
    }
}
</style>

<style lang="scss">
.game-award-action {}
</style>