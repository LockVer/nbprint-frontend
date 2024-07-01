<template>
    <x-card title="订单管理">
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="chineseName" label="名字" min-width="150" />
            <el-table-column prop="customerName" label="客户名" width="200" />

            <el-table-column prop="total" label="数量" width="120" />
            <el-table-column prop="smallCardSize" label="尺寸" width="120" />
            <el-table-column prop="businessPeople" label="业务员" width="120" />
            <el-table-column prop="createTime" label="创建时间" width="300">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span style="margin-left: 10px">{{ moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')
                            }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="PDF状态" width="120">
                <template #default="scope">
                    <el-tag :type="['primary', 'success', 'danger'][scope.row.status]">{{ ["生成中", "已完成",
                        "生成失败"][scope.row.status] }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="200">
                <template #default="scope">
                    <el-button link type="primary" size="small" v-if="false" @click="editOrder(scope.row)">
                        编辑
                    </el-button>
                    <el-button link type="danger" size="small" v-if="false"
                        @click="deleteOrder(scope.row)">删除</el-button>
                    <el-link type="primary" :href="scope.row.pdfOss" v-if="scope.row.status == 1">下载PDF</el-link>
                </template>
            </el-table-column>
        </el-table>
        <div class="pager">
            <el-pagination background layout="prev, pager, next" :total="totalPage" />
        </div>
    </x-card>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue';
import XCard from '../../components/container/XCard.vue';
import XComponent from '../../components/container/XComponent.vue';
import { ElMessage } from 'element-plus';
import moment from 'moment';
import OpenCardService from '../../services/OpenCardService';
const tableData = ref([])
const totalPage = ref(0);
const serviceClass = new OpenCardService();

const loadData = () => {
    console.log('loadData');
    serviceClass.GetList({
        "pageSize": 20,
        "pageNum": 1
    }).then((res) => {
        tableData.value = res.data.orderList;
        totalPage.value = res.data.totalPage;
    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
    });
};

onMounted(() => {
    loadData();
});

const editOrder = (row) => {
    console.log(row);
    localStorage.setItem('editOrder', JSON.stringify(row));
    $router.push('/opencard/createorder');
}

const deleteOrder = (row) => {
    console.log(row);
    serviceClass.DeleteOrder(row.id).then((res) => {
        ElMessage.success('删除成功');
        loadData();
    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
    });
}

const downloadFile = (row) => {
    console.log(row);

    serviceClass.DownloadPDF(row.orderId).then((res) => {
        console.log(res);

    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
    });
}

</script>
<style lang="scss" scoped>
.pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}
</style>