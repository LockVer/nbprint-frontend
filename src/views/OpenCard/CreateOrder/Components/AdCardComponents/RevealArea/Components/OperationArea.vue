<template>
    <div class="operation-area">
        <div class="title">
            <span>添加揭开区</span>
        </div>
        <div class="content">
            <div class="small-title">
                <span>Step1 创建揭开区</span>
            </div>
        </div>
    </div>
</template>
<script setup>
</script>
<style scoped lang="scss">
.operation-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    
    .title{
        height: 70px;
        width: 100%;
        display: flex;
        align-items: center;
        font-size: 24px;
        font-weight: bold;
        color: #333333;
        padding: 16px;
    }

    .content{
        display: flex;
        flex-direction: column;
        padding:16px;
        .small-title{
            font-size: 16px;
            font-weight: bold;
            color: #454545;
        }
    }
}
</style>