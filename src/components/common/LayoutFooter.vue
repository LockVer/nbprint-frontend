<template>
    <el-affix position="bottom" :offset="0">
        <div class="x-footer">
            <el-button v-if="isBack" @click="handleBack" style="width: 200px; border-color: rgba(0, 34, 153, 0.70); color: #029;">返回</el-button>
            <el-button color="#4d65b8" @click="handleSubmit" style="width: 200px;">提交</el-button>
        </div>
    </el-affix>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
export default defineComponent({
    name: 'LayoutFooter',
    components: {
    },
    setup(props,{ emit }:any) {
        const isBack = ref(false);
        const route = useRoute();
        if(route.path.includes('/factory/detail')) {
            isBack.value = true;
        }
        const handleBack = () => {
            emit('back');
        }
        const handleSubmit = () => {
            emit('submit');
        };
        return {
            handleSubmit,
            handleBack,
            isBack
        };
        
    }
});
</script>
<style lang="scss" scoped>
.x-footer {
    position: fixed;
    bottom: 0;
    right: 0;
    width: calc(100% - 280px);
    height: 90px;
    display: flex;
    background: white;
    align-items: center;
    justify-content: center;
    /* border-radius: 12px; */
    box-shadow:
        0px 0px 1.3px rgba(0, 0, 0, 0.035),
        /* 0px 0px 10px rgba(0, 0, 0, 0.07); */
}
</style>