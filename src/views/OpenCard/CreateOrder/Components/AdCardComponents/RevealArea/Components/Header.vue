<template>
    <div class="ra-header">
        <span>辅助操作</span>
        <div class="action">
            <el-button type="primary">全选</el-button>
            <el-button type="danger" plain>清空</el-button>
        </div>
    </div>
</template>
<script setup>
</script>
<style scoped lang="scss">
.ra-header {
    width: 100%;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    padding: 16px;

    .header-title {
        box-shadow: 4px -6px 10px 0px rgba(0, 0, 0, 0.1);
        width: 270px;
        height: 100%;
        display: flex;
        align-items: center;
        padding: 16px;
    }
}
</style>