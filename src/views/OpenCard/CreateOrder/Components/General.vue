<template>
    <x-card title="通用信息">
        <div class="general-content gap">
            <x-component label="名字" width="220px" :showErrorMsg="!initData.name">
                <el-input v-model="initData.name" placeholder="请输入名称" />
            </x-component>
            <x-component label="译名" width="220px" :showErrorMsg="!initData.translatedName">
                <el-input v-model="initData.translatedName" placeholder="请输入译名" />
            </x-component>
            <x-component label="客户名字" width="220px" :showErrorMsg="!initData.client.clientName">
                <el-input v-model="initData.client.clientName" placeholder="请输入客户名字" />
            </x-component>
            <x-component label="业务员" width="220px">
                <el-input v-model="initData.sales.nbUserName" disabled placeholder="请输入业务员" />
            </x-component>
            <x-component label="货币符号" width="220px">
                <el-select v-model="initData.currency" placeholder="请选择货币符号">
                    <el-option label="$" value="USD"></el-option>
                    <el-option label="¥" value="CNY"></el-option>
                </el-select>
            </x-component>
        </div>
        <div class="general-content gap">
            <x-component label="公司名称" width="220px" :showErrorMsg="!initData.company">
                <el-select v-model="initData.company" placeholder="请选择公司名称">
                    <el-option v-for="item in companyList" :label="item.label" :value="item.label"></el-option>
                </el-select>
            </x-component>
            <x-component label="公司图标" width="220px">
                <div class="company-icon">
                    <div class="no-icon" v-if="!companyList.find(item => item.label == initData.company)?.url">无</div>
                    <el-image v-else style=" height: 30px"
                        :src="companyList.find(item => item.label == initData.company)?.url" :zoom-rate="1.2"
                        :max-scale="7" :min-scale="0.2"
                        :preview-src-list="[companyList.find(item => item.label == initData.company)?.url]"
                        :initial-index="4" fit="cover" />
                </div>
            </x-component>
            <x-component label="背景颜色" width="220px">
                <div class="color-picker">
                    <el-color-picker ref="colorPicker" show-alpha v-model="initData.backgroundColor"
                        :predefine="predefineColors" />
                    <div class="colorText">{{ initData.backgroundColor }}</div>
                    <div class="btn" @click="openColorPicker">选择</div>
                </div>
            </x-component>
        </div>
    </x-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import { useStore } from 'vuex';

const predefineColors = ref([
    'rgb(223, 242, 252,1)',
    'rgb(218, 236, 219,1)',
    'rgb(255, 220, 220,1)',
]);

const companyList = ref([
    { label: '东莞市大朗聚印贸易行有限公司', value: 'Dongguan Dalang Juyin trading Co., Ltd', url: '/public/image/dalang.png' },
    { label: '东莞汇合数据科技有限公司', value: 'Dongguan Huivo Data Technology Co., Ltd', url: '/public/image/huihe.png' },
    { label: '东莞将为防伪科技有限公司', value: 'Dongguan Jiangwei anti-counterfeiting technology Co., Ltd', url: '/public/image/jiangwei.png' },
    { label: '深圳市将维可变数据赋码技术有限公司', value: 'Shenzhen Jiangwei variable data coding technology Co., Ltd', url: '/public/image/jiangwei.png' },
]);




// 获取 el-color-picker 的实例
const colorPicker = ref(null);

const initData = defineModel("initData");
const store = useStore();

// 打开颜色选择器
const openColorPicker = () => {
    colorPicker.value.show();
};
// 确保在组件挂载后可以访问 DOM 元素
onMounted(() => {
    if (colorPicker.value) {
        console.log('Color Picker mounted successfully');
    } else {
        console.error('Color Picker instance not found');
    }
});

initData.value.sales.nbUserName = store.state.userInfo.userName;
initData.value.sales.nbUserId = store.state.userInfo.id;
console.log(store.state.userInfo);
watch(
    () => store.state.userInfo,
    (newUserInfo) => {
        // 将新数据赋值给 initData
        initData.value.sales.nbUserName = newUserInfo.userName;
        initData.value.sales.nbUserId = newUserInfo.id;
        console.log(newUserInfo);
    }
);

</script>


<style lang="scss" scoped>
@import '@/styles/variables.scss';

.general-content {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    column-gap: 100px;
    row-gap: 12px;

    .color-picker {
        width: 220px;
        height: 32px;
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
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
            margin-left: 10px;
            color: #029;
        }
    }
}

.gap {
    margin-bottom: 12px;
}

::v-deep(.el-color-picker__trigger) {
    border: 1px solid transparent;
}

::v-deep(.el-color-picker__icon) {
    display: none;
}

.company-icon {
    width: 220px;
    height: 30px;
    border-radius: 4px;

    .no-icon {
        color: rgba(0, 0, 0, 0.8);
        font-family: "Source Han Sans CN";
        font-size: 12px;
        line-height: 30px;
    }
}
</style>
