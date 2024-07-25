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
import { ref, watch } from 'vue'
// 部门列表数据
const value = defineModel()
// 搜索框数据
const filterText = ref('')
const treeRef = ref(null)
// 定义 emits，用于发出事件
const emits = defineEmits(['checkChange'])


// 树形结构组件的属性配置
const defaultProps = {
    children: 'children', // 子节点的属性名
    label: 'deptName', // 显示文本的属性名
}
// 监控 filterText 变量的变化，过滤树形节点
watch(filterText, (val) => {
    treeRef.value.filter(val)
})
// 过滤节点的方法
const filterNode = (value, data) => {
    console.log(value, data)
    // 如果没有过滤值，显示所有节点
    if (!value) return true
    // 根据节点的 deptName 进行匹配，返回是否包含过滤值
    return data.deptName.includes(value)
}
// 点击事件处理方法
const checkChangeHandler = (data, checked) => {
    emits('checkChange', data, checked)

}
// 暴露 treeRef，用于外部访问树组件实例
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
