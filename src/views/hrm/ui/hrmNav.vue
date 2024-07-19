<template>
    <x-card title="部门列表" :cardStyle="{ 'width': '310px' }">
        <div class="label">部门</div>
        <el-input v-model="filterText" placeholder="请输入查询内容" style="margin-bottom: 22px;" />
        <el-tree ref="treeRef" class="filter-tree" :data="value" :props="defaultProps" highlight-current
            :filter-node-method="filterNode" @node-click="checkChangeHandler" node-key="id" />
    </x-card>
</template>

<script setup>
import XCard from '@/components/container/XCard.vue';
// import HrmService from '@/services/HrmService';
import { ref, watch, onMounted } from 'vue'
const value = defineModel()

const filterText = ref('')
const treeRef = ref(null)
// const servicesClass = new HrmService()

const emits = defineEmits(['checkChange'])


// onMounted(() => {
//     servicesClass.getDepartments().then(res => {
//         servicesClass.getDepartmentsList().then(res => {
//             console.log(res)
//         })
//     })
// })


const defaultProps = {
    children: 'children',
    label: 'deptName',
}

watch(filterText, (val) => {
    treeRef.value.filter(val)
})


const filterNode = (value, data) => {
    console.log(value, data)
    if (!value) return true
    return data.deptName.includes(value)
}

const checkChangeHandler = (data, checked) => {
    emits('checkChange', data, checked)

}

defineExpose({
    treeRef
})
</script>

<style lang="scss" scoped>
.label {
    color: var(--Grey-70, #484848);
    font-family: "Helvetica Neue";
    font-size: 12px;
    margin-bottom: 8px;
}

.filter-tree {
    max-width: 200px;
}
</style>
