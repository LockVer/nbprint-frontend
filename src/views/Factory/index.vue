<template>
    <x-card title="工厂审核">
        <div class="general-content">
            <x-component label="名称">
                <el-input v-model="searchForm.name" placeholder="请输入名称" />
            </x-component>
            <x-component label="客户">
                <el-select v-model="searchForm.client" placeholder="请选择客户">
                    <el-option label="Zone one" value="shanghai" />
                    <el-option label="Zone two" value="beijing" />
                </el-select>
            </x-component>
            <x-component label="业务员">
                <el-select v-model="searchForm.salesman" placeholder="请选择业务员">
                    <el-option label="Zone one" value="shanghai" />
                    <el-option label="Zone two" value="beijing" />
                </el-select>
            </x-component>
            <x-component label="尺寸">
                <el-select v-model="searchForm.size" placeholder="请选择尺寸">
                    <el-option label="Zone one" value="shanghai" />
                    <el-option label="Zone two" value="beijing" />
                </el-select>
            </x-component>
            <x-component label="数量">
                <el-select v-model="searchForm.number" placeholder="请选择数量">
                    <el-option label="Zone one" value="shanghai" />
                    <el-option label="Zone two" value="beijing" />
                </el-select>
            </x-component>
            <x-component label="创建时间">
                <el-date-picker v-model="searchForm.time" type="daterange" start-placeholder="开始日期"
                    end-placeholder="结束日期" :default-value="[new Date(2010, 9, 1), new Date(2010, 10, 1)]" />
            </x-component>
        </div>
        <el-table :data="tableData" style="width: 100%" @row-click="rowClick">
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

const route = useRoute();
const router = useRouter();
const tableData = ref([]);
const totalPage = ref(0);
const serviceClass = new OpenCardService();
const searchForm = reactive({
    name: '',
    client: '',
    salesman: '',
    size: '',
    number: '',
    time: ''
});

const currentPage = ref(1);
const pageSize = ref(5);

watch(searchForm, (newVal) => {
    console.log('搜索条件变化:', newVal);
}, { deep: true });

const rowClick = (row) => {
    // console.log(row);
    // 跳转到详情页面
    localStorage.setItem('auditDetails', JSON.stringify(row));
    router.push(`/factory/detail/${row.id}`);
}

const loadData = () => {
    serviceClass.GetList({
        "pageSize": pageSize.value,
        "pageNum": currentPage.value
    }).then((res) => {
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
    loadData();
});

const editOrder = (row) => {
    console.log(row);
    localStorage.setItem('editOrder', JSON.stringify(row));
    router.push('/opencard/createorder');
};

const deleteOrder = (row) => {
    serviceClass.DeleteOrder(row.id).then((res) => {
        ElMessage.success('删除成功');
        loadData();
    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
    });
};

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
</style>