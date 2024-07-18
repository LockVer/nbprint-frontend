<template>
    <div class="factory-details">
        <x-card v-for="(item, index) in audits" :key="index" :title="item.title" :cardStyle="{ 'height': 'auto' }">
            <div class="generalInfo">
                <x-component v-for="(value, index) in item.items" :key="index" :label="value.label" :titleStyle="'#484848'"
                    :width="'15%'">
                    <div class="value">{{ value.datas }}</div>
                </x-component>
            </div>
        </x-card>
        <x-card v-for="(item, index) in auditCordData" :key="index" :title="item.title" :cardStyle="{ 'height': 'auto' }"
            class="audit">
            <div class="audit-card" v-for="(value, index) in item.items" :key="index">
                <div class="audit-title">
                    <span>{{ value.adTitle }}</span>
                </div>
                <div class="audit-content">
                    <div class="generalInfo">
                        <x-component v-for="(adItem, adIndex) in value.adItem" :key="adIndex" :label="adItem.label"
                            :width="'15%'" :titleStyle="'#484848'" :titleBottom="'12px'" :marginBottom="'16px'">
                            <x-check-box v-model="adItem.selectedValue" :DataList="cardSizeList" type="radio"
                                @update:modelValue="handleExceptionChange(adItem, value.adTitle)" />
                            <div v-if="adItem.errorMessage" class="error-message">{{ adItem.errorMessage }}</div>
                        </x-component>
                    </div>
                </div>
            </div>
            <div v-if="hasException" class="audit-card">
                <div class="audit-title">修改意见</div>
                <div class="exception">
                    <div class="exception-title">异常项</div>
                    <div class="items">
                        <el-tag v-for="(items, index) in exceptionLabels" :key="index" color="#0022991A">{{ items.label
                            }}</el-tag>
                    </div>
                </div>
                <div class="remark">
                    <div class="remark-title">异常描述（必填）</div>
                    <div class="items">
                        <el-input v-model="textarea1" style="width: 100%" autosize type="textarea" placeholder="备注" />
                        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                    </div>
                </div>
            </div>
        </x-card>
        <layout-footer @submit="handleSubmit" @back="backHandler"></layout-footer>
    </div>
</template>

<script setup>
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import XCheckBox from '@/components/functional/XCheckBox.vue';
import LayoutFooter from '@/components/common/LayoutFooter.vue';
import audit from '@/config/audit';
import auditCord from '@/config/auditCord';
import { reactive, ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElLoading } from 'element-plus';
import FactoryService from '@/services/FactoryService';

const router = useRouter()
const route = useRoute()
const textarea1 = ref('')
const cardSizeList = reactive([
    { text: '正常', value: "1" },
    { text: '异常', value: "0" }
])
const audits = reactive([...audit]);
const auditCordData = reactive([...auditCord]);
const hasException = ref(false);
const exceptionLabels = ref([]);
const errorMessage = ref('');
const serviceClass = new FactoryService();

watch(() => textarea1.value, (newVal) => {
    if (newVal) {
        errorMessage.value = '';
    }
})

onMounted(() => {
    let resdata = JSON.parse(localStorage.getItem('orderDetails'));
    audits.forEach((item) => {
        item.items.forEach((value) => {
            if (resdata[value.name]) {
                value.datas = resdata[value.name]
            }
        })
    })
    // let exception = JSON.parse(sessionStorage.getItem('exceptionLabels'));
    // if(exception){
    //     exceptionLabels.value = exception;
    //     hasException.value = exceptionLabels.value.length > 0;
    // }
})

const handleExceptionChange = (adItem) => {
    if (adItem.selectedValue === "0") {
        if (!exceptionLabels.value.some(item => item.label === adItem.label)) {
            exceptionLabels.value.push({
                label: adItem.label,
                name: adItem.name
            });
        }
        hasException.value = true;
    } else {
        const index = exceptionLabels.value.findIndex(item => item.label === adItem.label);
        if (index !== -1) {
            exceptionLabels.value.splice(index, 1);
        }
        hasException.value = exceptionLabels.value.length > 0;
    }
    // sessionStorage.setItem('exceptionLabels', JSON.stringify(exceptionLabels.value));
};

const handleSubmit = () => {
    let isComplete = true;
    auditCordData.forEach((card) => {
        card.items.forEach((item) => {
            item.adItem.forEach((adItem) => {
                if (!adItem.selectedValue) {
                    adItem.errorMessage = `${adItem.label} 为必填项`;
                    isComplete = false;
                } else {
                    adItem.errorMessage = '';
                }
            });
        });
    });

    if (!isComplete) {
        ElMessage.error('请检查必填项');
        return;
    }

    if (hasException.value && !textarea1.value) {
        ElMessage.error('请填写异常描述');
        errorMessage.value = `请填写异常描述`;
        return;
    }

    // 如果所有选项都已选择，继续提交
    postDatas();
};

const postDatas = () => {
    let data = {}
    auditCordData.forEach((card) => {
        card.items.forEach((item) => {
            item.adItem.forEach((adItem) => {
                data[adItem.name] = adItem.selectedValue
            })
        })
    })
    data = {
        id: Number(route.params.id),
        ...data,
        exceptionItem: exceptionLabels.value.map(item => item.label).join(','),
        remark: textarea1.value
    }
    // console.log(data)
    serviceClass.SubmitFactoryCheck(data).then((res) => {
        ElMessage({
            type: 'success',
            message: '提交成功',
            duration: 1000,
            onClose: () => {
                clearData()
                router.go(-1)
            }
        })
    }).catch((err) => {
        console.log(err)
    })
}


const clearData = () => {
    textarea1.value = '';
    audits.forEach((item) => {
        item.items.forEach((value) => {
            value.datas = '';
        });
    });
    auditCordData.forEach((card) => {
        card.items.forEach((item) => {
            item.adItem.forEach((adItem) => {
                adItem.selectedValue = '';
                adItem.errorMessage = '';
            });
        });
    });
    exceptionLabels.value = [];
    hasException.value = false;
    errorMessage.value = '';
};


const backHandler = () => {
    serviceClass.CheckUnlock(route.params.id).then((res) => {
        console.log(res)
        router.go(-1)
    }).catch((err) => {
        console.log(err)
    })
}

</script>

<style lang="scss" scoped>
.factory-details {
    position: relative;
}
.error-message {
    color: red;
    font-size: 12px;
    margin-top: 5px;
}

.generalInfo {
    display: flex;
    column-gap: 30px;
    justify-content: flex-start;
    flex-wrap: wrap;

    .value {
        color: rgba(0, 0, 0, 0.80);
        font-family: "Helvetica Neue";
        font-size: 12px;
    }
}

.audit {
    margin-bottom: 90px;
}

.audit-card {
    .audit-title {
        height: 30px;
        line-height: 30px;
        padding-left: 10px;
        box-sizing: border-box;
        background: rgba(0, 34, 153, 0.04);
        color: #029;
        font-family: "Helvetica Neue";
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 18px;
    }

    .audit-content {
        /* width: 100%; */
        /* display: flex; */
        /* gap: 18px; */

        .generalInfo {
            width: 100%;
            display: flex;
            column-gap: 200px;
            justify-content: flex-start;

            .value {
                color: rgba(0, 0, 0, 0.80);
                font-family: "Helvetica Neue";
                font-size: 12px;
            }
        }
    }

    .exception,
    .remark {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 18px;
        font-family: "Helvetica Neue";
        font-size: 12px;
        color: var(--Grey-70, #484848);

        .items {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .el-tag__content {
                font-family: "Helvetica Neue";
                font-size: 12px;
            }
        }
    }

    .remark {
        margin: 0px;

        span {
            font-weight: 400;
        }
    }
}
</style>