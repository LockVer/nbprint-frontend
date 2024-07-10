<template>
    <div class="title">订单详情</div>
    <x-card :cardStyle="{ 'height': 'auto' }">
        <div class="audit">
            <span class="audit-title">审核详情</span>
            <el-tag :type="['warning', 'danger', 'success'][2]">{{ ["待审核", "未通过",
                "已通过"][2] }}</el-tag>
        </div>
        <div class="exception">
            <div class="exception-title">异常项</div>
            <div class="items">
                <el-tag color="#0022991A">adasd</el-tag>
            </div>
        </div>
    </x-card>
</template>

<script setup>
import XCard from '../../../components/container/XCard.vue';
// import XComponent from '../../../components/container/XComponent.vue';
import { onMounted } from 'vue';
onMounted(() => {
    console.log(JSON.parse(localStorage.getItem('orderDetails')));
})

</script>

<style lang="scss" scoped>
.title {
    margin-bottom: 20px;
    color: rgba(0, 0, 0, 0.80);
    font-family: "Helvetica Neue";
    font-size: 24px;
    font-weight: 700;
}

.el-tag {
    padding: 4px 16px;
}

.audit {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 18px;

    .audit-title {
        color: rgba(0, 0, 0, 0.80);
        text-align: center;
        font-family: "Helvetica Neue";
        font-size: 24px;
        font-weight: 700;
    }
}

.exception {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .exception-title {
        color: var(--Grey-70, #484848);
        font-family: "Helvetica Neue";
        font-size: 12px;
        font-weight: 700;
    }
}
</style>