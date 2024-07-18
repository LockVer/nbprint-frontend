<template>
    <div class="container">
        <hrm-nav v-model="departmentValue" @checkChange="handleCheckChange" ref="hrmNavRef" />
        <hrm-tabel :title="title" />
    </div>
</template>

<script setup>
import hrmNav from './ui/hrmNav.vue';
import hrmTabel from './ui/hrmTabel.vue';
import { ref, reactive,onMounted } from 'vue';

const departmentValue = reactive([
    {
        id: 1,
        label: '汇合科技责任有限公司',
        children: [
            {
                id: 4,
                label: 'Level two 1-1',
                children: [
                    {
                        id: 9,
                        label: 'Level three 1-1-1',
                    },
                    {
                        id: 10,
                        label: 'Level three 1-1-2',
                    },
                ],
            },
        ],
    },
])

const hrmNavRef = ref(null);
const title = ref('');


onMounted(() => {
    handleCheckChange(departmentValue[0])
})

const handleCheckChange = (data) => {
    console.log(data)
    title.value = data.label
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