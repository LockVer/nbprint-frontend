<template>
    <div class="container">
        <!-- 公司部门 -->
        <hrm-nav v-model="departmentValue" @checkChange="handleCheckChange" ref="hrmNavRef" />
        <!-- 人员表格 -->
        <hrm-tabel :title="title" :titleId="titleId" />
    </div>
</template>

<script setup>
import hrmNav from './ManagementCompontents/ManagementNavView.vue';
import hrmTabel from './ManagementCompontents/ManagementTableView.vue';
import { ref, onMounted } from 'vue';
import HrmService from '@/services/HrmService';

const servicesClass = new HrmService()
// 用于获取部门列表数据存储
const departmentValue = ref([])
// 获取部门实例
const hrmNavRef = ref(null);
// 用于表示选中的部门名称
const title = ref('');
const titleId = ref(1);


onMounted(() => {
    // 获取部门列表数据
    servicesClass.GetDepartmentsList().then(res => {
        departmentValue.value = res.data
        handleCheckChange(departmentValue.value[0])
    }).catch(err => {
        console.log(err)
    })
})
// 处理部门选择变化
const handleCheckChange = (data) => {
    title.value = data.deptName
    titleId.value = data.deptId
}
</script>
<style lang="scss" scoped>
.container {
    display: flex;
    height: 100%;
    width: 100%;
    gap: 20px;
}
</style>