<template>
    <div class="title">订单详情</div>
    <x-card :cardStyle="{ 'height': 'auto' }" ref="auditRef">
        <div class="audit" :class="{ 'audit-bottom': !isShow }">
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
    <x-card title="通用信息" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }"
        ref="generalRef">
        <div class="generalInfo">
            <x-component v-for="items in orderDetails.general" :key="items.name" :label="items.label" :width="'15%'"
                :titleStyle="'#484848'">
                <div v-if="items.label === '背景颜色'" class="color-picker">
                    <el-color-picker ref="colorPicker" :disabled="true" v-model="items.datas" />
                    <div class="colorText">{{ items.datas }}</div>
                </div>
                <div v-else-if="items.label === '公司图标'" class="value">
                    <img :src="items.datas" alt="">
                </div>
                <div v-else class="value" :title="items.datas">{{ items.datas }}</div>
            </x-component>
        </div>
    </x-card>
    <x-card title="小卡信息" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }"
        ref="smallCardRef">
        <div class="generalInfo">
            <x-component v-for="items in orderDetails.smallCard" :key="items.name" :label="items.label" :width="'15%'"
                :titleStyle="'#484848'">
                <div class="value">{{ items.datas }}</div>
            </x-component>
        </div>
    </x-card>
    <x-card title="宣传卡信息" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }"
        ref="adCardRef">
        <div class="generalInfo">
            <x-component label="宣传卡数量" :width="'100%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                <div class="value-number">{{ adCardInfo.adNumber }}</div>
            </x-component>
        </div>
        <div class="generalInfo" v-for="(items, key) in adCardInfo.adCard" :key="key">
            <x-component :label="'宣传卡' + (key + 1) + ' 有无揭开口'" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">{{ items.adUncover == 1 ? '有' : '无' }}</div>
            </x-component>
            <x-component :label="'宣传卡' + (key + 1) + ' 背景图'" :width="'15%'" :titleStyle="'#484848'">
                <el-tooltip popper-class="tooltip-width" :content="items.adImage" placement="bottom" effect="light">
                    <div class="value">{{ items.adImage }}</div>
                </el-tooltip>
            </x-component>
            <x-component :label="'宣传卡' + (key + 1) + ' 有无揭开区'" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">{{ items.adOpenRegion == 1 ? '有' : '无' }}</div>
            </x-component>
            <x-component :label="'宣传卡' + (key + 1) + ' 揭开区数量'" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">{{ items.adOpenRegionNumber }}</div>
            </x-component>
            <x-component :label="'宣传卡' + (key + 1) + ' 备注'" :width="'15%'" :titleStyle="'#484848'">
                <el-tooltip popper-class="tooltip-width" :content="items.adComment" placement="bottom" effect="light">
                    <div class="value">{{ items.adComment }}</div>
                </el-tooltip>
            </x-component>
        </div>
    </x-card>
    <x-card title="奖符" :cardStyle="{ 'height': 'auto' }" :headerStyle="{ 'marginBottom': '0' }"
        :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }" v-if="prizeMarkInfo.length > 0" ref="prizeMarkRef">
        <div class="prize-card" v-for="(award, key) in prizeMarkInfo" :key="key">
            <div class="prize-title">{{ award.markType }}</div>
            <div class="item" v-for="(items, key) in award.prizeMark" :key="key">
                <div class="item-content">
                    <div class="generalInfo item-index">
                        <x-component :label="key == 0 ? '序号' : ''" :titleStyle="'#484848'">
                            <div class="value">{{ key + 1 }}</div>
                        </x-component>
                    </div>
                    <div class="generalInfo prizemark">
                        <x-component :label="key == 0 ? '名称' : ''" :width="'15%'" :titleStyle="'#484848'">
                            <div class="value">{{ items.markName }}</div>
                        </x-component>
                        <x-component :label="key == 0 ? '文件' : ''" :width="'15%'" :titleStyle="'#484848'">
                            <el-tooltip popper-class="tooltip-width" :content="items.markImage" placement="bottom"
                                effect="light">
                                <div class="value">{{ items.markImage }}</div>
                            </el-tooltip>
                        </x-component>
                        <x-component :label="key == 0 ? '备注' : ''" :width="'15%'" :titleStyle="'#484848'">
                            <el-tooltip popper-class="tooltip-width" :content="items.markComment" placement="bottom"
                                effect="light">
                                <div class="value">{{ items.markComment }}</div>
                            </el-tooltip>
                        </x-component>
                    </div>
                </div>
            </div>
        </div>
    </x-card>
    <payout-info :payoutInfo="payoutInfo" ref="payoutRef" />
    <!-- 悬浮定位 -->
    <FloatingButton :auditRef="auditRef" :generalRef="generalRef" :smallCardRef="smallCardRef" :adCardRef="adCardRef"
        :payoutRef="payoutRef" :prizeMarkRef="prizeMarkRef" />
</template>

<script setup>
import XCard from '../../../components/container/XCard.vue';
import XComponent from '../../../components/container/XComponent.vue';
import PayoutInfo from './Components/PayoutInfo.vue';
import FloatingButton from './Components/FloatingButton.vue';
import { onMounted, ref, reactive, watch } from 'vue';
import openCardService from '../../../services/OpenCardService';
import { checkDetail, general, smallCard } from './OrderDetailUtils/orderCordDatas';

const openCardServiceClass = new openCardService();
const status = ref('') // 订单状态
const isShow = ref(false) // 是否显示异常信息

const auditRef = ref(null);
const generalRef = ref(null);
const smallCardRef = ref(null);
const adCardRef = ref(null);
const payoutRef = ref(null);
const prizeMarkRef = ref(null);
// 定义订单详情数据结构
const orderDetails = reactive({
    checkDetail: reactive(checkDetail.map(item => ({ ...item, datas: null }))),
    general: reactive(general.map(item => ({ ...item, datas: null }))),
    smallCard: reactive(smallCard.map(item => ({ ...item, datas: null }))),
})

const companyIconList = ref([
    { label: '东莞市大朗聚印贸易行有限公司', value: 'Dongguan Dalang Juyin trading Co., Ltd', url: '/public/image/dalang.png' },
    { label: '东莞汇合数据科技有限公司', value: 'Dongguan Huivo Data Technology Co., Ltd', url: '/public/image/huihe.png' },
    { label: '东莞将为防伪科技有限公司', value: 'Dongguan Jiangwei anti-counterfeiting technology Co., Ltd', url: '/public/image/jiangwei.png' },
    { label: '深圳市将维可变数据赋码技术有限公司', value: 'Shenzhen Jiangwei variable data coding technology Co., Ltd', url: '/public/image/jiangwei.png' },
]);

// 定义宣传卡和奖符和payout相关信息
const adCardInfo = ref({})
const prizeMarkInfo = ref([])
const payoutInfo = ref([])


watch(() => payoutInfo.value, (newVal) => {
    payoutInfo.value = newVal
})

onMounted(() => {
    let id = JSON.parse(localStorage.getItem('orderDetails'));
    id = id.id
    servicesHandle(id)
})

// 获取订单详情数据
const servicesHandle = (id) => {
    openCardServiceClass.getDetails(id).then(res => {
        delete res.data.id;
        if (res.data.adCardInfo) {
            adCardInfo.value = res.data.adCardInfo;
            adCardInfo.value.adCard.forEach((item) => {
                for (const key in item) {
                    if (item[key] === null || item[key] === '') {
                        item[key] = '无';
                    }
                }
            });
        }
        if (res.data.prizeMarkInfo) {
            prizeMarkInfo.value = res.data.prizeMarkInfo;
            prizeMarkInfo.value.forEach((item) => {
                // 根据 markType 字段值转换为相应的数字
                if (item.markType === 'cash') {
                    item.markType = 'Instant Winning';
                } else if (item.markType === 'holdCard') {
                    item.markType = 'HOLD';
                } else if (item.markType === 'noPrize') {
                    item.markType = 'Instant No Winning';
                } else if (item.markType === 'window') {
                    item.markType = 'WINDOW';
                }

                item.prizeMark.forEach((item) => {
                    for (const key in item) {
                        if (item[key] === null || item[key] === '') {
                            item[key] = '无';
                        }
                    }
                });
            });
        }
        dataClear(res.data);
        payoutInfo.value = res.data.payout;
        console.log(payoutInfo.value)
    });
};
// 数据清洗
const dataClear = (res) => {
    // 处理审核详情数据
    if (res.checkDetail) {
        console.log(res.checkDetail)
        status.value = res.checkDetail.checkStatus
        // 如果状态不是 '0'，则显示异常详情
        if (status.value !== '0') {
            if(status.value == '1'){
                isShow.value = false
            }
            isShow.value = true
        }
    }
    // 遍历 orderDetails 对象中的每个键值对
    Object.keys(orderDetails).forEach(key => {
        orderDetails[key].forEach(item => {
            // 如果返回数据中存在对应的字段，则更新 item 的数据
            if (res[key] && res[key][item.name]) {
                if(item.name == 'companyIcon'){
                    // console.log(res[key][item.name])
                    item.datas = companyIconList.value.find(items => items.label === res[key][item.name]).url
                } else {
                    item.datas = res[key][item.name];
                }
                 
            }
            // 如果数据为 null 或空字符串，则替换为 '无'
            if (item.datas == null || item.datas == '') {
                item.datas = '无'
            } else if (item.datas == 'CNY') {
                item.datas = '¥'
            } else if (item.datas == 'USD') {
                item.datas = '$'
            } else {
                if (item.name == 'exceptionItem') {
                    // 如果数据包含逗号，则分割为数组
                    item.datas = String(item.datas).includes(',') ? item.datas.split(',') : item.datas;
                } else {
                    item.datas = item.datas
                }
            }
            // 处理方向和盒码位置的显示
            if (item.name == 'direction' || item.name == 'boxCodePosition') {
                directions(item)
            }
        });
    });
}
// 处理方向和盒码位置的显示
const directions = (items) => {
    const directList = [
        { text: '上', value: 'T' },
        { text: '下', value: 'B' },
        { text: '左', value: 'L' },
        { text: '右', value: 'R' }
    ]
    const boxCodePositionList = [
        { text: '下左', value: 'BL' },
        { text: '下中', value: 'BC' },
        { text: '下右', value: 'BR' },
    ]
    if (items.name == 'direction') {
        // 如果字段名称为 'direction'，则转换为对应的文本
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
    font-family:"Source Han Sans CN";
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
        font-family:"Source Han Sans CN";
        font-size: 24px;
        font-weight: 700;
    }
}

.audit-bottom {
    margin-bottom: 0px;
}

.exception {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family:"Source Han Sans CN";
    font-size: 12px;
    font-weight: 700;
    color: var(--Grey-70, #484848);
    margin-bottom: 18px;

    .items {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .el-tag__content {
            font-family:"Source Han Sans CN";
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

.prizemark {
    margin-bottom: 18px;
    width: 100%;
}

.generalInfo {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    column-gap: 30px;
    row-gap: 16px;

    .value,
    .value-number {
        color: rgba(0, 0, 0, 0.80);
        font-family:"Source Han Sans CN";
        font-size: 12px;
        width: 126px;
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; //溢出不换行
        max-width: 126px;
        /* margin-bottom: 18px; */
        img{
            height: 32px;
        }
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
        font-family:"Source Han Sans CN";
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 18px;
        margin-top: 18px;
    }

    .item {
        .item-content {
            display: flex;

            .item-index {
                width: 50px;
                margin-right: 20px;
            }
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

/* 背景颜色样式 */
.color-picker {
    height: 32px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 12px;

    .colorText {
        color: rgba(0, 0, 0, 0.80);
        margin-left: 10px;
    }

    .btn {
        font-family:"Source Han Sans CN";
        margin-left: 90px;
        color: #029;
    }
}

::v-deep(.el-color-picker__trigger) {
    border: 1px solid transparent;
}

::v-deep(.el-color-picker__icon) {
    display: none;
}
</style>