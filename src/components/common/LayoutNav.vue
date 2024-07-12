<template>
    <div class="layout-nav">
        <el-menu :default-active="menuActive" router>
            <el-sub-menu index="1">
                <template #title>
                    <div class="nav-title">
                        <span class="iconfont icon-folder-fill t-icon"></span>
                        <span>{{ navList.title }}</span>
                    </div>
                </template>
                <el-menu-item :index="item.url" :key="item.id" v-for="item in navList.actions">
                    <div class="mitem">
                        <span>{{ item.text }}</span>
                        <span>{{ item.count }}</span>
                    </div>
                </el-menu-item>
            </el-sub-menu>
        </el-menu>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';

const navList = reactive({
    title: "工序",
    actions: [
        {
            text: "订单管理",
            id: '1',
            url: "/opencard/orderlist"
        },
        {
            text: "创建订单",
            id: '2',
            url: "/opencard/createorder"
        },
        {
            text: "工厂审核",
            id: '3',
            url: "/factory"
        }
    ]
});

const route = useRoute();
const menuActive = ref('');

// 监听路由变化，更新menuActive
watch(route, (newRoute) => {
    let path = newRoute.path.split('/')[1];
    menuActive.value = `/${path}`;
}, { immediate: true });
</script>
<style scoped lang="scss">
.layout-nav {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .1);

    .el-menu {
        border-right: none !important;

        .t-icon {
            font-size: 20px;
            margin-right: 5px;
            color: var(--el-color-primary);
        }

        .el-menu-item {
            line-height: 32px;
            height: 32px;
            color: #909090;

            .mitem {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }

            &.is-active {
                background-color: rgba(0, 34, 153, $alpha: 0.7) !important;
                color: #fff;
                border-radius: 4px;
            }

            &:hover {
                border-radius: 4px;
            }
        }
    }
}
</style>
