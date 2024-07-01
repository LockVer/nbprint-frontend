<template>
    <el-affix position="bottom" :offset="0">
        <div class="x-footer">
            <el-button color="#4d65b8" @click="handleSubmit" style="width: 200px;">提交</el-button>
        </div>
    </el-affix>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'LayoutFooter',
    components: {
    },
    setup(props,{ emit }:any) {
        const handleSubmit = () => {
            emit('submit');
        };
        return {
            handleSubmit
        };
    }
});
</script>
<style lang="scss" scoped>
.x-footer {
    width: 100%;
    height: 90px;
    display: flex;
    background: white;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    box-shadow:
        0px 0px 1.3px rgba(0, 0, 0, 0.035),
        0px 0px 10px rgba(0, 0, 0, 0.07);
}
</style>