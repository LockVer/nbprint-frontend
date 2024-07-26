<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
export default defineComponent({
    name: "XCard",
    props: {
        title: {
            type: String,
            default: ""
        },
        titleStyle: {
            type: Object,
            default: () => {
                return {}
            }
        },
        cardStyle: {
            type: Object,
            default: () => {
                return {}
            }
        },
        headerStyle: {
            type: Object,
            default: () => {
                return {}
            }
        },
        isHrmBtn: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { emit }) {
        const createOrderHandler = () => {
            emit('createOrder');
        }
        const addDepartment = () => {
            emit('addDepartment');
        }

        const addMember = () => {
            emit('addMember');
        }
        return {
            createOrderHandler,
            addDepartment,
            addMember
        }
    }
})
</script>
<template>
    <div class="card-container" :style="cardStyle">
        <div class="card-header" v-if="title" :style="headerStyle">
            <div class="card-title" :style="titleStyle">{{ title }}</div>
            <el-button color="#4d65b8" v-if="title == '订单管理'" style="border-color: #4d65b8;" @click="createOrderHandler">+
                创建订单</el-button>
            <!-- <el-button type="primary" v-if="title == '部门列表'" :text="true" @click="addDepartment">+ 新增</el-button>
            <el-button color="#4d65b8" v-if="isHrmBtn" style="border-color: #4d65b8;" @click="addMember">+
                添加成员</el-button> -->
        </div>
        <div class="card-content">
            <slot></slot>
        </div>
    </div>
</template>
<style scoped lang="scss">
.card-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    box-shadow: 0 0 40px rgba(0, 0, 0, .05);
    padding: 18px;
    background: white;
    margin-bottom: 18px;

    &:last-child {
        margin-bottom: 0;
    }

    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;

        .card-title {
            color: rgba(0, 0, 0, 0.80);
            font-size: 24px;
            font-weight: bold;
        }
    }

    .card-content {
        position: relative;
    }
}
</style>
