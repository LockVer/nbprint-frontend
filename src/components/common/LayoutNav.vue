<script setup>
import { defineComponent, ref, reactive } from 'vue';

const navList = reactive({
    title: "工序",
    actions: [
        {
            text: "订单列表",
            id: 1,
            url: "/opencard/orderlist"
        },
        {
            text: "创建订单",
            id: 2,
            url: "/opencard/createorder"
        }
    ]
});
</script>
<template>
    <div class="layout-nav">
        <el-menu default-active="1" :router="true">
            <el-sub-menu index="1">
                <template #title>
                    <span class="iconfont icon-folder-fill t-icon"></span>
                    <span>{{ navList.title }}</span>
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
