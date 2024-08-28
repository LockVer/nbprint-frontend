<template>
    <div class="factory-details">
        <!-- 审核卡片 -->
        <x-card v-for="(item, index) in audits" :key="index" :title="item.title" :cardStyle="{ 'height': 'auto' }">
            <div class="generalInfo">
                <x-component v-for="(value, index) in item.items" :key="index" :label="value.label"
                    :titleStyle="'#484848'" :width="'15%'">
                    <div class="value">{{ value.datas }}</div>
                </x-component>
            </div>
        </x-card>
        <!-- 审核表单卡片 -->
        <x-card v-for="(item, index) in auditCordData" :key="index" :title="item.title"
            :cardStyle="{ 'height': 'auto' }" class="audit">
            <div class="audit-card" v-for="(value, index) in item.items" :key="index">
                <div class="audit-title">
                    <span>{{ value.adTitle }}</span>
                </div>
                <div class="audit-content">
                    <div class="generalInfo">
                        <!-- 显示每个审核表单项 -->
                        <x-component v-for="(adItem, adIndex) in value.adItem" :key="adIndex" :label="adItem.label"
                            :width="'15%'" :titleStyle="'#484848'" :titleBottom="'12px'" :marginBottom="'16px'">
                            <!-- 选择框 -->
                            <x-check-box v-model="adItem.selectedValue" :DataList="cardSizeList" type="radio"
                                @update:modelValue="handleExceptionChange(adItem, value.adTitle)" />
                            <!-- 显示错误信息 -->
                            <div v-if="adItem.errorMessage" class="error-message">{{ adItem.errorMessage }}</div>
                        </x-component>
                    </div>
                </div>
            </div>
            <!-- 显示异常信息 -->
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
import store from '@/store/index';
import { reactive, ref, watch, onMounted } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { ElMessage } from 'element-plus';
import factoryService from '@/services/FactoryService';

const router = useRouter()
const route = useRoute()
// 异常描述
const textarea1 = ref('')
// 选择框选项
const cardSizeList = reactive([
    { text: '正常', value: "1" },
    { text: '异常', value: "0" }
])
// 审核数据
const audits = reactive([...audit]);
const auditCordData = reactive([...auditCord]);
// 异常状态和标签
const hasException = ref(false);
const exceptionLabels = ref([]);
const errorMessage = ref('');
const factoryServiceClass = new factoryService();
const isSubmitting = ref(false); // 是否为提交状态

// 监听异常描述的变化
watch(() => textarea1.value, (newVal) => {
    if (newVal) {
        errorMessage.value = '';
    }
})

onMounted(() => {
    // 获取订单详情数据
    let resdata = JSON.parse(localStorage.getItem('orderDetails'));
    // 遍历 audits 数组中的每个项目
    audits.forEach((item) => {
        item.items.forEach((value) => {
            // 检查 resdata 中是否存在与当前 item 的 name 属性匹配的数据
            if (resdata) {
                if (resdata[value.name]) {
                    value.datas = resdata[value.name]
                } else {
                    value.datas = ''
                }
            } else {
                value.datas = ''
            }
        })
    })
})

// 处理异常变化
const handleExceptionChange = (adItem) => {
    // 检查 adItem 的 selectedValue 是否为 "0" (表示异常)
    if (adItem.selectedValue === "0") {
        // 如果异常标签数组中不存在当前 adItem 的标签，则将其添加到异常标签数组中
        if (!exceptionLabels.value.some(item => item.label === adItem.label)) {
            exceptionLabels.value.push({
                label: adItem.label,
                name: adItem.name
            });
        }
        // 更新 hasException 的值为 true，表示存在异常
        hasException.value = true;
    } else {
        const index = exceptionLabels.value.findIndex(item => item.label === adItem.label);
        if (index !== -1) {
            exceptionLabels.value.splice(index, 1);
        }
        hasException.value = exceptionLabels.value.length > 0;
    }
};


// 处理提交
const handleSubmit = () => {
    // 标记是否所有必填项都已完成
    let isComplete = true;
    // 遍历 auditCordData 数组中的每个卡片
    auditCordData.forEach((card) => {
        card.items.forEach((item) => {
            item.adItem.forEach((adItem) => {
                if (!adItem.selectedValue) {
                    // 如果没有选中值，设置错误信息并标记为未完成
                    adItem.errorMessage = `${adItem.label} 为必填项`;
                    isComplete = false;
                } else {
                    adItem.errorMessage = '';
                }
            });
        });
    });

    // 如果有未完成的必填项，显示错误消息并返回
    if (!isComplete) {
        ElMessage.error('请检查必填项');
        return;
    }

    // 如果存在异常但未填写异常描述，显示错误消息并返回
    if (hasException.value && !textarea1.value) {
        ElMessage.error('请填写异常描述');
        errorMessage.value = `请填写异常描述`;
        return;
    }
    // 如果所有选项都已选择，继续提交数据
    postDatas();
};


// 提交数据
const postDatas = () => {
    let data = {};
    // 遍历 auditCordData 数组中的每个卡片
    auditCordData.forEach((card) => {
        card.items.forEach((item) => {
            item.adItem.forEach((adItem) => {
                // 将每个 adItem 的 name 和选中的值添加到 data 对象中
                data[adItem.name] = adItem.selectedValue;
            });
        });
    });
    data = {
        checkId: Number(route.params.id),
        nbUserId: store.state.userInfo.id,
        ...data,
        exceptionItem: exceptionLabels.value.map(item => item.label).join(','),
        remark: textarea1.value
    };
    console.log(data)
    factoryServiceClass.submitFactoryAudit(data).then((res) => {
        isSubmitting.value = true;
        ElMessage({
            type: 'success',
            message: '提交成功',
            duration: 1000,
            onClose: () => {
                clearData();
                router.go(-1);
            }
        });
    }).catch((err) => {
        console.log(err);
    });
};


// 清除数据
const clearData = () => {
    // 清空异常描述
    textarea1.value = '';
    // 清空 audits 数据
    audits.forEach((item) => {
        item.items.forEach((value) => {
            value.datas = '';
        });
    });
    // 清空 auditCordData 数据
    auditCordData.forEach((card) => {
        card.items.forEach((item) => {
            item.adItem.forEach((adItem) => {
                adItem.selectedValue = '';
                adItem.errorMessage = '';
            });
        });
    });
    // 清空异常标签和异常状态
    exceptionLabels.value = [];
    hasException.value = false;
    errorMessage.value = '';
};


// 返回处理
const backHandler = () => {
    factoryServiceClass.auditUnlock(route.params.id).then((res) => {
        router.go(-1)
        // 打印解锁结果
    }).catch((err) => {
        console.log(err)
    })
}

// 在离开页面时进行解单功能
onBeforeRouteLeave((to, from, next) => {
    console.log(from.name);
    if (isSubmitting.value) {
        // 如果正在提交，则不执行解锁功能，直接放行
        next();
        return;
    }
    if (from.name === "auditdetails") {
        if (from.params.id) {
            factoryServiceClass.auditUnlock(from.params.id).then((res) => {
                console.log(res);
                next(); // 只有在异步操作完成后才调用 next()
            }).catch((err) => {
                console.log(err);
                next();
            });
        } else {
            next();
        }
    } else {
        next();
    }
});
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