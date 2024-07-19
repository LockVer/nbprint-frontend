<template>
    <div class="title">订单详情</div>
    <x-card :cardStyle="{ 'height': 'auto' }">
        <div class="audit">
            <span class="audit-title">审核详情</span>
            <el-tag v-if="status" :type="['warning', 'warning', 'success', 'danger'][status]">{{ ["待审核", "待审核",
                "已通过", "未通过"
            ][status] }}</el-tag>
        </div>
        <div v-if="isShow" class="exception" v-for="items in orderDetails.checkDetail" :key="items.name">
            <div class="exception-title">{{ items.label }}</div>
            <!-- items.label === '异常项' ||  -->
            <div class="items" v-if="items.label === '异常项'">
                <el-tag color="#0022991A" v-if="Array.isArray(items.datas)" v-for="(tags, index) in items.datas"
                    :key="index">{{ tags }}</el-tag>
                <el-tag v-else color="#0022991A">{{ items.datas }}</el-tag>
            </div>
            <div class="items" v-else>
                <span>{{ items.datas }}</span>
            </div>
        </div>
    </x-card>
    <x-card title="通用信息" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }">
        <div class="generalInfo">
            <x-component v-for="items in orderDetails.general" :key="items.name" :label="items.label" :width="'15%'"
                :titleStyle="'#484848'" :marginBottom="'16px'">
                <div class="value">{{ items.datas }}</div>
            </x-component>
        </div>
    </x-card>
    <x-card title="小卡信息" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }">
        <div class="generalInfo">
            <x-component v-for="items in orderDetails.smallCard" :key="items.name" :label="items.label" :width="'15%'"
                :titleStyle="'#484848'" :marginBottom="'16px'">
                <div class="value">{{ items.datas }}</div>
            </x-component>
        </div>
    </x-card>
    <x-card title="宣传卡信息" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }">
        <div class="generalInfo">
            <x-component label="宣传卡数量" :width="'100%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                <div class="value-number">{{ adCardInfo.adNumber }}</div>
            </x-component>
        </div>
        <div class="generalInfo" v-for="(items, key) in adCardInfo.adCard" :key="key">
            <x-component :label="'宣传卡' + (key + 1) + ' 有无揭开口'" :width="'15%'" :titleStyle="'#484848'"
                :marginBottom="'16px'">
                <div class="value">{{ items.adUncover }}</div>
            </x-component>
            <x-component :label="'宣传卡' + (key + 1) + ' 背景图'" :width="'15%'" :titleStyle="'#484848'"
                :marginBottom="'16px'">
                <el-tooltip popper-class="tooltip-width" :content="items.adImage" placement="bottom" effect="light">
                    <div class="value">{{ items.adImage }}</div>
                </el-tooltip>
            </x-component>
            <x-component :label="'宣传卡' + (key + 1) + ' 是否有揭开区'" :width="'15%'" :titleStyle="'#484848'"
                :marginBottom="'16px'">
                <div class="value">{{ items.adOpenRegion }}</div>
            </x-component>
            <x-component :label="'宣传卡' + (key + 1) + ' 揭开区数量'" :width="'15%'" :titleStyle="'#484848'"
                :marginBottom="'16px'">
                <div class="value">{{ items.adOpenRegionNumber }}</div>
            </x-component>
            <x-component :label="'宣传卡' + (key + 1) + ' 备注'" :width="'15%'" :titleStyle="'#484848'"
                :marginBottom="'16px'">
                <el-tooltip popper-class="tooltip-width" :content="items.adComment" placement="bottom" effect="light">
                    <div class="value">{{ items.adComment }}</div>
                </el-tooltip>
            </x-component>
        </div>
    </x-card>
    <x-card title="奖符" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }"
        v-if="prizeMarkInfo.length > 0">
        <div class="prize-card" v-for="(award, key) in prizeMarkInfo" :key="key">
            <div class="prize-title">{{ ["现金奖", "HOLD卡", "不中奖", "自定义玩法"][award.markType] }}</div>
            <div class="item" v-for="(items, key) in award.prizeMark" :key="key">
                <div class="item-title">
                    <div class="dot"></div>
                    <span>{{ ["现金奖", "HOLD卡", "不中奖", "自定义玩法"][award.markType] }}{{ key + 1 }}</span>
                </div>
                <div class="generalInfo">
                    <x-component label="名称" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                        <div class="value">{{ items.markName }}</div>
                    </x-component>
                    <x-component label="文件" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                        <el-tooltip popper-class="tooltip-width" :content="items.markImage" placement="bottom"
                            effect="light">
                            <div class="value">{{ items.markImage }}</div>
                        </el-tooltip>
                    </x-component>
                    <x-component label="金额" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                        <div class="value">{{ items.markAmount }}</div>
                    </x-component>
                    <x-component label="数量" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                        <div class="value">{{ items.markCount }}</div>
                    </x-component>
                    <x-component label="合计" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                        <div class="value">{{ items.markTotal }}</div>
                    </x-component>
                    <x-component label="备注" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                        <el-tooltip popper-class="tooltip-width" :content="items.markComment" placement="bottom"
                            effect="light">
                            <div class="value">{{ items.markComment }}</div>
                        </el-tooltip>
                    </x-component>
                </div>
            </div>
        </div>
    </x-card>
</template>

<script setup>
import XCard from '../../../components/container/XCard.vue';
import XComponent from '../../../components/container/XComponent.vue';
import { onMounted, ref, reactive } from 'vue';
import OpenCardService from '../../../services/OpenCardService';
import { checkDetail, general, smallCard } from '@/config/orderCordDatas'
const serviceClass = new OpenCardService();
const status = ref('')
const isShow = ref(false)
const orderDetails = reactive({
    checkDetail: reactive(checkDetail.map(item => ({ ...item, datas: null }))),
    general: reactive(general.map(item => ({ ...item, datas: null }))),
    smallCard: reactive(smallCard.map(item => ({ ...item, datas: null }))),
})

const adCardInfo = ref({})
const prizeMarkInfo = ref([])
onMounted(() => {
    let id = JSON.parse(localStorage.getItem('orderDetails'));
    id = id.id
    servicesHandle(id)
})
const servicesHandle = (id) => {
    serviceClass.GetDetails(id).then(res => {
        delete res.data.id
        if (res.data.adCardInfo) {
            adCardInfo.value = res.data.adCardInfo
            adCardInfo.value.adCard.forEach((item) => {
                for (const key in item) {
                    if (item[key] === null) {
                        item[key] = '无'
                    }
                }
            })
        }
        if (res.data.prizeMarkInfo) {
            prizeMarkInfo.value = res.data.prizeMarkInfo
            prizeMarkInfo.value.forEach((item) => {
                if (item.markType === 'cash') {
                    item.markType = 0
                } else if (item.markType === 'holdCard') {
                    item.markType = 1
                } else if (item.markType === 'noPrize') {
                    item.markType = 2
                } else if (item.markType === 'userDefined') {
                    item.markType = 3
                }
                item.prizeMark.forEach((item) => {
                    for (const key in item) {
                        if (item[key] === null || item[key] === '') {
                            item[key] = '无'
                        }
                    }
                })
            })
        }
        dataClear(res.data)
    })
}

const dataClear = (res) => {
    if (res.checkDetail) {
        status.value = res.checkDetail.checkStatus
        if (status.value !== '0') {
            isShow.value = true
        }
    }
    Object.keys(orderDetails).forEach(key => {
        orderDetails[key].forEach(item => {
            if (res[key] && res[key][item.name]) {
                item.datas = res[key][item.name];
            }
            if (item.datas == null || item.datas == '') {
                item.datas = '无'
            } else if (item.datas == 'CNY') {
                item.datas = '¥'
            } else if (item.datas == 'USD') {
                item.datas = '$'
            } else {
                // console.log(String(item.datas).split(','))
                item.datas = String(item.datas).includes(',') ? item.datas.split(',') : item.datas;
            }
            if (item.name == 'direction' || item.name == 'boxCodePosition') {
                directions(item)
            }
        });
    });
}

const directions = (items) => {
    const directList = [
        { text: '上', value: 'T' },
        { text: '下', value: 'B' },
        { text: '左', value: 'L' },
        { text: '右', value: 'R' }
    ]
    const boxCodePositionList = [
        { text: '下左', value: 'bottomleft' },
        { text: '下中', value: 'bottomcenter' },
        { text: '下右', value: 'bottomright' },
    ]
    if (items.name == 'direction') {
        let directs = directList.filter(item => item.value == items.datas)
        if (directs.length > 0) {
            items.datas = directs[0].text
        }
    } else {
        let boxCodePosition = boxCodePositionList.filter(item => item.value == items.datas)
        if (boxCodePosition.length > 0) {
            items.datas = boxCodePosition[0].text
        }
    }
}
</script>

<style lang="scss">
.tooltip-width {
    max-width: 228px;
}
</style>
<style lang="scss" scoped>
.title {
    margin-bottom: 20px;
    color: rgba(0, 0, 0, 0.80);
    font-family: "Helvetica Neue";
    font-size: 24px;
    font-weight: 700;
}

.el-tag {
    padding: 4px 16px;
}

.audit {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 18px;

    .audit-title {
        color: rgba(0, 0, 0, 0.80);
        text-align: center;
        font-family: "Helvetica Neue";
        font-size: 24px;
        font-weight: 700;
    }
}

.exception {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: "Helvetica Neue";
    font-size: 12px;
    font-weight: 700;
    color: var(--Grey-70, #484848);
    margin-bottom: 18px;

    .items {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .el-tag__content {
            font-family: "Helvetica Neue";
            font-size: 12px;
        }

        >span {
            font-weight: 400;
        }
    }



    &:last-child {
        margin-bottom: 0;
    }
}

.generalInfo {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    column-gap: 30px;

    .value,
    .value-number {
        color: rgba(0, 0, 0, 0.80);
        font-family: "Helvetica Neue";
        font-size: 12px;
        width: 126px;
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; //溢出不换行
        /* margin-bottom: 18px; */
    }

    .value-number {
        margin-bottom: 0;
    }
}

.prize-card {
    .prize-title {
        height: 30px;
        line-height: 30px;
        padding-left: 10px;
        box-sizing: border-box;
        background: rgba(0, 34, 153, 0.04);
        color: #029;
        font-family: "Helvetica Neue";
        font-size: 14px;
        font-weight: 700;
        /* margin-bottom: 16px; */
    }

    .item {

        /* background-color: red; */
        &:not(:first-child) {
            padding-top: 16px;
            border-top: 1px solid #f0f0f0;
        }

        &:not(:last-child) {
            /* padding-bottom: 16px; */
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
                font-family: "Helvetica Neue";
                font-size: 12px;
                font-weight: 700;
            }
        }
    }
}
</style>