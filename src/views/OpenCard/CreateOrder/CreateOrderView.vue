<template>
    <div class="create-order">
        <general v-model:initData="general"></general>
        <small-card :hasOpenRegion="hasOpenRegion" v-model:initData="smallCard"></small-card>
        <ad-card v-model:initData="adCard" v-model:smallCard="smallCard"></ad-card>
        <payout v-if="false" v-model:initData="payout" v-model:generalData="general"></payout>
        <prize-mark v-model:initData="prizeMark" class="prize-mark"></prize-mark>
        <layout-footer @submit="handleSubmit"></layout-footer>
    </div>
</template>

<script setup>
import { ref, onMounted, provide, computed, watch } from 'vue';
import General from './Components/General.vue';
import SmallCard from './Components/SmallCard.vue';
import AdCard from './Components/AdCard.vue';
import Payout from './Components/Payout.vue';
import PrizeMark from './Components/PrizeMark.vue';
import LayoutFooter from '@/components/common/LayoutFooter.vue';
import OpenCardService from '@/services/OpenCardService';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import CommonService from '@/services/CommonService';



const orderId = ref("");   //唯一的orderId，用于后续的提交订单，页面内只有一个orderId，刷新后重新生成

const router = useRouter();
const route = useRoute();
const store = useStore();
const serviceClass = new OpenCardService();
const commonClass = new CommonService(orderId.value);
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
    smallBoxCodePosition: 'BL',
    openDirection: 'T',
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
const editMode = ref(false);
const hasOpenRegion = computed(() => {
    return adCard.value.some(card => card.openRegions.length > 0);
})



onMounted(() => {
    if (route.query.id) {
        serviceClass.getOrderById(route.query.id).then(res => {
            console.log(res);
            let data = res.data.json;
            general.value = data.general;
            smallCard.value = data.smallCard;
            adCard.value = data.adCard;
            payout.value = data.payout;
            prizeMark.value = data.prizeMark;
            editMode.value = true;
            orderId.value = data.orderId;

        })
    }else{
        orderId.value = uuidv4();
    }
})

const handleSubmit = () => {
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
    if (general.value.sales.nbUserId == '') {
        ElMessage.error('业务员不能为空');
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
    //判断宣传卡信息是否完整，如果有openable类型的宣传卡，需要检查openRegion是否填写完整
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
            // const incompleteRegion = card.openRegions.find(region => !region.mark.length);
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
        // if (!mark.amount) {
        //     ElMessage.error('请填写奖符金额');
        //     return true;
        // }
        // if (!mark.count) {
        //     ElMessage.error('请填写奖符数量');
        //     return true;
        // }
        return false;
    });

    if (incompletePrizeMark) {
        return;
    }


    let submitData = {
        orderId: orderId.value,
        companyName: "Dongguan Huivo Data Technology Co.,Ltd.",
        general: general.value,
        smallCard: smallCard.value,
        adCard: adCard.value,
        payout: payout.value,
        prizeMark: prizeMark.value,
        // 新增状态
        status: editMode.value ? '1' : '0'  //0:新增 1:编辑
    }
    //localStorage.setItem('submitData', JSON.stringify(submitData));
    console.log(submitData);
    serviceClass.createOrder(submitData).then(res => {
        console.log(res);
        ElMessageBox.alert(res.msg, '提交结果', {
            // if you want to disable its autofocus
            // autofocus: false,
            confirmButtonText: 'OK',
            callback: (action) => {
                if (action == 'confirm') {
                    router.push('/opencard');
                }
            },
        })
    })
}
</script>
<style lang="scss" scoped>
.prize-mark {
    margin-bottom: 90px
}

@import '@/styles/variables.scss';


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