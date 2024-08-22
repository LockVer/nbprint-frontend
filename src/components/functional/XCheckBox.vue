<template>

    <div class="xradio-list">
        <div class="xradio-item" v-for="(item, index) in localDataList" :key="index"
            :style="{ width: width, height: height, margin: margin }"
            :class="{ 'checked': item.checked, 'disabled': disabled }" @click="disabled ? null : selectItem(item)">
            <span>{{ item.text }}</span>
        </div>
        <div class="disabled-mark" v-if="disabled">
            <span>{{ disabledText }}</span>
        </div>
    </div>

</template>


<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';

interface DataItem {
    text: string;
    value: any;  // Update type to accept objects
    checked: boolean;
}

export default defineComponent({
    name: "XCheckBox",
    props: {
        modelValue: {
            type: [String, Object, Number],
            default: ""
        },
        DataList: {
            type: Array as () => DataItem[],
            default: () => []
        },
        type: {
            type: String,
            default: "radio"
        },
        width: {
            type: String,
            default: "100px"
        },
        height: {
            type: String,
            default: "30px"
        },
        margin: {
            type: String,
            default: "0px 8px 8px 0px"
        },
        disabled: {
            type: Boolean,
            default: false
        },
        disabledText: {
            type: String,
            default: ""
        }
    },
    setup(props, { emit }) {
        const localDataList = ref<DataItem[]>(props.DataList);
        const selectedItems = ref<DataItem[]>([]);
        onMounted(() => {
            localDataList.value = localDataList.value.map(item => {
                return { ...item, checked: isEqual(item.value, props.modelValue) };
            });
        });

        watch(() => props.modelValue, (newVal) => {
            localDataList.value = localDataList.value.map((item) => {
                return { ...item, checked: isEqual(item.value, newVal) };
            });
        });

        const isEqual = (a: any, b: any) => {
            if (typeof a === 'object' && typeof b === 'object') {
                return JSON.stringify(a) === JSON.stringify(b);
            }
            return a === b;
        };

        const selectItem = (item: DataItem) => {
            // console.log(item);
            switch (props.type) {
                case "radio":
                    localDataList.value = localDataList.value.map((i) => {
                        if (i === item) {
                            return { ...i, checked: true };
                        } else {
                            return { ...i, checked: false };
                        }
                    });
                    emit('update:modelValue', item.value);
                    break;
                case "checkbox": {
                    item.checked = !item.checked;
                    selectedItems.value = localDataList.value.filter(i => i.checked);
                    emit('update:modelValue', selectedItems.value.map(i => i.value));
                }
                    break;
            }
        };

        return {
            localDataList,
            selectItem
        };
    }
});
</script>

<style scoped lang="scss">
@import '../../styles/variables.scss';

.xradio-list {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    position: relative;

    .xradio-item {
        display: flex;
        align-items: center;
        border-radius: var(--el-border-radius-base);
        margin-bottom: 8px;
        height: 30px;
        width: 100px;
        border: 1px solid #E4E4E4;
        margin-right: 8px;
        justify-content: center;
        font-size: 12px;
        cursor: pointer;

        &.disabled {
            cursor: not-allowed;
            color: #C0C4CC;
            border-color: #E4E4E4;
            background-color: #F5F7FA;

            &:hover {
                border-color: #E4E4E4;
                color: #C0C4CC;
            }
        }

        &.checked {
            border-color: $primary-color-light;
            color: $primary-color-light;

            &.disabled {
                color: $primary-color-light;
                border-color: $primary-color-light;
            }

            &:hover {
                border-color: $primary-color-light;
                color: $primary-color-light;
            }
        }

        &:hover {
            border-color: $primary-color-light;
            color: $primary-color-light;
        }
    }

    .disabled-mark {
        position: absolute;
        width: calc(100% - 8px);
        height: calc(100% - 8px);
        border-radius: 4px;
        background-color: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(1px);
        /* 添加这行代码实现毛玻璃效果 */
        -webkit-backdrop-filter: blur(1px);
        /* 兼容Safari浏览器 */
        z-index: 1;
        top: 0;
        left: 0;
        cursor: not-allowed;
        display: none;
        align-items: center;
        justify-content: center;

        span {
            color: white;
            font-size: 12px;
        }
    }

    &:hover {
        .disabled-mark {
            display: flex;
        }
    }
}
</style>
