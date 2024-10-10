<template>
    <x-card title="Payout信息">
        <x-component label="填写Payout方式">
            <x-check-box v-model="initData.payoutType" :DataList="payoutTypeList" type="radio"></x-check-box>
        </x-component>
        <x-component label="Payout图片" width="220px" v-if="initData.payoutType == 'upload'"
            :showErrorMsg="!(initData.payoutImage)">
            <x-input-upload v-model:image="initData.payoutImage"></x-input-upload>
        </x-component>
        <div class="basicInfo" v-if="initData.payoutType == 'manual'">
            <div class="title">模板配置</div>
            <div class="generalInfo">
                <x-component label="数量连接符" :titleStyle="'#484848'" :width="'220px'" :showErrorMsg="!(initData.templateConfiguration.quantitativeConnector)">
                    <el-select v-model="initData.templateConfiguration.quantitativeConnector" placeholder="请选择数量连接符"
                        clearable>
                        <el-option v-for="item in quantitativeConnectorList" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </x-component>
                <x-component label="结果连接符" :titleStyle="'#484848'" :width="'220px'" :showErrorMsg="!(initData.templateConfiguration.resultConnector)">
                    <el-select v-model="initData.templateConfiguration.resultConnector" placeholder="请选择结果连接符"
                        clearable>
                        <el-option v-for="item in resultConnectorList" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </x-component>
                <x-component label="字体" :titleStyle="'#484848'" :width="'220px'" :showErrorMsg="!(initData.templateConfiguration.typeface)">
                    <el-select v-model="initData.templateConfiguration.typeface" placeholder="请选择字体" clearable>
                        <el-option v-for="item in typefaceList" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </x-component>
                <x-component label="边框样式" :titleStyle="'#484848'" :width="'220px'" :showErrorMsg="!(initData.templateConfiguration.borderStyle)">
                    <el-select v-model="initData.templateConfiguration.borderStyle" placeholder="请选择边框样式" clearable>
                        <el-option v-for="item in borderStyleList" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </x-component>
            </div>
        </div>
        <div class="basicInfo" v-if="initData.payoutType == 'manual'">
            <div class="title">基础信息</div>
            <div class="generalInfo">
                <x-component label="添加标题形式" :titleStyle="'#484848'" :width="'200px'" :titleBottom="'12px'">
                    <div class="title-modality">
                        <div @click="selectTitleModality(0)"
                            :class="{ 'title-active': initData.basicInfo?.payoutStatus === 0 }">手动输入</div>
                        <div @click="selectTitleModality(1)"
                            :class="{ 'title-active': initData.basicInfo.payoutStatus === 1 }">上传图片</div>
                    </div>
                </x-component>
                <x-component v-if="initData.basicInfo.payoutStatus == 0" label="手动输入标题" :titleStyle="'#484848'"
                    :width="'200px'" :titleBottom="'12px'" :showErrorMsg="!(initData.basicInfo.payoutTitle)">
                    <el-input v-model="initData.basicInfo.payoutTitle" placeholder="请输入标题" />
                </x-component>
                <x-component v-if="initData.basicInfo.payoutStatus == 1"  :showErrorMsg="!(initData.basicInfo.payoutImage)" label="上传标题图片（上传png格式）" :titleStyle="'#484848'"
                    :width="'200px'" :titleBottom="'12px'">
                    <x-input-upload v-model:image="initData.basicInfo.payoutImage"
                        @changeImage="handleImageChange"></x-input-upload>
                </x-component>
            </div>
            <div class="generalInfo">
                <x-component label="数量" :titleStyle="'#484848'" :width="'200px'">
                    <el-input disabled v-model="initData.basicInfo.payoutNumber"
                        @input="onNumberInput(initData.basicInfo, 'payoutNumber')" placeholder="小卡数量" />
                </x-component>
                <x-component label="单价" :titleStyle="'#484848'" :width="'200px'">
                    <el-input disabled v-model="initData.basicInfo.payoutAmount"
                        @input="onAmountInput(initData.basicInfo, 'payoutAmount')" placeholder="小卡单价" />
                </x-component>
                <x-component label="合计" :titleStyle="'#484848'" :width="'200px'">
                    <el-input disabled v-model="initData.basicInfo.payoutTotal" />
                </x-component>
            </div>
        </div>
        <div class="basicInfo playingMethod" v-if="initData.payoutType == 'manual'">
            <div class="title">玩法信息</div>
            <div class="award-id">
                <div class="addtype">
                    <el-button id="Btn" color="#4d65b8" :key="item.value" v-for="item in payoutIDList"
                        @click="showAddBatchDialog(item)">+{{ item.text
                        }}</el-button>
                </div>
                <div class="actions">
                    <el-button id="Btn" color="#4d65b8" @click="onCustomName">添加自定义玩法</el-button>
                    <el-button id="Btn" type="danger" @click="clearData">清空</el-button>
                </div>
            </div>
            <div class="award-list">
                <div class="award-item" v-for="(awardItem, index) in payoutIDList" :key="index">
                    <div class="item-type" v-if="filterPrizeMark(awardItem.value).length > 0">
                        <span>{{ awardItem.text }}</span>
                        <span class="delBtn" @click="onTypeClick(awardItem)">删除</span>
                    </div>

                    <div class="item-content" v-for="(item, eindex) in filterPrizeMark(awardItem.value)" :key="item.id">
                        <div class="item-input">
                            <x-component v-if="awardItem.text != 'Last Sale'" :label="eindex === 0 ? '序号' : ''"
                                width="5%">
                                <div style="height: 32px; line-height: 32px; font-size: 12px;">{{ eindex + 1 }}</div>
                            </x-component>
                            <div class="items-content">
                                <x-component v-if="awardItem.text != 'Last Sale'" :label="eindex === 0 ? '数量' : ''"
                                    width="15%">
                                    <el-input placeholder="请输入数量" v-model="item.gameNumber"
                                        @input="onNumberInput(item, 'gameNumber')" />
                                </x-component>
                                <x-component :label="eindex === 0 ? '金额' : ''" width="15%">
                                    <el-input placeholder="请输入金额" v-model="item.gameAmount"
                                        @input="onAmountInput(item, 'gameAmount')" />
                                </x-component>
                                <x-component v-if="awardItem.text != 'Last Sale'" :label="eindex === 0 ? '合计' : ''"
                                    width="15%">
                                    <el-input placeholder="" v-model="item.gameTotal" :disabled="true" />
                                </x-component>
                                <x-component v-if="awardItem.text != 'Last Sale'" width="100px">
                                    <el-button class="removePrizes" @click="removePrize(item)">-</el-button>
                                    <el-button type="primary"
                                        v-if="eindex + 1 == filterPrizeMark(awardItem.value).length" class="addPrize"
                                        @click="addPayoutMark(item)">+</el-button>
                                </x-component>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="custom-dialog">
            <el-dialog v-model="customDialogVisible" width="400px" :destroy-on-close="true"
                :close-on-click-modal="false" :close-on-press-escape="false">
                <template #header>
                    <div class="dialog-header">Payout信息-添加自定义玩法</div>
                </template>
                <div class="custom-content" style="margin-bottom: 18px;">
                    <label class="common-label">输入自定义玩法名称</label>
                    <el-input style="width: 200px;" v-model="customName" placeholder="请输入自定义玩法名称" />
                </div>
                <template #footer>
                    <el-button style="width: 100px;" @click="closePrizeDialog">取消</el-button>
                    <el-button type="primary" style="width: 100px;" @click="batchAdd('addCustomPrize')">确定</el-button>
                </template>
            </el-dialog>
            <el-dialog v-model="payoutDialogVisible" width="400px" :destroy-on-close="true"
                :close-on-click-modal="false" :close-on-press-escape="false">
                <template #header>
                    <div class="dialog-header">批量添加-{{ batchAddInfo.text }}</div>
                </template>
                <div class="dialog-content">
                    <x-component label="玩法名称" width="45%">
                        <span class="payout-name">{{ batchAddInfo.text }}</span>
                    </x-component>
                    <x-component label="数量" width="45%">
                        <el-input-number v-model="batchAddInfo.qty" :min="0"
                            :max="batchAddInfo.text == 'Last Sale' ? 1 : 200" width="100%" />
                    </x-component>
                </div>
                <template #footer>
                    <el-button @click="closePrizeDialog">取消</el-button>
                    <el-button type="primary" @click="batchAdd">确定</el-button>
                </template>
            </el-dialog>
        </div>
    </x-card>


</template>

<script setup>
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import XInputUpload from '@/components/functional/XInputUpload.vue';
import XCheckBox from '@/components/functional/XCheckBox.vue';

import { ref, watch, reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { ElMessageBox } from 'element-plus';



const initData = defineModel("initData");
const gameData = defineModel("gameData");
const smallCardData = defineModel("smallCard");
const payoutDialogVisible = ref(false);
const fileInputRefs = ref({});

const payoutTypeList = [
    {
        text: '手动填写',
        value: 'manual'
    },
    {
        text: '上传文件',
        value: 'upload'
    }
]

const quantitativeConnectorList = [
    { label: '不选', value: '' },
    { label: '@', value: '@' },
    { label: '#', value: '#' },
    { label: '%', value: '%' },
    { label: '^', value: '^' },
    { label: '&', value: '&' },
];
const resultConnectorList = [
    { label: '不选', value: '' },
    { label: '=', value: '=' },
    { label: '……', value: '……' },
    { label: '----', value: '----' },
    { label: '— —', value: '— —' },
    { label: '~~~~', value: '~~~~' },
];
const typefaceList = [
    { label: '不选', value: '' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Itcalkad', value: 'Itcalkad' },
    { label: 'Italic-VariableFont', value: 'Italic-VariableFont' },
];
const borderStyleList = [
    { label: '不选', value: '' },
    { label: '实线边框', value: 'solid' },
    { label: '虚线边框', value: 'dashed' },
    { label: '点状边框', value: 'dotted' },
    { label: '双线边框', value: 'double' },
    { label: '凹槽边框', value: 'groove' },
];
const payoutIDList = reactive([
    { text: 'Instant Prize', value: 'Instant Prize', qty: 0 },
    { text: 'Seal Prize', value: 'Seal Prize', qty: 0 },
    { text: 'Window Prize', value: 'Window Prize', qty: 0 },
    { text: 'Last Sale', value: 'Last Sale', qty: 0 },
]);



const customDialogVisible = ref(false);
const customName = ref('');
const batchAddInfo = ref('');

watch(() => gameData.value, (newData) => {
    newData.forEach(item => {
        let prize = payoutIDList.find(award => award.value === item.gameType);
        if (!prize) {
            payoutIDList.push({ text: item.gameType, value: item.gameType, qty: 0 })
        }
    })
}, { deep: true });

watch(smallCardData, (newVal, oldVal) => {
    console.log(newVal)
    initData.value.basicInfo.payoutAmount = smallCardData.value.price
    initData.value.basicInfo.payoutNumber = smallCardData.value.quantityPerBox
    initData.value.basicInfo.payoutTotal = smallCardData.value.price * smallCardData.value.quantityPerBox
}, { deep: true });

const selectTitleModality = (value) => {
    initData.value.basicInfo.payoutStatus = value;
    if (value === 0) {
        initData.value.basicInfo.payoutImage = '';
        initData.value.basicInfo.payoutTitle = initData.value.basicInfo.payoutTitle;
    } else {
        initData.value.basicInfo.payoutImage = initData.value.basicInfo.payoutImage;
        initData.value.basicInfo.payoutTitle = '';
    }
}
const handleImageChange = (value) => {
    if (initData.value.basicInfo.payoutStatus === 0) {
        initData.value.basicInfo.payoutImage = '';
    } else {
        initData.value.basicInfo.payoutImage = value;
    }
}

// 单个添加
const addPayoutMark = (item) => {
    addCustomPrize(item)
}
// 添加自定义玩法
const onCustomName = () => {
    customDialogVisible.value = true;
}

// 删除游戏分类
const onTypeClick = (item) => {
    ElMessageBox.confirm('确定删除该奖符的全部信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        console.log('删除成功');
        initData.value.game = initData.value.game.filter(items => items.gameType !== item.value);
        let list = payoutIDList.slice(4);
        list.forEach(type => {
            if (type.value === item.value) {
                payoutIDList.splice(payoutIDList.indexOf(type), 1);
            }
        })
    }).catch(() => {
        console.log('取消删除');
    });;
}

// 批量添加
const showAddBatchDialog = (item) => {
    batchAddInfo.value = item;
    payoutDialogVisible.value = true;
    // 重置每个玩法的数量为0
    payoutIDList.forEach(item => {
        item.qty = 0;
    });
};
// 清空数据
const clearData = () => {
    gameData.value = [];
    fileInputRefs.value = {};
    if (payoutIDList.length > 4) {
        payoutIDList.splice(4);  // 保留前四个元素，删除其余元素
    }
};

const closePrizeDialog = () => {
    payoutDialogVisible.value = false;
    customDialogVisible.value = false;
};

// 批量添加确认
const batchAdd = (type) => {
    if (type == 'addCustomPrize') {
        customDialogVisible.value = false;
        if (customName.value !== '') {
            payoutIDList.push({ text: customName.value, value: customName.value, qty: 0 });
        }
        customName.value = '';
    } else {
        payoutDialogVisible.value = false;
        payoutIDList.forEach(item => {
            if (item.qty > 0) {
                for (let i = 0; i < item.qty; i++) {
                    // 添加玩法
                    addPrizeMark(item);
                }
            }
        });
    }
};
// 删除单个玩法的函数
const removePrize = (item) => {
    ElMessageBox.confirm('确定删除该玩法信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        gameData.value = gameData.value.filter(i => i.id !== item.id);
    }).catch(() => {
        console.log('取消删除');
    });
};

// 添加玩法的函数
const addPrizeMark = (item) => {
    const prizeMarkItem = {
        id: uuidv4(), // 生成唯一ID
        gameType: item.value,
        gameName: "", // 设置初始名称
        gameNumber: item.text === 'Last Sale' ? '1' : '',
        gameAmount: '',
        gameTotal: '',
    };

    if (!gameData.value) {
        gameData.value = [];
    }
    gameData.value.push(prizeMarkItem);
};

// 添加自定义玩法
const addCustomPrize = (item) => {
    console.log(item)
    const prizeMarkItem = {
        id: uuidv4(), // 生成唯一ID
        gameType: item.gameType,
        gameName: "", // 设置初始名称
        gameNumber: '',
        gameAmount: '',
        gameTotal: '',
    };

    if (!gameData.value) {
        gameData.value = [];
    }
    gameData.value.push(prizeMarkItem);
}

// 过滤玩法的函数
const filterPrizeMark = (type) => {
    let index = 1; // 初始化索引为1
    const filteredData = gameData.value.filter((item) => {
        if (item.gameType === type) {
            if (!item.gameName) {
                const awardItem = payoutIDList.find(award => award.value === type);
                if (awardItem) {
                    item.gameName = `${awardItem.text}${index}`;
                }
            }
            index++; // 每找到一个匹配项，索引加1
            return true;
        }
        return false;
    });
    return filteredData;
};

const onAmountInput = (item, field) => {
    item[field] = item[field].replace(/[^\d.]/g, ''); // 只允许输入数字和小数点
    calculateTotal(item);
};

const onNumberInput = (item, field) => {
    item[field] = item[field].replace(/[^\d]/g, ''); // 只允许输入整数
    calculateTotal(item);
};

const calculateTotal = (item) => {
    const amount = parseFloat(item.payoutAmount || item.gameAmount) || 0;
    const number = parseInt(item.payoutNumber || item.gameNumber) || 0;
    item.payoutTotal = (amount * number).toString();
    item.gameTotal = (amount * number).toString();
};
</script>

<style lang="scss" scoped>
.basicInfo {
    font-family: "Source Han Sans CN";
    padding-bottom: 18px;
    border-bottom: 1px solid #EEEE;
    margin-bottom: 18px;


    .title {
        color: #484848;
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 18px;
    }

    &:last-child {
        padding-bottom: 0;
        margin-bottom: 0;
        border-bottom: 1px solid transparent;
    }

}

.playingMethod {
    align-items: flex-start;
    padding-bottom: 0;
    border-bottom: 0px;
    margin-bottom: 0px;
}

.generalInfo {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    column-gap: 37px;
    row-gap: 12px;
    margin-bottom: 18px;

    &:last-child {
        margin-bottom: 0;
    }

    .title-modality {
        display: flex;
        column-gap: 8px;
        color: #181818;
        font-family: "Source Han Sans CN";
        font-size: 12px;
        cursor: pointer;

        >div {
            min-width: 100px;
            min-height: 24px;
            padding: 8px 20px;
            border-radius: 4px;
            text-align: center;
            border: 1px solid #E4E4E4;
        }

        .title-active {
            color: rgba(0, 34, 153, 0.70);
            border: 1px solid rgba(0, 34, 153, 0.70);
        }
    }


    /* 多选框的箭头 */
    ::v-deep(.el-select__suffix) {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        background: #F1F1F1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    ::v-deep(.el-select__wrapper) {
        padding: 4px 8px;
    }
}

.award-id {
    align-items: flex-start;
    flex-wrap: wrap;
    row-gap: 12px;

    .addtype,
    .actions {
        display: flex;
        flex-wrap: wrap;
        row-gap: 12px;
    }
}

.payout-name {
    display: inline-block;
    line-height: 32px;
    height: 32px
}

.dialog-content {
    display: flex;
    justify-content: space-between;
}
</style>