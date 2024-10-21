<template>
    <x-card title="订单管理" @createOrder="createOrderHandler" @updateOrderStatus="updateOrderStatusHandler"
        v-model:modelValue="isSpinning" :isListTitle="true">
        <!-- 筛选条件 -->
        <order-search @update:searchData="searchDataUpdatehandle" />
        <!-- 列表数据 -->
        <el-table :data="tableData" style="width: 100%" @row-dblclick="rowClick">
            <el-table-column prop="progress" width="10" label="" :show-overflow-tooltip="true">
                <template #default="scope">
                    <div class="dot">
                        <span
                            v-if="scope.row.progress == 4 || scope.row.progress == 5 || scope.row.progress == 7 || scope.row.progress == 13"></span>
                        <i v-else></i>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="productName" label="产品名称" :show-overflow-tooltip="true">
                <template #default="scope">
                    {{ scope.row.productName }}（{{ scope.row.chineseName }}）
                </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户名字" />
            <el-table-column prop="progress" label="进度">
                <template #default="scope">
                    <div>{{ ["-----", "订单创建", "工厂审核", "业务自审",
                        "客户确认", "算法规则", "数据生成", "工厂生产", "物流运输", "尾款支付", "订单确认"][scope.row.progress] }}</div>
                </template>
            </el-table-column>
            <el-table-column prop="progressStatus" label="状态">
                <template #default="scope">
                    <el-tag :style="{
                        'color': getTagTextColor(scope.row.progressStatus),
                        'border-color': scope.row.progressStatus == '5' ? getTagTextColor(scope.row.progressStatus) : getTagColor(scope.row.progressStatus)
                    }" :type="getTagType(scope.row.progressStatus)" :color="getTagColor(scope.row.progressStatus)">
                        {{ getStatusLabel(scope.row.progressStatus) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="total" label="数量" />
            <el-table-column prop="smallCardSize" label="尺寸" />
            <el-table-column prop="userName" label="业务员" />
            <el-table-column prop="createTime" label="创建时间" width="180">
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
                        :class="{ 'btn-disable': !canDownload(scope.row.progressStatus) }"
                        :disabled="!canDownload(scope.row.progressStatus)">
                        下载
                    </el-link>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click.stop="editOrder(scope.row)"
                        :class="{ 'btn-disable': !canEditOrDelete(scope.row.progressStatus) }"
                        :disabled="!canEditOrDelete(scope.row.progressStatus)">
                        编辑
                    </el-button>
                    <el-button link type="danger" size="small" @click.stop="deleteOrder(scope.row)"
                        :class="{ 'btn-disable': !canEditOrDelete(scope.row.progressStatus) }"
                        :disabled="!canEditOrDelete(scope.row.progressStatus)">
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
import { ElMessage, ElMessageBox } from 'element-plus';
import moment from 'moment';
import OpenCardService from '@/services/OpenCardService';
import searchService from '@/services/SearchService';
import OrderSearch from './components/orderSearch.vue';
import { useStore } from 'vuex';


const router = useRouter();
const store = useStore();
const tableData = ref([]); // 表格数据
const totalPage = ref(0); // 总页数
const errorMessage = ref(''); // 错误信息
const options = ref(''); // 选择框选项数据
const openCardServiceClass = new OpenCardService();
const searchServiceClass = new searchService();
const isSpinning = ref(false); // 控制刷新图标旋转
const isUpdateClickable = ref(true); // 控制刷新按钮是否可点击
const currentPage = ref(1);
const pageSize = ref(12);
const queryParams = ref({}) // 查询参数
// 监听搜索表单数据的变化
const searchDataUpdatehandle = (value) => {
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
// 更新订单状态处理函数
const updateOrderStatusHandler = async () => {
    if (!isUpdateClickable.value) {
        isSpinning.value = false; // 立即停止旋转
        ElMessage.warning('请勿频繁点击, 5秒后再试！');
        return;
    }
    isUpdateClickable.value = false; // 设置按钮不可点击
    isSpinning.value = true; // 开始旋转
    const startTime = Date.now(); // 记录开始时间

    try {
        await loadData();
    } finally {
        const elapsedTime = Date.now() - startTime; // 计算经过的时间
        const remainingTime = 600 - elapsedTime; // 计算剩余时间
        const delay = remainingTime > 0 ? remainingTime : 0; // 确保延迟时间为正数

        // 使用 setTimeout 延迟停止旋转，确保旋转时间至少为 600 毫秒
        setTimeout(() => {
            isSpinning.value = false; // 停止旋转
        }, delay);
        // 设置按钮在 5 秒后可点击
        setTimeout(() => {
            isUpdateClickable.value = true; // 设置按钮可点击
        }, 5000);
    }
};
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
    router.push({ path: '/opencard/createorder', query: { id: row.id } });
};
// 删除订单处理函数
const deleteOrder = (row) => {
    ElMessageBox.confirm(
        '你确定要删除该订单信息吗?',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            openCardServiceClass.deleteOrder(row.id).then((res) => {
                ElMessage({
                    type: 'success',
                    message: '删除成功',
                })
                loadData();
            }).catch((err) => {
                console.log(err);
                ElMessage.error(err);
            });
        })
        .catch(() => {
            console.log('取消删除');
        })

};

// 获取标签类型
const getTagType = (status) => {
    if (["0","6"].includes(status)) return 'info';
    if (["3","12"].includes(status)) return 'danger';
    return '';
};

// 获取标签颜色
const getTagColor = (status) => {
    if (["1", "2", "8", "9", "10", "11"].includes(status)) return '#FFF9EC';
    if (["4", "5", "7", "13"].includes(status)) return '#FFF7F0';
    if (status == "14") return '#E6FAF0';
    return '';
};
// 获取标签文本颜色
const getTagTextColor = (status) => {
    if (["1", "2", "8", "9", "10", "11"].includes(status)) return '#FFC740';
    if (["4", "5", "7", "13"].includes(status)) return '#FF6D40';
    if (status == "14") return '#04CB6A';
    return '';
}

// 状态标签文本
const getStatusLabel = (status) => {
    const labels = [
        "已取消", "渲染中", "审核中", "未通过", "待审核", "待确认",
        "已取消", "待编辑", "生成中", "印刷中", "待发货", "运输中",
        "异常", "待支付", "已完成"
    ];
    return labels[status] || '';
};
// 是否可以下载
const canDownload = (status) => {
    return ["2", "3", "8", "9", "10", "11", "12", "13", "14"].includes(status);
};
// 是否可以编辑或删除
const canEditOrDelete = (status) => {
    return ["2","3","4","5","8","9","10","11","12","13","14"].includes(status);
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
    font-family: "Source Han Sans CN";
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

.dot {

    width: 6px;
    height: 23px;
    display: flex;
    align-items: center;

    span {
        background-color: #FF3130;
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }
}

.dot:hover span {
    background-color: #FF3130;
    /* 确保悬停时颜色不变 */
}
</style>