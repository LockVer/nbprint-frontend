<template>
    <x-card title="部门列表" :cardStyle="{ 'width': '310px' }">
        <div class="label">部门</div>
        <el-input v-model="filterText" placeholder="Filter keyword" style="margin-bottom: 22px;" />
        <el-tree ref="treeRef" class="filter-tree" :data="value" :props="defaultProps" highlight-current
            :filter-node-method="filterNode" @node-click="checkChangeHandler" node-key="id" />
    </x-card>
</template>

<script setup>
import XCard from '@/components/container/XCard.vue';
import { ref, watch, onMounted } from 'vue'
const addDepartment = () => {
    console.log("addDepartment")
}
const value = defineModel()

const filterText = ref('')
const treeRef = ref(null)

const emits = defineEmits(['checkChange'])



const defaultProps = {
    children: 'children',
    label: 'label',
}

watch(filterText, (val) => {
    treeRef.value.filter(val)
})


const filterNode = (value, data) => {
    if (!value) return true
    return data.label.includes(value)
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
