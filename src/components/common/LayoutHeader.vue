<script lang="ts">
import { defineComponent, ref, reactive,onMounted } from 'vue';
import { ElMessage } from 'element-plus';
export default defineComponent({
    name: "LayoutHeader",
    setup() {
        const headerData = reactive({
            title: "揭开卡",
            actions: [
                {
                    text: "综观",
                    isActive: false
                },
                {
                    text: "工序",
                    isActive: true
                },
                {
                    text: "创建订单",
                    isActive: false
                },
                {
                    text: "印前工具",
                    isActive: false
                }
            ]
        });
        const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') as string))
        onMounted(() => {
            JSON.parse(localStorage.getItem('userInfo') as string)
        })

        const handleClick = (index: number) => {
            headerData.actions.forEach((action, i) => {
                action.isActive = i === index;
            });
        }
        const goOutHandler = () => {
            ElMessage({
                type: 'success',
                message: '退出成功',
            });
            localStorage.clear(),
            window.location.reload();
        }
        return {
            headerData,
            handleClick,
            goOutHandler,
            userInfo
        }

    }
})
</script>
<template>
    <div class="layout-header">
        <div class="nav-menu">
            <span class="iconfont icon-all-fill1 expand"></span>
            <span class="title">{{ headerData.title }}</span>
            <div class="actions">
                <span class="act" @click="handleClick(index)" :class="{ 'active': action.isActive }"
                    v-for="(action, index) in headerData.actions" :key="index">{{ action.text }}</span>
            </div>
        </div>
        <el-dropdown>
            <span class="user-info">
                <span class="user-name">{{ userInfo.userName }}</span>
                <el-avatar shape="square" :size="45" fit="fill"
                    src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" />
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="console.log(111)">帮助文档</el-dropdown-item>
                    <el-dropdown-item @click="console.log(222)">意见反馈</el-dropdown-item>
                    <el-dropdown-item>个人设置</el-dropdown-item>
                    <el-dropdown-item @click="goOutHandler">退出</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>
<style scoped lang="scss">
.layout-header {
    width: 100%;
    height: 74px;
    padding: 10px 30px;
    background-color: var(--el-color-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;

    :focus-visible {
        outline: none !important;
    }

    .nav-menu {
        display: flex;
        align-items: center;
    }

    .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;

        .user-name {
            font-size: 18px;
            color: #fff;
            margin-right: 10px;
        }

        &:hover {
            .user-name {
                color: #ccc;
            }
        }
    }

    .expand {
        font-size: 36px;
        color: #fff;
        cursor: pointer;

        &:hover {
            color: #ccc;
        }
    }

    .title {
        font-size: 24px;
        color: #fff;
        margin-left: 10px;
    }

    .actions {
        margin-left: 20px;

        .act {
            font-size: 16px;
            color: #fff;
            margin-left: 10px;
            cursor: pointer;

            &:hover {
                color: #ccc;
            }

            &.active {
                font-weight: bold;
            }
        }
    }
}
</style>