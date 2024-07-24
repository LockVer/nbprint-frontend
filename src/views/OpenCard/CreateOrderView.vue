<template>
    <div class="create-order">

        <general v-model:initData="general"></general>
        <small-card v-model:initData="smallCard"></small-card>
        <ad-card v-model:initData="adCard" v-model:smallCard="smallCard"></ad-card>
        <payout v-model:initData="payout" v-model:generalData="general"></payout>
        <prize-mark v-model:initData="prizeMark"></prize-mark>
        <layout-footer @submit="handleSubmit"></layout-footer>
    </div>
</template>

<script setup>
import { defineComponent, ref, reactive, onMounted, provide } from 'vue';
import General from './CreateOrderComponents/General.vue';
import SmallCard from './CreateOrderComponents/SmallCard.vue';
import AdCard from './CreateOrderComponents/AdCard.vue';
import XCard from '../../components/container/XCard.vue';
import Payout from './CreateOrderComponents/Payout.vue';
import PrizeMark from './CreateOrderComponents/PrizeMark.vue';
import LayoutFooter from '../../components/common/LayoutFooter.vue';
import OpenCardService from '../../services/OpenCardService';
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import CommonService from '../../services/CommonService';
import { useRoute } from 'vue-router';

const orderId = uuidv4();   //生成唯一的orderId，用于后续的提交订单，页面内只有一个orderId，刷新后重新生成

const serviceClass = new OpenCardService();
const commonClass = new CommonService(orderId);
//提供统一的commonClass给子组件
provide('commonClass', commonClass);

const general = ref({
    name: '',
    translatedName: '',
    client: {
        clientName: ''
    },
    sales: {
        employeeName: ''
    },
    currency: 'USD'
});
const smallCard = ref({
    size: { width: 48, height: 76 },
    openQuantity: 1,
    price: '',
    boxCount: 1,
    quantityPerBox: 1,
    frontImage: '',
    backImage: '',
    box: {
        thickness: 0,
        height: 0,
        width: 0
    }
});
const adCard = ref([
    {
        "type": "non-openable",
        "name": "",
        "image": "",
        "comment": "",
        "openRegions": [
        ]
    }
])
const payout = ref({
    "type": "image",
    "image": "",
    "titleInfo": {
        "type": "text",
        "image": ""
    },
    "games": [
    ]
})
const prizeMark = ref([])
onMounted(() => {
    // let data = localStorage.getItem('submitData');
    // if (data) {
    //     let initData = JSON.parse(data);
    //     console.log(initData);
    //     general.value = initData.general;
    //     smallCard.value = initData.smallCard;
    //     adCard.value = initData.adCard;
    //     payout.value = initData.payout;
    //     prizeMark.value = initData.prizeMark;
    // }
})
const handleSubmit = () => {
    console.log(general.value);
    console.log(smallCard.value);
    console.log(adCard.value);
    console.log(payout.value);
    console.log(prizeMark.value);
    /*
    {
    "orderId": "00000000-0000-0000-0000-000000009999test999",
    "companyName": "Dongguan Huivo Data Technology Co.,Ltd.",
    "general": {
        "name": "Sammy Ho - 酷女孩们",
        "translatedName": "你好，酷女孩",
        "client": {
            "clientId": 1,
            "clientName": "客户名称"
        },
        "sales": {
            "employeeId": 1,
            "employeeName": "业务员"
        },
        "currency": "$"
    },
    "smallCard": {
        "type": "rectanglar",
        "size": {
            "width": 48,
            "height": 76
        },
        "boxCodePrefix": "EEN",
        "boxCodePosition": "BL",
        "openQuantity": 1,
        "direction": "L",
        "price": 1,
        "boxCount": 1,
        "quantityPerBox": 3200,
        "frontImage": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/正面.png",
        "backImage": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/背面.png"
    },
    "adCard": [
        {
            "type": "openable",
            "name": "Ad Card",
            "image": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/adCard正面.jpg",
            "comment": "备注区",
            "openReigion": [
                {
                    "x": 0,
                    "y": 100,
                    "width": 50,
                    "height": 50,
                    "direction": "L",
                    "mark": [
                        {
                            "range": [
                                "0",
                                "100",
                                "200",
                                "300",
                                "400",
                                "500"
                            ],
                            "x": 0.1,
                            "y": 0.1,
                            "width": 20,
                            "height": 20
                        }
                    ]
                },
                {
                    "x": 100,
                    "y": 100,
                    "width": 80,
                    "height": 80,
                    "direction": "L",
                    "mark": [
                        {
                            "range": [
                                "0",
                                "100",
                                "200",
                                "300",
                                "400",
                                "500"
                            ],
                            "x": 0.1,
                            "y": 0.1,
                            "width": 30,
                            "height": 30
                        }
                    ]
                }
            ]
        }
    ],
    "payout": {
        "type": "image",
        "image": "https://xincodefile.oss-cn-shenzhen.aliyuncs.com/nbprint/返奖.png",
        "titleInfo": {
            "type": "image",
            "image": "https://xincodefile.oss-cn-shenzhen.aliyuncs.com/nbprint/4.png"
        },
        "games": [
            {
                "name": "玩法1",
                "countMethod": "yes",
                "prize": [
                    {
                        "count": 2,
                        "amount": 400
                    },
                    {
                        "count": 4,
                        "amount": 200
                    },
                    {
                        "count": 8,
                        "amount": 50
                    }
                ]
            }
        ]
    },
    "prizeMark": [
        {
            "type": "cash",
            "image": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/T01.png",
            "amount": 50,
            "count": 8,
            "comment": "pick卡"
        },
        {
            "type": "cash",
            "image": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/T02.png",
            "amount": 50,
            "count": 8,
            "comment": "pick卡"
        },
        {
            "type": "cash",
            "image": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/T03.png",
            "amount": 50,
            "count": 8,
            "comment": "50的奖"
        },
        {
            "type": "cash",
            "image": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/T04.png",
            "amount": 100,
            "count": 4,
            "comment": "100的奖"
        },
        {
            "type": "cash",
            "image": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/T05.png",
            "amount": 200,
            "count": 1,
            "comment": "200的奖"
        },
        {
            "type": "cash",
            "image": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/T06.png",
            "amount": 200,
            "count": 1,
            "comment": "200的奖"
        },
        {
            "type": "cash",
            "image": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/T07.png",
            "amount": 200,
            "count": 1,
            "comment": "200的奖"
        },
        {
            "type": "Lose",
            "image": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/不中奖面.png",
            "amount": 50,
            "count": 8,
            "comment": "没有中奖"
        },
        {
            "type": "win",
            "image": "https://nbprint-prod.oss-cn-shenzhen.aliyuncs.com/printing-proof/00000000-0000-0000-0000-000000000999/resources/中奖面.png",
            "amount": 50,
            "count": 8,
            "comment": "没有中奖"
        }
    ]
}
    */
    //检查数据是否完整
    if (general.value.name == '') {
        ElMessage.error('请填写名字');
        return;
    }
    if (general.value.translatedName == '') {
        ElMessage.error('请填写翻译名字');
        return;
    }
    if (general.value.client.clientName == '') {
        ElMessage.error('请填写客户名');
        return;
    }
    if (general.value.sales.employeeName == '') {
        ElMessage.error('请填写业务员');
        return;
    }
    if (smallCard.value.price == '') {
        ElMessage.error('请填写小卡价格');
        return;
    }
    if (smallCard.value.frontImage == '') {
        ElMessage.error('请上传小卡正面图片');
        return;
    }
    if (smallCard.value.backImage == '') {
        ElMessage.error('请上传小卡背面图片');
        return;
    }
    if (adCard.value.length == 0) {
        ElMessage.error('请填写宣传卡信息');
        return;
    }
    //判断宣传卡信息是否完整，如果有openable类型的宣传卡，需要检查openReigion是否填写完整
    const incompleteCard = adCard.value.find(card => {
        if (card.type === 'openable') {
            if (!card.image) {
                ElMessage.error('请上传宣传卡图片');
                return true;
            }
            if (!card.openRegions.length) {
                ElMessage.error('请添加揭开区域');
                return true;
            }
            // const incompleteRegion = card.openRegion.find(region => !region.mark.length);
            // if (incompleteRegion) {
            //     ElMessage.error('请添加奖符区域');
            //     return true;
            // }
        }
        return false;
    });

    if (incompleteCard) {
        return;
    }

    //判断奖符信息是否完整
    const incompletePrizeMark = prizeMark.value.find(mark => {
        if (!mark.image) {
            ElMessage.error('请上传奖符图片');
            return true;
        }
        if (mark.type === 'noPrize') return false;  //不中奖不需要填写金额和数量
        if (!mark.amount) {
            ElMessage.error('请填写奖符金额');
            return true;
        }
        if (!mark.count) {
            ElMessage.error('请填写奖符数量');
            return true;
        }
        return false;
    });

    if (incompletePrizeMark) {
        return;
    }


    let submitData = {
        orderId: orderId,
        companyName: "Dongguan Huivo Data Technology Co.,Ltd.",
        general: general.value,
        smallCard: smallCard.value,
        adCard: adCard.value,
        payout: payout.value,
        prizeMark: prizeMark.value
    }
    //localStorage.setItem('submitData', JSON.stringify(submitData));
    serviceClass.CreateOrder(submitData).then(res => {
        console.log(res);
        ElMessageBox.alert(res.msg, '提交结果', {
            // if you want to disable its autofocus
            // autofocus: false,
            confirmButtonText: 'OK',
            callback: (action) => {
                if (action === 'confirm') {
                    useRouter().push('/opencard/orderlist');
                }
            },
        })
    })
}
</script>
<style lang="scss" scoped>
@import '../../styles/variables.scss';

.create-order {
    position: relative;

    .step-content {

        .step {
            display: flex;
            align-items: center;

            .no {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                font-size: 12px;
                background-color: $primary-color-light;
                color: white;
            }

            .title {
                margin-left: 8px;
                font-size: 18px;
            }
        }

        .is-wait {
            .no {
                background-color: var(--el-text-color-placeholder);
            }
        }
    }


}
</style>