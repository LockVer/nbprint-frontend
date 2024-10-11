<template>
    <div class="create-order">
        <general v-model:initData="general" ref="generalRef"></general>
        <small-card :hasOpenRegion="hasOpenRegion" v-model:initData="smallCard" ref="smallCardRef"></small-card>
        <ad-card v-model:initData="adCard" v-model:smallCard="smallCard" ref="adCardRef"></ad-card>
        <RewardInfo v-if="false" v-model:initData="rewardInfo" v-model:generalData="general" ref="rewardRef">
        </RewardInfo>
        <prize-mark v-model:initData="prizeMark" class="prize-mark" ref="prizeMarkRef"></prize-mark>
        <Payout v-model:initData="payout" v-model:smallCard="smallCard" v-model:gameData="payout.game" class="payout"
            ref="payoutRef"></Payout>
        <layout-footer @submit="handleSubmit"></layout-footer>
        <!-- 悬浮定位 -->
        <FloatingButton :generalRef="generalRef" :smallCardRef="smallCardRef" :adCardRef="adCardRef"
            :payoutRef="payoutRef" :prizeMarkRef="prizeMarkRef" />

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, computed, watch } from 'vue';
import General from './Components/General.vue';
import SmallCard from './Components/SmallCard.vue';
import AdCard from './Components/AdCard.vue';
import RewardInfo from './Components/RewardInfo.vue';
import PrizeMark from './Components/PrizeMark.vue';
import Payout from './Components/Payout.vue';
import LayoutFooter from '@/components/common/LayoutFooter.vue';
import FloatingButton from './Components/FloatingButton.vue';
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
    currency: 'USD',
    backgroundColor: '#409EFF',
    company: ""
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
        imageSize: '',
        image: '',
        adCardSize: null,
        adBoxCode: '',
        type: 'non-openable',
        openDirection: 'T',
        adBoxCodePosition: 'BL',
        openRegions: [],
        boxNumberRegions: []
    }
]);
const rewardInfo = ref({
    "type": "image",
    "image": "",
    "titleInfo": {
        "type": "text",
        "image": ""
    },
    "games": []
});
const prizeMark = ref([]);
const payout = ref({
    payoutType: 'upload',
    templateConfiguration: {
        quantitativeConnector: '',
        resultConnector: '',
        typeface: '',
        borderStyle: ''
    },
    basicInfo: {
        payoutStatus: 0,
        payoutTitle: '',
        payoutNumber: '',
        payoutAmount: '',
        payoutTotal: '',
        payoutImage: '',
    },
    game: []
})
const editMode = ref(false);
const hasOpenRegion = computed(() => {
    return adCard.value.some(card => card.openRegions.length > 0);
});

const generalRef = ref(null);
const smallCardRef = ref(null);
const adCardRef = ref(null);
// const rewardInfoRef = ref(null);
const payoutRef = ref(null);
const prizeMarkRef = ref(null);
const validateStatus = ref(false);
let autoSaveTimer = null;

provide('validateStatus', validateStatus);

const scrollToElement = (refName) => {
    const element = refName.value?.$el || refName.value;
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

const clearErrorOnInput = (refName) => {
    watch(refName, (newValue, oldValue) => {
        if (newValue !== oldValue) {
            ElMessage.closeAll();
        }
    }, { deep: true });
};

onMounted(() => {
    if (route.query.id) {
        serviceClass.getOrderById(route.query.id).then(res => {
            let data = res.data.json;
            general.value = data.general;
            smallCard.value = data.smallCard;
            adCard.value = data.adCard;
            rewardInfo.value = data.rewardInfo;
            prizeMark.value = data.prizeMark;
            payout.value = data.payout;
            editMode.value = true;
            orderId.value = data.orderId;
            console.log('orderId', orderId.value);
        });
    } else {
        orderId.value = uuidv4();
        serviceClass.loadDraft(store.state.userInfo.id).then(res => {
            if (res.code == 1) {
                ElMessageBox.confirm('检测到您有未提交的订单草稿，是否加载？', '提示', {
                    confirmButtonText: '是',
                    cancelButtonText: '否',
                    type: 'warning'
                }).then(() => {
                    let data = res.data.json;
                    general.value = data.general;
                    smallCard.value = data.smallCard;
                    adCard.value = data.adCard;
                    rewardInfo.value = data.rewardInfo;
                    prizeMark.value = data.prizeMark;
                    payout.value = data.payout;
                    orderId.value = data.orderId;
                    console.log('orderId', orderId.value);
                }).catch(() => {
                    console.log('不加载草稿');
                });
            }
            console.log('loadDraft', res);
        })
        autoSaveTimer = setInterval(() => {
            autoSave();
        }, 10000);
        console.log('orderId', orderId.value);
    }

});

onUnmounted(() => {
    clearInterval(autoSaveTimer);
});

const handleSubmit = () => {
    validateStatus.value = true;
    // 检查数据是否完整
    if (general.value.name == '') {
        ElMessage.error('请填写名字');
        scrollToElement(generalRef);
        return;
    }
    if (general.value.translatedName == '') {
        ElMessage.error('请填写翻译名字');
        scrollToElement(generalRef);
        return;
    }
    if (general.value.client.clientName == '') {
        ElMessage.error('请填写客户名');
        scrollToElement(generalRef);
        return;
    }
    if (general.value.sales.nbUserId == '') {
        ElMessage.error('业务员不能为空');
        scrollToElement(generalRef);
        return;
    }
    if (general.value.company == '') {
        ElMessage.error('请选择公司');
        scrollToElement(generalRef);
        return;
    }
    if (smallCard.value.price == '') {
        ElMessage.error('请填写小卡价格');
        scrollToElement(smallCardRef);
        return;
    }
    if (smallCard.value.smallBoxCode == '') {
        ElMessage.error('请填写小卡盒号');
        scrollToElement(smallCardRef);
        return;
    }
    if (smallCard.value.frontImage == '') {
        ElMessage.error('请上传小卡正面图片');
        scrollToElement(smallCardRef);
        return;
    }
    if (smallCard.value.backImage == '') {
        ElMessage.error('请上传小卡背面图片');
        scrollToElement(smallCardRef);
        return;
    }
    if (adCard.value.length == 0) {
        ElMessage.error('请填写宣传卡信息');
        scrollToElement(adCardRef);
        return;
    }
    // 判断宣传卡信息是否完整，如果有openable类型的宣传卡，需要检查openRegion是否填写完整
    const incompleteCard = adCard.value.find(card => {
        if (card.type === 'openable') {
            if (card.adBoxCode == '' || card.adBoxCode == undefined) {
                ElMessage.error('请填写宣传卡盒号');
                scrollToElement(adCardRef);
                return true;
            }
            if (!card.image) {
                ElMessage.error('请上传宣传卡图片');
                scrollToElement(adCardRef);
                return true;
            }
            if (!card.openRegions.length) {
                ElMessage.error('请添加揭开区域');
                scrollToElement(adCardRef);
                return true;
            }
        } else {
            if (card.adBoxCode == '' || card.adBoxCode == undefined) {
                ElMessage.error('请填写宣传卡盒号');
                scrollToElement(adCardRef);
                return true;
            }
            if (!card.image) {
                ElMessage.error('请上传宣传卡图片');
                scrollToElement(adCardRef);
                return true;
            }
        }
        return false;
    });

    if (incompleteCard) {
        return;
    }

    // 判断奖符信息是否完整
    const incompletePrizeMark = prizeMark.value.find(mark => {
        if (!mark.image) {
            ElMessage.error('请上传奖符图片');
            scrollToElement(prizeMarkRef);
            return true;
        }
        if (mark.type === 'noPrize') return false;  // 不中奖不需要填写金额和数量
        return false;
    });

    if (incompletePrizeMark) {
        return;
    }

    // 判断玩法信息是否完整
    console.log(payout.templateConfiguration)
    if (payout.value.payoutType == 'manual') {
        if (payout.value.templateConfiguration.quantitativeConnector == '') {
            ElMessage.error('请选择数量连接符');
            scrollToElement(payoutRef);
            return;
        }
        if (payout.value.templateConfiguration.resultConnector == '') {
            ElMessage.error('请选择结果连接符');
            scrollToElement(payoutRef);
            return;
        }
        if (payout.value.templateConfiguration.typeface == '') {
            ElMessage.error('请选择字体');
            scrollToElement(payoutRef);
            return;
        }
        if (payout.value.basicInfo.payoutNumber == '') {
            ElMessage.error('请输入小卡数量');
            scrollToElement(payoutRef);
            return;
        }
        if (payout.value.basicInfo.payoutAmount == '') {
            ElMessage.error('请输入小卡单价');
            scrollToElement(payoutRef);
            return;
        }
        // 判断奖符信息是否完整
        const incompletePayoutMark = payout.value.game.find(mark => {
            if (!mark.gameAmount) {
                ElMessage.error('请填写玩法金额');
                scrollToElement(payoutRef);
                return true;
            }
            if (!mark.gameNumber) {
                ElMessage.error('请填写玩法数量');
                scrollToElement(payoutRef);
                return true;
            }
            return false;
        });

        if (incompletePayoutMark) {
            return;
        }
    } else {
        if (!payout.value.payoutImage) {
            ElMessage.error('请上传Payout图片');
            scrollToElement(payoutRef);
            return;
        }
    }

    let submitData = {
        orderId: orderId.value,
        companyName: general.value.company,
        general: general.value,
        smallCard: smallCard.value,
        adCard: adCard.value,
        rewardInfo: rewardInfo.value,
        prizeMark: prizeMark.value,
        payout: payout.value,
        // 新增状态
        status: editMode.value ? '1' : '0'  // 0:新增 1:编辑
    };
    console.log(submitData);
    validateStatus.value = false;

    localStorage.setItem('submitData', JSON.stringify(submitData));
    serviceClass.createOrder(submitData).then(res => {
        clearInterval(autoSaveTimer);
        serviceClass.deleteDraft(store.state.userInfo.id).then(res => {
            console.log('删除草稿成功');
        });
        ElMessageBox.alert(res.msg, '提交结果', {
            confirmButtonText: 'OK',
            callback: (action) => {
                if (action == 'confirm') {
                    router.push('/opencard');
                }
            },
        }).catch((err) => {
            ElMessage.error(err);
        });
    })
};


const autoSave = () => {
    let submitData = {
        orderId: orderId.value,
        companyName: general.value.company,
        general: general.value,
        smallCard: smallCard.value,
        adCard: adCard.value,
        rewardInfo: rewardInfo.value,
        prizeMark: prizeMark.value,
        payout: payout.value,
        // 新增状态
        status: editMode.value ? '1' : '0'  // 0:新增 1:编辑
    };
    console.log(submitData);
    serviceClass.autoSave({
        nbUserId: store.state.userInfo.id,
        json: JSON.stringify(submitData)
    }).then(res => {
        console.log('自动保存成功');
    });
};
// 监听输入内容，清除错误提示
clearErrorOnInput(general);
clearErrorOnInput(smallCard);
clearErrorOnInput(adCard);
clearErrorOnInput(prizeMark);

</script>
<style lang="scss" scoped>
.payout {
    margin-bottom: 90px
}

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

.floating {
    display: inline-flex;
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    border-radius: 10px;
    background: #FFF;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.10);
    font-family: "PingFang SC";
    font-weight: 500;
    position: fixed;
    right: 30px;
    top: 280px;
    z-index: 999;

    .floating-title {
        color: #606266;
        font-size: 16px;
        padding-left: 12px;
    }

    .floating-item {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        color: #909399;
        row-gap: 6px;
        font-size: 14px;


        div {
            display: flex;
            align-items: center;
            column-gap: 8px;

            i {
                display: inline-block;
                height: 14px;
                width: 4px;
                border-radius: 8px;
            }
        }

        .active {
            color: #029;
        }

        .active i {
            background: #029;
        }
    }
}
</style>
