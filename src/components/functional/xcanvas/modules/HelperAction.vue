<template>
    <div class="helper-action">
        <div class="main-action">
            <div class="action-item" :class="{ 'active': item.active }" @click="action(item)"
                v-for="(item, index) in filterActions" :key="index">
                <span class="iconfont" :class="item.icon"></span>
                <span>{{ item.text }}</span>
            </div>
        </div>
        <div class="dynamic-action">
            <el-button type="primary" :plain="!item.notplain" v-for="(item, index) in filterDynamicAction" :key="index"
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
import { v4 as uuidv4 } from 'uuid';
const communicator = inject('communicator');
const autoArrangementUtil = new AutoArrangementUtil(communicator);
const emit = defineEmits(['clickAction','addDone','closePanel']); //定义事件
let gameAreaIndex = 0;

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
    },
    {
        text: '创建游戏区',
        type: 'createGameArea',
        icon: 'icon-gamearea',
        show: false,
        notplain: true,
        onClick: () => {
            const selectedItems = communicator.data.shapeList.filter(i => i.selected);
            const gameAreaId = uuidv4();
            const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
            selectedItems.forEach((item, index) => {
                item.id = gameAreaId;
                item.text = `揭开区${index + 1}`;
                item.borderColor = randomColor;
            });
            gameAreaIndex++;
            if (!communicator.data.gameList) communicator.data.gameList = [];
            communicator.data.gameList.push({
                id: gameAreaId,
                text: `游戏区${gameAreaIndex}`,
                awardInput: "",
                awardList: [],
                awardUsedList: []
            });
            //查找所有游戏区，查看是否还有揭开区，如果没有则删除游戏区
            let indicesToRemove = [];

            // 首先收集需要删除的元素的索引
            communicator.data.gameList.forEach((game, index) => {
                const shapeList = communicator.data.shapeList.filter(i => i.id == game.id);
                if (shapeList.length == 0) {
                    indicesToRemove.push(index);
                }
            });

            // 反向遍历并删除元素，这样不会影响到其他元素的索引
            for (let i = indicesToRemove.length - 1; i >= 0; i--) {
                communicator.data.gameList.splice(indicesToRemove[i], 1);
            }
            console.log('randomColor:', randomColor);

            // selectedItems.forEach((item, index) => {
            //     if (item.id) return;
            //     item.id = gameAreaId;
            //     item.text = `揭开区${index + 1}`;
            //     item.borderColor = randomColor;
            // });

            // if (newGameList.length > 0) {
            //     communicator.data.gameList.push({
            //         id: gameAreaId,
            //         text: `游戏区${communicator.data.gameList.length + 1}`
            //     });
            // }
            //communicator.data.currentGameArea = communicator.data.gameList[communicator.data.gameList.length - 1];
            //communicator.data.showOperatePanel = true;
            communicator.data.rendererUtil.render();
        }
    },
    {
        text: '操作完成',
        type: 'addDone',
        icon: 'icon-done',
        show: false,
        notplain: true,
        onClick: () => {
            emit('addDone');
        }
    },
    {
        text: '关闭窗口',
        type: 'closePanel',
        icon: 'icon-cancel',
        show: false,
        notplain: false,
        onClick: () => {
            emit('closePanel');
        }
    }
])
if (!communicator.data.showHelperActions) {
    communicator.data.showHelperActions = ['alignTop', 'alignBottom', 'alignLeft', 'alignRight', 'alignMiddle', 'alignCenter', 'horizontal', 'vertical'];
}

const filterDynamicAction = computed(() => {
    return dynamicAction.value.filter(i => i.show);
})
const actions = ref([
    {
        mode: 'grid',
        icon: 'icon-grid',
        text: '网格',
        multiple: true,
        active: false,
        show: true
    },
    {
        mode: 'rect',
        icon: 'icon-juxing',
        text: '添加矩形',
        active: false,
        show: true
    },
    {
        mode: 'circular',
        icon: 'icon-yuanxing',
        text: '添加圆形',
        active: false,
        show: true
    }
])
const filterActions = computed(() => {
    return actions.value.filter(i => i.show);
})
if (!communicator.data.showMainActions) {
    communicator.data.showMainActions = ["grid", "rect", "circular"];
}
const action = (item) => {
    // if (!item.multiple) {
    //     // Deactivate other single-select items
    //     actions.value.forEach((action) => {
    //         if (!action.multiple && action.mode !== item.mode) {
    //             action.active = false;
    //         }
    //     });

    //     // Ensure at least one single-select item is always active
    //     if (item.active) {
    //         // Check if there's another active single-select item
    //         const anyActive = actions.value.some(action => !action.multiple && action.active && action.mode !== item.mode);
    //         if (anyActive) {
    //             item.active = false;
    //         }
    //     } else {
    //         item.active = true;
    //     }

    //     // Update the current action in the communicator only for single-select items
    //     communicator.data.currentAction = item.active ? item.mode : null;
    // } else {
    //     // For multiple items like 'grid', simply toggle the state
    //     item.active = !item.active;
    // }

    // Ensure grid visibility is only updated based on the grid item itself
    if (item.mode === 'grid') {
        item.active = !item.active;
        communicator.data.gridVisible = item.active;
        communicator.data.rendererUtil.drawGrid();
    }

    console.log('gridVisible:', communicator.data.gridVisible);
    communicator.data.rendererUtil.render();

    emit('clickAction', item);
};
watch(() => communicator.data.showMainActions, (newVal, oldVal) => {
    console.log('showMainActions:', newVal);
    if (!newVal) {
        return;
    }
    actions.value.forEach(item => {
        if (newVal.includes(item.mode)) {
            item.show = true;
        } else {
            item.show = false;
        }
    })
}, { deep: true, immediate: true })

watch(() => communicator.data.shapeList, (newVal, oldVal) => {
    //判断两个数组不相同
    const selectedItems = newVal.filter(i => i.selected);
    const whenSelectElementsShowItems = communicator.data.showHelperActions;
    if (selectedItems.length > 1||communicator.data.showHelperActionsAlways) {
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

        &:active {
            color: #409eff;
        }

        &:hover {
            color: #409eff;
        }

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