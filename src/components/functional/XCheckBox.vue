<template>
    <div class="xradio-list">
        <div class="xradio-item" v-for="(item, index) in localDataList" :key="index"
            :style="{ width: width, height: height }" :class="{ 'checked': item.checked }" @click="selectItem(item)">
            <span>{{ item.text }}</span>
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
            type: [String, Object,Number],
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
        }
    },
    setup(props, { emit }) {
        const localDataList = ref<DataItem[]>(props.DataList);

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
                    let selectedItems = localDataList.value.filter(i => i.checked);
                    emit('update:modelValue', selectedItems.map(i => i.value));
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
    display: flex;
    align-items: center;
    flex-wrap: wrap;

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

        &.checked {
            border-color: $primary-color-light;
            color: $primary-color-light;
        }

        &:hover {
            border-color: $primary-color-light;
            color: $primary-color-light;
        }
    }
}
</style>
