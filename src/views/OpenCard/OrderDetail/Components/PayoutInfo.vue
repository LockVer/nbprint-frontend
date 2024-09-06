<template>
    <x-card title="Payout信息" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }">
        <div class="basicInfo basic-template">
            <div class="title">模板配置</div>
            <div class="generalInfo">
                <x-component label="数量连接符" :titleStyle="'#484848'" :width="'15%'">
                    <div class="value">{{ payoutData.templateConfiguration?.quantitativeConnector }}</div>
                </x-component>
                <x-component label="结果连接符" :titleStyle="'#484848'" :width="'15%'">
                    <div class="value">{{ payoutData.templateConfiguration?.resultConnector }}</div>
                </x-component>
                <x-component label="字体" :titleStyle="'#484848'" :width="'15%'">
                    <div class="value">{{ payoutData.templateConfiguration?.typeface }}</div>
                </x-component>
                <x-component label="边框样式" :titleStyle="'#484848'" :width="'15%'">
                    <div class="value">{{ payoutData.templateConfiguration?.borderStyle }}</div>
                </x-component>
            </div>
        </div>
        <div class="basicInfo">
            <div class="title">基础信息</div>
            <div class="generalInfo noBorder">
                <x-component label="添加标题形式" :titleStyle="'#484848'" :width="'15%'">
                    <div class="value">{{ ['手动输入', '上传图片'][payoutData.basicInfo?.payoutStatus] }}</div>
                </x-component>
                <x-component label="标题" :titleStyle="'#484848'" :width="'15%'">
                    <el-tooltip popper-class="tooltip-width"
                        :content="[payoutData.basicInfo?.payoutTitle, payoutData.basicInfo?.payoutImage][payoutData.basicInfo?.payoutStatus]"
                        placement="bottom" effect="light">
                        <div class="value">{{
                            [payoutData.basicInfo?.payoutTitle,
                            payoutData.basicInfo?.payoutImage][payoutData.basicInfo?.payoutStatus]
                        }}</div>
                    </el-tooltip>
                </x-component>
            </div>
            <div class="generalInfo">
                <x-component label="数量" :titleStyle="'#484848'" :width="'15%'">
                    <div class="value">{{ payoutData.basicInfo?.payoutNumber }}</div>
                </x-component>
                <x-component label="单价" :titleStyle="'#484848'" :width="'15%'">
                    <div class="value">{{ payoutData.basicInfo?.payoutAmount }}</div>
                </x-component>
                <x-component label="总计" :titleStyle="'#484848'" :width="'15%'">
                    <div class="value">{{ payoutData.basicInfo?.payoutTotal }}</div>
                </x-component>
            </div>
        </div>
        <div class="basicInfo" v-if="payoutData.gameInfo?.length > 0">
            <div class="title">玩法信息</div>
            <div class="prize-card" v-for="(items, key) in payoutData.gameInfo" :key="key">
                <div class="prize-title">{{ items.gameType }}</div>
                <div class="generalInfo" v-for="(item, index) in items.games" :key="index">
                    <x-component v-if="items.gameType !== 'Last Sale'" :label="index == 0 ? '序号' : ''"
                        :titleStyle="'#484848'" :width="'3%'">
                        <div class="value">{{ index + 1 }}</div>
                    </x-component>
                    <x-component v-if="items.gameType !== 'Last Sale'" :label="index == 0 ? '数量' : ''"
                        :titleStyle="'#484848'" :width="'15%'">
                        <div class="value">{{ item.gameNumber }}</div>
                    </x-component>
                    <x-component :label="index == 0 ? '金额' : ''" :titleStyle="'#484848'" :width="'15%'">
                        <div class="value">{{ item.gameAmount }}</div>
                    </x-component>
                    <x-component v-if="items.gameType !== 'Last Sale'" :label="index == 0 ? '合计' : ''"
                        :titleStyle="'#484848'" :width="'15%'">
                        <div class="value">{{ item.gameTotal }}</div>
                    </x-component>
                </div>
            </div>
        </div>
    </x-card>
</template>

<script setup>
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
    payoutInfo: Object,
    default: () => []
})

const payoutData = ref([]);
const borderStyles = ref([
    { label: '无', value: '' },
    { label: '实线边框', value: 'solid' },
    { label: '虚线边框', value: 'dashed' },
    { label: '点状边框', value: 'dotted' },
    { label: '双线边框', value: 'double' },
    { label: '凹槽边框', value: 'groove' },
])
watch(() => props.payoutInfo, (newVal) => {
    payoutData.value = newVal
    payoutDataClear(payoutData.value.templateConfiguration);
})

const payoutDataClear = (data) => {
    data.borderStyle = borderStyles.value.filter(item => item.value == data.borderStyle)[0].label
}
</script>

<style lang="scss" scoped>

.basicInfo {
    font-family:"Source Han Sans CN";
    padding-bottom: 18px;
    border-bottom: 1px solid #EEEE;
    margin-bottom: 18px;

    &:last-child {
        margin-bottom: 0;
        border-bottom: 0;
    }

    .title {
        color: #484848;
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 18px;
    }

    .generalInfo {
        display: flex;
        justify-content: flex-start;
        column-gap: 30px;
        margin-bottom: 18px;

        &:last-child {
            margin-bottom: 0;
        }

        .value {
            color: rgba(0, 0, 0, 0.80);
            font-size: 12px;
            width: 126px;
            overflow: hidden; //超出的文本隐藏
            text-overflow: ellipsis; //溢出用省略号显示
            white-space: nowrap; //溢出不换行
        }
    }

    .noBorder {
        border: 0;
    }

    .prize-card {
        margin-bottom: 18px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .prize-title {
        height: 30px;
        line-height: 30px;
        padding-left: 10px;
        box-sizing: border-box;
        background: rgba(0, 34, 153, 0.04);
        color: #029;
        font-family:"Source Han Sans CN";
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 16px;
    }

    .item {
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(0, 34, 153, 0.20);
        margin-bottom: 16px;

        &:last-child {
            padding-bottom: 0;
            border-bottom: 0px solid transparent;
            margin-bottom: 0px;
        }

        .item-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;

            .dot {
                width: 6px;
                height: 6px;
                background: #4D64B8;
            }

            span {
                color: #666;
                font-family:"Source Han Sans CN";
                font-size: 12px;
                font-weight: 700;
            }
        }
    }
}
</style>