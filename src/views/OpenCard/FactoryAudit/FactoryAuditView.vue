<template>
    <x-card title="工厂审核">
        <div class="general-content">
            <x-component label="产品名称">
                <el-input v-model="searchForm.productName" placeholder="请输入产品名称" />
            </x-component>
            <x-component label="客户">
                <el-select v-model="searchForm.customerName" placeholder="请选择客户">
                    <el-option v-for="(item, index) in options.customerNames" :key="index" :label="item"
                        :value="item" />
                </el-select>
            </x-component>
            <x-component label="尺寸">
                <el-select v-model="searchForm.smallCardSize" placeholder="请选择尺寸">
                    <el-option v-for="(item, index) in options.cardSizes" :key="index" :label="item" :value="item" />
                </el-select>
            </x-component>
            <x-component label="数量">
                <div class="number-range-container">
                    <div class="number-range">
                        <el-input-number placeholder="最小值" v-model="searchForm.minTotal" :controls="false" />
                        <div class="to">
                            <span>-</span>
                        </div>
                        <el-input-number placeholder="最大值" v-model="searchForm.maxTotal" :controls="false" />
                    </div>
                    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                </div>
            </x-component>
            <x-component label="创建时间">
                <el-date-picker v-model="createTime" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期"
                    :append-to-body="true" :default-value="[new Date(), new Date()]" @change="changeHandler" />
            </x-component>
        </div>
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="productName" label="产品名称" :show-overflow-tooltip="true">
                <template #default="scope">
                    {{ scope.row.productName }}（{{ scope.row.chineseName }}）
                </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户名字" />
            <el-table-column prop="status" label="状态">
                <template #default="scope">
                    <el-tag :type="['warning', 'warning', 'success', 'danger'][scope.row.checkStatus]">{{ ["待审核",
                        "待审核", "已通过", "未通过"][scope.row.checkStatus] }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="total" label="数量" />
            <el-table-column prop="smallCardSize" label="尺寸" />
            <el-table-column prop="businessPeople" label="业务员" />
            <el-table-column prop="createTime" label="创建时间">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span>{{ moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')
                            }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="80">
                <template #default="scope">
                    <el-link type="primary" :href="scope.row.pdfOss" @click.stop>下载</el-link>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="审核" width="100">
                <template #default="scope">
                    <button class="btn" :disabled="scope.row.checkStatus == 2 || scope.row.checkStatus == 3"
                        :class="{ 'btn-disabled': scope.row.checkStatus == 2 || scope.row.checkStatus == 3 }"
                        @click="checkOrder(scope.row)">{{ ["审核",
                            "审核", "已审核", "已审核"][scope.row.checkStatus] }}</button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pager">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page.sync="currentPage" :page-size="pageSize" layout="prev, pager, next" background
                :page-count="totalPage" />
        </div>
    </x-card>
</template>

<script setup>
import { onMounted, ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import XCard from '@/components/container/XCard.vue';
import { ElMessage } from 'element-plus';
import moment from 'moment';
import XComponent from '@/components/container/XComponent.vue';
import searchService from '@/services/searchService';
import FactoryService from '@/services/FactoryService';


const router = useRouter();
const tableData = ref([]);
const totalPage = ref(0);
const errorMessage = ref('');
const options = ref('');
const searchServiceClass = new searchService();
const factoryServiceClass = new FactoryService();
const searchForm = reactive({
    chineseName: '',
    customerName: '',
    smallCardSize: '',
    minTotal: null,
    maxTotal: null,
});

const createTime = ref(null);
const startTime = ref('');
const endTime = ref('');
// 分页参数
const currentPage = ref(1);
const pageSize = ref(12);

watch(searchForm, (newVal) => {
    if (searchForm.minTotal !== null && searchForm.maxTotal !== null && searchForm.maxTotal < searchForm.minTotal) {
        errorMessage.value = '最大值不能小于最小值';
        return
    }
    errorMessage.value = '';
    for (const key in newVal) {
        if (newVal[key] === '' || newVal[key] === null) {
            delete newVal[key];
        }
    }
    searchHandler({
        ...newVal,
        startTime: startTime.value,
        endTime: endTime.value
    });
});
const changeHandler = (value) => {
    if (value) {
        const formattedDates = value.map(date => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        });
        startTime.value = formattedDates[0];
        endTime.value = formattedDates[1];
    } else {
        startTime.value = '';
        endTime.value = '';
    }
    searchHandler({
        ...searchForm,
        startTime: startTime.value,
        endTime: endTime.value
    })
}

const searchHandler = (value) => {
    for (const key in value) {
        if (value[key] === '' || value[key] === null) {
            delete value[key];
        }
    }
    loadData(value)
}
// 审核订单处理函数
const checkOrder = (row) => {
    factoryServiceClass.CheckLock(row.id).then(res => {
        localStorage.setItem('orderDetails', JSON.stringify(res.data));
        router.push(`/factoryaudit/detail/${row.id}`);
    }).catch(err => {
        ElMessage.error(err);
    })
}
// 加载数据函数
const loadData = (data) => {
    let params = {
        "pageSize": pageSize.value,
        "pageNum": currentPage.value
    }
    if (data) {
        params = Object.assign(params, data);
    }
    factoryServiceClass.GetFactoryList(params).then((res) => {
        tableData.value = res.data.orderList;
        totalPage.value = res.data.totalPage;
    }).catch((err) => {
        console.log(err);
    });
};

const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
    loadData();
};
const handleCurrentChange = (newSize) => {
    currentPage.value = newSize;
    loadData();
};

onMounted(() => {
    searchServiceClass.getOptions().then((res) => {
        options.value = res.data;
    }).catch((err) => {
        console.log(err);
    })
    loadData();
});
</script>

<style lang="scss" scoped>
::v-deep(.el-popper.is-dark) {
    max-width: 50% !important;
    color: black;
    background-color: white;
    border: 1px solid #E4E4E4;
}
::v-deep(.el-popper__arrow)::before {
    content: '';
    display: none;
    border-top-color:  1px solid transparent;
    background-color: white !important;
}

.pager {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.el-button+.el-button {
    margin-left: 12px;
    margin-right: 12px;
    color: #4D64B8;
}

a {
    color: #4D64B8;
    font-family: "Helvetica Neue";
    font-size: 12px;
}

.general-content {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

/* 下拉框样式 */
:deep(.el-select__suffix) {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    background: #F1F1F1;
    display: flex;
    justify-content: center;
    align-items: center;
}

:deep(.el-select__wrapper) {
    padding: 4px 8px;
}

.btn {
    padding: 5px 16px;
    width: 72px;
    box-sizing: border-box;
    text-align: center;
    cursor: pointer;
    color: white;
    border-radius: 4px;
    background: rgba(0, 34, 153, 0.70);
    border: 0px solid transparent;
}

.btn-disabled {
    cursor: not-allowed;
    background: white;
    color: #ccc;
}

/* 数量 */
.number-range-container {
    width: 300px;
    display: flex;
    flex-direction: column;
    height: 100%;

    .number-range {
        background-color: var(--el-bg-color) !important;
        box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
        border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
        padding: 0 2px;
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: center;
        align-items: center;
        color: var(--el-input-text-color, var(--el-text-color-regular));
        transition: var(--el-transition-box-shadow);
        transform: translate3d(0, 0, 0);
        overflow: hidden;

        .to {
            margin-top: 1px;
        }
    }

    .is-focus {
        transition: all 0.3s;
        box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
    }

    .is-disabled {
        background-color: var(--el-input-bg-color);
        color: var(--el-input-text-color, var(--el-text-color-regular));
        cursor: not-allowed;

        .to {
            height: calc(100% - 3px);
            background-color: var(--el-fill-color-light) !important;
        }
    }

    .error-message {
        color: red;
        font-size: 12px;
        margin-top: 5px;
    }

    :deep(.el-input) {
        border: none;
    }

    :deep(.el-input__wrapper) {
        margin: 0;
        padding: 0 15px;
        background-color: transparent;
        border: none !important;
        box-shadow: none !important;

        &.is-focus {
            border: none !important;
            box-shadow: none !important;
        }
    }
}
</style>