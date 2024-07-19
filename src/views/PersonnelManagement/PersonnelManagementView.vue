<template>
    <div class="container">
        <hrm-nav v-model="departmentValue" @checkChange="handleCheckChange" ref="hrmNavRef" />
        <!-- <hrm-tabel :title="title" v-model="members"  /> -->
        <hrm-tabel :title="title" :titleId="titleId" />
    </div>
</template>

<script setup>
import hrmNav from './ui/hrmNav.vue';
import hrmTabel from './ui/hrmTabel.vue';
import { ref, reactive, onMounted } from 'vue';
import HrmService from '@/services/HrmService';
const servicesClass = new HrmService()

const departmentValue = ref([])
// const members = ref([])

const hrmNavRef = ref(null);
const title = ref('');
const titleId = ref(1);


onMounted(() => {
    servicesClass.getDepartmentsList().then(res => {
        departmentValue.value = res.data
        handleCheckChange(departmentValue.value[0])
    }).catch(err => {
        console.log(err)
    })
})

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