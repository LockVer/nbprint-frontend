<template>
    <x-card title="工厂审核">
        <factory-audit-search @update:searchData="searchDataUpdatehandle" />
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="productName" label="产品名称" :show-overflow-tooltip="true">
                <template #default="scope">
                    {{ scope.row.productName }}（{{ scope.row.chineseName }}）
                </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户名字" />
            <!-- <el-table-column prop="progress" label="进度">
                <template #default="scope">
                    <div>{{ ["-----", "订单创建", "工厂审核", "业务自审",
                        "客户确认", "算法规则", "数据生成", "工厂生产", "物流运输", "尾款支付", "订单确认"][scope.row.progress ? scope.row.progress : "0"] }}</div>
                    <div>工厂审核</div>
                </template>
            </el-table-column> -->
            <el-table-column prop="checkStatus" label="状态">
                <template #default="scope">
                    <el-tag :style="{
                        'color': getTagTextColor(scope.row.checkStatus),
                        'border-color': scope.row.checkStatus == '1' ? getTagTextColor(scope.row.checkStatus) : getTagColor(scope.row.checkStatus)
                    }" :color="getTagColor(scope.row.checkStatus)" :type="getTagType(scope.row.checkStatus)">
                        {{ getStatusLabel(scope.row.checkStatus) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="userName" label="业务员" />
            <el-table-column prop="createTime" label="创建时间">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span>{{ moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')
                            }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="印前文件" width="100">
                <template #default="scope">
                    <el-link type="primary" :href="scope.row.pdfOss" @click.stop>下载</el-link>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
                <template #default="scope">
                    <button class="btn" :disabled="canAudit(scope.row.checkStatus)"
                        :class="{ 'btn-disabled': canAudit(scope.row.checkStatus) }" @click="checkOrder(scope.row)">{{
                            ["审核",
                                "审核", "已审核", "未通过"][scope.row.checkStatus] }}</button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pager" v-if="totalPage">
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
import FactoryAuditSearch from './components/FactoryAuditSearch.vue';
import searchService from '@/services/SearchService';
import factoryService from '@/services/FactoryService';


const router = useRouter();
const tableData = ref([]);
const totalPage = ref(0);
const options = ref('');
const searchServiceClass = new searchService();
const factoryServiceClass = new factoryService();
// 分页参数
const currentPage = ref(1);
const pageSize = ref(12);
// 权限
const isWatch = ref(true);
// 监听搜索表单数据的变化
const searchDataUpdatehandle = (value) => {
    for (const key in value) {
        if (value[key] === '' || value[key] === null) {
            delete value[key];
        }
    }
    loadData(value)
}
// 审核订单函数
const checkOrder = (row) => {
    factoryServiceClass.auditLock(row.checkId).then(res => {
        localStorage.setItem('orderDetails', JSON.stringify(res.data));
        router.push(`/factory/factoryaudit/detail/${row.checkId}`);
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
    factoryServiceClass.getFactoryList(params).then((res) => {
        tableData.value = res.data.orderList;
        totalPage.value = res.data.totalPage;
    }).catch((err) => {
        ElMessage.error(err);
        isWatch.value = false;
        console.log(err);
    });
};
// 处理每页大小变化
const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
    loadData();
};
// 处理当前页码变化
const handleCurrentChange = (newSize) => {
    currentPage.value = newSize;
    loadData();
};
// 组件挂载时加载初始数据
onMounted(() => {
    searchServiceClass.getOptions().then((res) => {
        options.value = res.data;
    }).catch((err) => {
        console.log(err);
    })
    loadData();
});



// 获取标签类型
const getTagType = (status) => {
    if (["3"].includes(status)) return 'danger';
    if (["0"].includes(status)) return 'info';
    return '';
};
// 获取标签颜色
const getTagColor = (status) => {
    if (["1"].includes(status)) return '#FFF7F0';
    if (["2"].includes(status)) return '#E6FAF0';
    return '';
};
// 获取标签文本颜色
const getTagTextColor = (status) => {
    if (["1"].includes(status)) return '#FF6D40';
    if (["2"].includes(status)) return '#04CB6A';
    return '';
}

// 状态标签文本
const getStatusLabel = (status) => {
    const labels = ["未获取", "待审核", "已审核", "未通过"];
    return labels[status] || '';
};
// 是否可以审核
const canAudit = (status) => {
    return ["0", "2", "3"].includes(status);
};
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
    border-top-color: 1px solid transparent;
    background-color: white !important;
}

.pager {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.el-button+.el-button {
    margin-right: 12px;
    color: #4D64B8;
}

a {
    color: #4D64B8;
    font-family: "Source Han Sans CN";
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
    /* width: 300px; */
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