<template>
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
    <x-card title="数据生成" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }">
        <div class="category">
            <div class="category-item">
                <div class="category-title">人工上传数据</div>
                <x-component label="上传数据" :titleStyle="'#484848'">
                    <xls-uploader @changeFile="handleFileChange" />
                </x-component>
            </div>
        </div>
    </x-card>
    <!-- 悬浮定位 -->
    <FloatingButton :generalRef="generalRef" />
</template>

<script setup>
import XCard from '../../../components/container/XCard.vue';
import XComponent from '../../../components/container/XComponent.vue';
import XlsUploader  from '../../../components/functional/XInputUploadExcel.vue';
import FloatingButton from './Components/FloatingButton.vue';
import { onMounted, ref, reactive, provide } from 'vue';
import openCardService from '../../../services/OpenCardService';
import { general } from './utils/dataGeneration';
import CommonService from '@/services/CommonService';

const openCardServiceClass = new openCardService();
const status = ref('') // 订单状态
const isShow = ref(false) // 是否显示异常信息
const orderId = ref("");   //唯一的orderId，用于后续的提交订单，页面内只有一个orderId，刷新后重新生成
const commonClass = new CommonService(orderId);
//提供统一的commonClass给子组件
provide('commonClass', commonClass);

const xlsDatas = ref('')

const generalRef = ref(null);
// 定义订单详情数据结构
const orderDetails = reactive({
    general: reactive(general.map(item => ({ ...item, datas: null }))),
})

const companyIconList = ref([
    { label: '东莞市大朗聚印贸易行有限公司', value: 'Dongguan Dalang Juyin trading Co., Ltd', url: '/public/image/dalang.png' },
    { label: '东莞汇合数据科技有限公司', value: 'Dongguan Huivo Data Technology Co., Ltd', url: '/public/image/huihe.png' },
    { label: '东莞将为防伪科技有限公司', value: 'Dongguan Jiangwei anti-counterfeiting technology Co., Ltd', url: '/public/image/jiangwei.png' },
    { label: '深圳市将维可变数据赋码技术有限公司', value: 'Shenzhen Jiangwei variable data coding technology Co., Ltd', url: '/public/image/jiangwei.png' },
]);

onMounted(() => {
    let id = JSON.parse(localStorage.getItem('orderDetails'));
    id = id.id
    servicesHandle(id)
})

const handleFileChange = (fileName) => {
  console.log('文件上传成功:', fileName);
  // 在这里处理上传后的逻辑，比如更新状态或发送请求
};

// 获取订单详情数据
const servicesHandle = (id) => {
    openCardServiceClass.getDetails(id).then(res => {
        delete res.data.id;
        dataClear(res.data);
    });
};
// 数据清洗
const dataClear = (res) => {
    // 遍历 orderDetails 对象中的每个键值对
    Object.keys(orderDetails).forEach(key => {
        orderDetails[key].forEach(item => {
            // 如果返回数据中存在对应的字段，则更新 item 的数据
            if (res[key] && res[key][item.name]) {
                if (item.name == 'companyIcon') {
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
        });
    });
}

</script>
<style lang="scss" scoped>
.generalInfo {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    column-gap: 30px;
    row-gap: 16px;

    .value,
    .value-number {
        color: rgba(0, 0, 0, 0.80);
        font-family: "Source Han Sans CN";
        font-size: 12px;
        width: 126px;
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; //溢出不换行
        max-width: 126px;

        /* margin-bottom: 18px; */
        img {
            height: 32px;
        }
    }

    .value-number {
        margin-bottom: 0;
    }
}

// 数据生成样式
.category {
    display: flex;
    flex-direction: column;
    row-gap: 18px;

    .category-item {
        display: flex;
        flex-direction: column;
        row-gap: 18px;

        .category-title {
            width: 100%;
            height: 30px;
            line-height: 30px;
            padding-left: 10px;
            box-sizing: border-box;
            background: rgba(0, 34, 153, 0.04);
            color: #029;
            font-family: "Helvetica Neue";
            font-size: 14px;
            font-weight: 700;
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
        font-family: "Source Han Sans CN";
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