<template>
    <el-affix position="bottom" :offset="0" style="width: 100%;">
        <div class="x-footer">
            <el-button v-if="isBack" @click="handleBack"
                style="width: 200px; border-color: rgba(0, 34, 153, 0.70); color: #029;">返回</el-button>
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
    setup(props, { emit }: any) {
        const isBack = ref(false);
        const route = useRoute();
        if (route.path.includes('/factoryaudit/detail')) {
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
    box-sizing: border-box;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* border-radius: 12px; */
    background: #FFF;
    box-shadow: 0px -4px 4px 0px rgba(0, 0, 0, 0.05);
}
</style>