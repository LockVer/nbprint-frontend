<template>
    <x-card title="返奖信息">
        <div class="rewardInfo-content">
            <x-component label="客户是否提供返奖信息" padding="0 0 10px 0">
                <x-check-box :DataList="isRewardInfoList" v-model="initData.type" type="radio"></x-check-box>
            </x-component>
            <x-component label="上传图片" v-if="initData.type == 'image'">
                <x-image-upload v-model="initData.image"></x-image-upload>
            </x-component>
            <x-component label="返奖信息编辑" padding="0 0 10px 0"  v-if="initData.type == 'input'">
                <el-button class="xbutton" type="primary" @click="editRewardInfoInfo">
                    返奖信息编辑
                </el-button>
            </x-component>
        </div>
        <el-dialog v-model="rewardInfoDialogVisible" :destroy-on-close="true" title="导入返奖信息" :close-on-click-modal="false"
            :close-on-press-escape="false">
            <div class="line"></div>
            <x-component label="标题类型" padding="0 0 10px 0">
                <x-check-box :DataList="titleTypeList" v-model="initData.titleInfo.type" type="radio"></x-check-box>
            </x-component>
            <x-component label="上传图片" v-if="initData.titleInfo.type == 'image'">
                <x-image-upload v-model="initData.titleInfo.image"></x-image-upload>
            </x-component>
            <x-component label="请输入标题" v-if="initData.titleInfo.type == 'text'">
                <el-input v-model="initData.titleInfo.text" placeholder="请输入标题" />
            </x-component>
            <x-card title="信息" :titleStyle="{ 'font-size': '18px', 'color': 'black' }"
                :cardStyle="{ 'padding': '0', 'margin-top': '18px', 'background': 'none', 'box-shadow': 'none' }">
                <div class="info-box">
                    <x-component label="总数" width="220px" padding="0 0 10px 0" fontWeight="normal">
                        <el-input placeholder="" disabled />
                    </x-component>
                    <x-component label="面值" width="220px" fontWeight="normal">
                        <el-input placeholder="" :value="generalData.currency" disabled />
                    </x-component>
                    <x-component label="总销售额" width="220px" fontWeight="normal">
                        <el-input placeholder="" disabled />
                    </x-component>
                    <x-component label="总返奖额" width="220px" fontWeight="normal">
                        <el-input placeholder="" disabled />
                    </x-component>
                    <x-component label="总返奖率" width="220px" fontWeight="normal">
                        <el-input placeholder="" disabled />
                    </x-component>
                    <x-component label="总利润率" width="220px" fontWeight="normal">
                        <el-input placeholder="" disabled />
                    </x-component>
                </div>
            </x-card>
            <x-card title="玩法" :titleStyle="{ 'font-size': '18px', 'color': 'black' }"
                :cardStyle="{ 'padding': '0', 'margin-top': '18px', 'background': 'none', 'box-shadow': 'none' }">
                <div class="playtype">
                    <el-button color="#4d65b8" :key="item.value" v-for="item in awardTypeList"
                        @click="addGamePlay(item.value)">{{ item.text }}</el-button>
                </div>
            </x-card>

            <x-card :title="'玩法' + item.index + ' - ' + item.awardTypeName + ''" :key="item.index"
                v-for="item in initData.games" :titleStyle="{ 'font-size': '16px', 'color': 'black' }"
                :cardStyle="{ 'padding': '0', 'margin-top': '18px', 'background': 'none', 'box-shadow': 'none' }">
                <div class="x-row">
                    <x-component label="玩法名称" width="220px" padding="0 0 10px 0" fontWeight="normal">
                        <el-input v-model="item.name" placeholder="请输入玩法名称" />
                    </x-component>
                    <x-component label="是否计入返奖额度" :isFullWidth="true">
                        <x-check-box :DataList="isIncludedInRewardQuota" v-model="item.countMethod"
                            type="radio"></x-check-box>
                    </x-component>
                    <x-component width="220px" padding="0 0 10px 0" fontWeight="normal">
                        <el-button color="#4d65b8" @click="addNewPrize(item.index)">添加新行</el-button>
                        <el-button type="danger" @click="removeGamePlay(item.index)">删除玩法</el-button>
                    </x-component>
                </div>
                <div class="x-row" v-for="(pitem, index) in item.prize" :key="index">
                    <x-component label="奖项数量" width="220px" padding="0 0 10px 0" fontWeight="normal">
                        <el-input type="number" placeholder="请输入奖项数量" :min="1" :step="1" v-model="pitem.count" />
                    </x-component>
                    <x-component label="奖项金额" width="220px" padding="0 0 10px 0" fontWeight="normal">
                        <el-input type="number" placeholder="请输入奖项金额" v-model="pitem.amount" />
                    </x-component>
                    <x-component label="奖项总额" width="220px" padding="0 0 10px 0" fontWeight="normal">
                        <el-input placeholder="请输入奖项总额" disabled :value="getTotal(pitem.count, pitem.amount)" />
                    </x-component>
                    <x-component width="220px" padding="0 0 10px 0" fontWeight="normal">
                        <el-button type="danger" @click="removePrize(item, index)">删除奖项</el-button>
                    </x-component>
                </div>
            </x-card>
            <template #footer>
                <el-button @click="closeDialog">取消</el-button>
                <el-button type="primary" @click="confirmRewardInfo">确定</el-button>
            </template>
        </el-dialog>
    </x-card>
</template>
<script setup>
import { ref, watch } from 'vue';
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import XCheckBox from '@/components/functional/XCheckBox.vue';
import XImageUpload from '@/components/functional/XImageUpload.vue';


const initData = defineModel("initData");
const generalData = defineModel("generalData");

const rewardInfoDialogVisible = ref(false)
const isRewardInfo = ref(true)
const titleType = ref("text")
const isRewardInfoList = [
    { text: '是', value: "image" },
    { text: '否', value: "input" }
]
const titleTypeList = [
    { text: '文字', value: "text" },
    { text: '图片', value: "image" },
]
const isIncludedInRewardQuota = [
    { text: '是', value: "yes" },
    { text: '否', value: "no" },
    { text: '只计首项', value: "first" }
]
const awardTypeList = [
    { text: '现金奖', value: 0 },
    { text: '组合奖', value: 1 },
    { text: 'Window奖', value: 2 },
    { text: '自定义玩法', value: 1000 }
]
let rowIndex = 1

watch(initData, (val) => {

}, { deep: true })

const closeDialog = () => {
    rewardInfoDialogVisible.value = false;
    isRewardInfo.value = true
}
const confirmRewardInfo = () => {
    rewardInfoDialogVisible.value = false
}
const editRewardInfoInfo = () => {
    rewardInfoDialogVisible.value = true
}
const addGamePlay = (type) => {
    let game = {
        index: rowIndex++,
        type: type,
        awardTypeName: awardTypeList.find((item) => item.value === type).text,
        name: "",
        countMethod: "yes",
        prize: []
    }
    initData.value.games.push(game)
}
const addNewPrize = (index) => {
    let prize = {
        count: "",
        amount: "",
        total: ""
    }
    initData.value.games[index - 1].prize.push(prize)
}
const removeGamePlay = (index) => {
    initData.value.games = initData.value.games.filter((item) => item.index !== index)
}
const removePrize = (item, index) => {
    item.prize.splice(index, 1)
}
const getTotal = (count, amount) => {
    count = parseFloat(count);
    amount = parseFloat(amount);
    let total = 0;
    if (isNaN(count) || isNaN(amount)) {
        total = 0;
    } else {
        total = count * amount;
    }
    return total
}


</script>
<style lang="scss">
@import '@/styles/variables.scss';


.line {
    width: 100%;
    height: 1px;
    background: #E4E4E4;
    margin: 0 0 18px 0;
}

.rewardInfo-content {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

}

.info-box {

    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 10px;

}

.x-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>