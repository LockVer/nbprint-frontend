<template>
    <div class="helper-action">
        <div class="main-action">
            <div class="action-item" :class="{ 'active': item.active }" @click="action(item)"
                v-for="(item, index) in actions" :key="index">
                <span class="iconfont" :class="item.icon"></span>
                <span>{{ item.text }}</span>
            </div>
        </div>
        <div class="dynamic-action">
            <el-button type="primary" plain v-for="(item, index) in filterDynamicAction" :key="index"
                @click="item.onClick">
                <span class="iconfont" :style="{ transform: 'rotate(' + (item.rotate || 0) + 'deg)' }"
                    :class="item.icon"></span>
                {{ item.text }}
            </el-button>
        </div>
    </div>
</template>
<script setup>
import { ref, inject, defineEmits, watch, computed } from 'vue';
import AutoArrangementUtil from '../utils/AutoArrangementUtil';
import _ from 'lodash';
const communicator = inject('communicator');
const rendererUtil = inject('rendererUtil');
const autoArrangementUtil = new AutoArrangementUtil(communicator);
const emit = defineEmits(['clickAction']);
const dynamicAction = ref([
    {
        text: '横向排列',
        type: 'horizontal',
        icon: 'icon-horizontal',
        show: false,
        onClick: () => {
            autoArrangementUtil.arrangeShapes();
        }
    },
    {
        text: '竖向排列',
        type: 'vertical',
        icon: 'icon-vertical',
        show: false,
        onClick: () => {
            autoArrangementUtil.arrangeShapesVertically();
        }
    },
    {
        text: '顶对齐',
        type: 'alignTop',
        icon: 'icon-aligntop',
        show: false,
        onClick: () => {
            autoArrangementUtil.alignTop();
        }
    },
    {
        text: '底对齐',
        type: 'alignBottom',
        icon: 'icon-alignbottom',
        show: false,
        onClick: () => {
            autoArrangementUtil.alignBottom();
        }
    },
    {
        text: '水平居中',
        type: 'alignCenter',
        icon: 'icon-aligncenter',
        onClick: () => {
            autoArrangementUtil.alignHorizontalCenter();
        }
    },
    {
        text: '左对齐',
        type: 'alignLeft',
        icon: 'icon-alignleft',
        show: false,
        onClick: () => {
            autoArrangementUtil.alignLeft();
        }
    },
    {
        text: '右对齐',
        type: 'alignRight',
        icon: 'icon-alignright',
        show: false,
        onClick: () => {
            autoArrangementUtil.alignRight();
        }
    },
    {
        text: '垂直居中',
        type: 'alignMiddle',
        icon: 'icon-aligncenter',
        rotate: -90,
        show: false,
        onClick: () => {
            autoArrangementUtil.alignVerticalCenter();
        }
    }
])
const filterDynamicAction = computed(() => {
    return dynamicAction.value.filter(i => i.show);
})
const actions = ref([
    {
        mode: 'select',
        icon: 'icon-select',
        text: '选择',
        active: true
    },
    {
        mode: 'grid',
        icon: 'icon-wangge',
        text: '网格',
        multiple: true,
        active: false
    },
    {
        mode: 'rect',
        icon: 'icon-juxing',
        text: '添加矩形',
        active: false
    },
    {
        mode: 'circular',
        icon: 'icon-yuanxing',
        text: '添加圆形',
        active: false
    }
])

const action = (item) => {
    if (!item.multiple) {
        // Deactivate other single-select items
        actions.value.forEach((action) => {
            if (!action.multiple && action.mode !== item.mode) {
                action.active = false;
            }
        });

        // Ensure at least one single-select item is always active
        if (item.active) {
            // Check if there's another active single-select item
            const anyActive = actions.value.some(action => !action.multiple && action.active && action.mode !== item.mode);
            if (anyActive) {
                item.active = false;
            }
        } else {
            item.active = true;
        }

        // Update the current action in the communicator only for single-select items
        communicator.data.currentAction = item.active ? item.mode : null;
    } else {
        // For multiple items like 'grid', simply toggle the state
        item.active = !item.active;
    }

    // Ensure grid visibility is only updated based on the grid item itself
    if (item.mode === 'grid') {
        communicator.data.gridVisible = item.active;
        rendererUtil.drawGrid();
    }

    console.log('gridVisible:', communicator.data.gridVisible);
    rendererUtil.render();

    emit('clickAction', item);
};

watch(() => communicator.data.shapeList, (newVal, oldVal) => {
    //判断两个数组不相同
    const selectedItems = newVal.filter(i => i.selected);
    const whenSelectElementsShowItems = ['alignTop', 'alignBottom', 'alignLeft', 'alignRight', 'alignMiddle', 'alignCenter', 'horizontal', 'vertical'];
    if (selectedItems.length > 1) {
        dynamicAction.value.forEach(item => {
            if (whenSelectElementsShowItems.includes(item.type)) {
                item.show = true;
            } else {
                item.show = false;
            }
        })
    } else {
        dynamicAction.value.forEach(item => {
            if (whenSelectElementsShowItems.includes(item.type)) {
                item.show = false;
            }
        })
    }
}, { deep: true, immediate: true });

</script>
<style scoped lang="scss">
.helper-action {
    height: 70px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    box-shadow: 4px 5px 10px 0px #00000014;

    .main-action {
        display: flex;
        align-items: center;
    }

    .action-item {
        display: flex;
        align-items: center;
        margin-right: 16px;
        cursor: pointer;
        font-size: 18px;
        user-select: none;

        &.active {
            color: #409eff;
        }
    }

    .iconfont {
        font-size: 24px;
        margin-right: 6px;
    }
}
</style>