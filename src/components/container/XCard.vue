<template>
  <div class="card-container" :style="cardStyle">
    <div class="card-header" v-if="title" :style="headerStyle">
      <div class="card-title" :style="titleStyle">{{ title }}

      </div>
      <div class="card-btn">
        <el-button class="btn-refresh" v-if="isListTitle" style="border-color: #4d65b8;" @click="updateOrderStatus">
          <el-icon size="20" :class="{ spin: isSpinning }" style="vertical-align: middle" color="#4d65b8">
            <Refresh />
          </el-icon>
        </el-button>
        <el-button color="#4d65b8" v-if="title == '订单管理'" style="border-color: #4d65b8;" @click="createOrderHandler">
          + 创建订单
        </el-button>
        <slot name="header"></slot>
      </div>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { Refresh } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'XCard',
  components: {
    Refresh
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    isListTitle: {
      type: Boolean,
      default: false
    },
    titleStyle: {
      type: Object,
      default: () => ({})
    },
    cardStyle: {
      type: Object,
      default: () => ({})
    },
    headerStyle: {
      type: Object,
      default: () => ({})
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'createOrder', 'addDepartment', 'addMember', 'updateOrderStatus'],
  setup(props, { emit }) {
    const isSpinning = ref(props.modelValue);

    watch(() => props.modelValue, (newValue) => {
      isSpinning.value = newValue;
    });

    const createOrderHandler = () => {
      emit('createOrder');
    };

    const addDepartment = () => {
      emit('addDepartment');
    };

    const addMember = () => {
      emit('addMember');
    };

    const updateOrderStatus = () => {
      // isSpinning.value = true;
      emit('update:modelValue', isSpinning.value);
      emit('updateOrderStatus');
    };

    return {
      createOrderHandler,
      addDepartment,
      addMember,
      updateOrderStatus,
      isSpinning
    };
  }
});
</script>

<style scoped lang="scss">
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

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
<style lang="scss">
  .card-btn{
    .btn-refresh{
      padding: 0;
      padding: 0 6px;

    }
  }
</style>