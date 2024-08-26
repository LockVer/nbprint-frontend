<template>
    <x-card title="订单管理" @createOrder="createOrderHandler">
        <!-- 筛选条件 -->
        <div class="general-content">
            <x-component label="产品名称">
                <el-input v-model="searchForm.productName" placeholder="请输入产品名称" />
            </x-component>
            <x-component label="客户">
                <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" />
            </x-component>
            <x-component label="尺寸">
                <el-select v-model="searchForm.smallCardSize" placeholder="请选择尺寸" clearable>
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
                <el-date-picker v-model="createTime" type="daterange" style="width: 100%;" start-placeholder="开始日期"
                    end-placeholder="结束日期" :default-value="[new Date(), new Date()]" @change="changeHandler" />
            </x-component>
        </div>
        <!-- 列表数据 -->
        <el-table :data="tableData" style="width: 100%" @row-dblclick="rowClick">
            <el-table-column prop="productName" label="产品名称" :show-overflow-tooltip="true">
                <template #default="scope">
                    {{ scope.row.productName }}（{{ scope.row.chineseName }}）
                </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户名字" />
            <el-table-column prop="status" label="状态">
                <template #default="scope">
                    <el-tag :type="['primary', 'warning', 'success', 'danger', 'danger',][scope.row.status]">{{ ["渲染中",
                        "待审核", "已通过", "未通过", "渲染失败",
                    ][scope.row.status] }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="total" label="数量" />
            <el-table-column prop="smallCardSize" label="尺寸" />
            <el-table-column prop="userName" label="业务员" />
            <el-table-column prop="createTime" label="创建时间">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span>{{ moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')
                            }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="印前文件">
                <template #default="scope">
                    <el-link type="primary" :href="scope.row.pdfOss" @click.stop style="padding: 2px;"
                        :class="{ 'btn-disable': scope.row.status == 0 || scope.row.status == 4 }"
                        :disabled="scope.row.status == 0 || scope.row.status == 4">
                        下载
                    </el-link>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click.stop="editOrder(scope.row)"
                        :class="{ 'btn-disable': scope.row.status == 0 }" :disabled="scope.row.status == 0">
                        编辑
                    </el-button>
                    <el-button link type="danger" size="small" @click.stop="deleteOrder(scope.row)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 页码 -->
        <div class="pager" v-if="totalPage">
            <el-pagination @size-change="pageSizeChangeHandler" @current-change="handleCurrentChange"
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
import OpenCardService from '@/services/OpenCardService';
import searchService from '@/services/SearchService';
import XComponent from '@/components/container/XComponent.vue';
import { useStore } from 'vuex';


const router = useRouter();
const store = useStore();
const tableData = ref([]); // 表格数据
const totalPage = ref(0); // 总页数
const errorMessage = ref(''); // 错误信息
const options = ref(''); // 选择框选项数据
const openCardServiceClass = new OpenCardService();
const searchServiceClass = new searchService();
// 搜索表单数据
const searchForm = reactive({
    chineseName: '',
    customerName: '',
    smallCardSize: '',
    minTotal: null,
    maxTotal: null,
});
const createTime = ref(null); // 创建时间范围
const startTime = ref(''); // 搜索开始时间
const endTime = ref(''); // 搜索结束时间
const currentPage = ref(1);
const pageSize = ref(12);
const queryParams = ref({}) // 查询参数
// 监听搜索表单数据的变化
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
// 日期范围变化处理
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
    queryParams.value = value
    loadData()
}
// 创建订单处理
const createOrderHandler = () => {
    router.push(`/opencard/createorder`);
}
// 双击跳转到详情页面
const rowClick = (row) => {
    localStorage.setItem('orderDetails', JSON.stringify(row));
    router.push(`/opencard/orderlist/detail/${row.id}`);
};

// 加载数据处理
const loadData = async () => {
    let params = {
        "pageSize": pageSize.value,
        "pageNum": currentPage.value
    }
    if (queryParams.value) {
        params = Object.assign(params, queryParams.value);
    }

    if (!store.state.userInfo.id) {
        await store.dispatch("getUserInfo");
    }
    params.nbUserId = store.state.userInfo.id;

    openCardServiceClass.getList(params).then((res) => {
        tableData.value = res.data.orderList;
        totalPage.value = res.data.totalPage;
    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
    });
};
// 处理每页大小变化
const pageSizeChangeHandler = (newSize) => {
    pageSize.value = newSize;
    loadData();
};
// 处理当前页码变化
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

// 编辑订单处理函数
const editOrder = (row) => {
    console.log(row);
    router.push({ path: '/opencard/createorder', query: { id: row.id } });
};
// 删除订单处理函数
const deleteOrder = (row) => {
    openCardServiceClass.deleteOrder(row.id).then((res) => {
        ElMessage.success('删除成功');
        loadData();
    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
    });
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

.el-button+.el-link {
    margin-left: 12px;
    margin-right: 12px;
}

.btn-disable {
    color: #CCC !important;
}


a {
    color: #029;
    font-family: "Helvetica Neue";
    font-size: 12px;
}

.general-content {
    width: 100%;
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
<style lang="scss">
.number-range-container {

    .el-input-number {
        width: 100%;
    }
}
</style>