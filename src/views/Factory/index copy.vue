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
            <x-component label="业务员">
                <el-select v-model="searchForm.businessPeople" placeholder="请选择业务员">
                    <el-option v-for="(item, index) in options.agentNames" :key="index" :label="item" :value="item" />
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
                <el-date-picker v-model="searchForm.createTime" type="daterange" start-placeholder="开始日期"
                    end-placeholder="结束日期" :default-value="[new Date(), new Date()]" />
            </x-component>
        </div>
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="chineseName" label="名字" />
            <el-table-column prop="customerName" label="客户名字" />
            <el-table-column prop="status" label="状态">
                <template #default="scope">
                    <el-tag :type="['primary', 'danger', 'warning', 'danger', 'success'][scope.row.status]">{{ ["渲染中",
                        "渲染失败", "待审核", "未通过",
                        "已通过"][scope.row.status] }}</el-tag>
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
                    <el-link type="primary" :href="scope.row.pdfOss" v-if="scope.row.status == 1"
                        @click.stop="downloadFile(scope.row)">
                        下载
                    </el-link>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="审核" width="100">
                <template #default="scope">
                    <button class="btn">审核</button>
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
import { useRoute, useRouter } from 'vue-router';
import XCard from '../../components/container/XCard.vue';
import { ElMessage } from 'element-plus';
import moment from 'moment';
import OpenCardService from '../../services/OpenCardService';
import XComponent from '../../components/container/XComponent.vue';
import searchService from '../../services/searchService';
const router = useRouter();
const tableData = ref([]);
const totalPage = ref(0);
const errorMessage = ref('');
const options = ref('');
const serviceClass = new OpenCardService();
const searchServiceClass = new searchService();
const searchForm = reactive({
    chineseName: '',
    customerName: '',
    businessPeople: '',
    smallCardSize: '',
    createTime: '',
    minTotal: null,
    maxTotal: null,
});

const currentPage = ref(1);
const pageSize = ref(5);

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
    if (newVal.createTime) {
        const formattedDates = newVal.createTime.map(date => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        });
        newVal.startTime = formattedDates[0];
        newVal.endTime = formattedDates[1];
        delete newVal.createTime;
    }
    loadData(newVal);
});

// const rowClick = (row) => {
//     // console.log(row);
//     // 跳转到详情页面
//     localStorage.setItem('auditDetails', JSON.stringify(row));
//     router.push(`/factory/detail/${row.id}`);
// }

const loadData = (data) => {
    let params = {
        "pageSize": pageSize.value,
        "pageNum": currentPage.value
    }
    if (data) {
        params = Object.assign(params, data);
    }
    serviceClass.GetList(params).then((res) => {
        tableData.value = res.data.orderList;
        totalPage.value = res.data.totalPage;
    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
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


const downloadFile = (row) => {
    console.log(row);

    serviceClass.DownloadPDF(row.orderId).then((res) => {
        console.log(res);
    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
    });
};

</script>
<style lang="scss" scoped>
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
    text-align: center;
    color: white;
    border-radius: 4px;
    background: rgba(0, 34, 153, 0.70);
    border: 0px solid transparent;
}
/* 数量 */
.number-range-container {
    width: 200px;
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