<template>
    <div class="pa-input" v-if="selectedGameArea">
        <!--关闭面板图标-->
        <p>游戏区名称</p>
        <el-input placeholder="请输入游戏区名称" v-model="selectedGameArea.name" @keydown="addRange" />
        <p>奖符数据</p>
        <el-tooltip class="box-item" effect="dark" content="输入数据后，按【回车】按键添加" placement="right">
            <el-input ref="inputRef" placeholder="请输入奖符数据" v-model="PAInput" @keydown="addRange" />
        </el-tooltip>
        <p>奖符数据列表(未使用)</p>
        <div class="data-list">
            <el-tag type="primary" :key="index" @close="removeRange(index)" closable
                v-for="(item, index) in selectedGameArea?.range">{{ item
                }}</el-tag>
        </div>
        <p>奖符数据列表(已使用)</p>
        <div class="data-list" :key="sindex" v-for="(sitem, sindex) in selectedGameArea.areas">
            <el-tag type="warning" :key="eindex" v-for="(eitem, eindex) in sitem.drawData">{{ eitem
                }}</el-tag>
        </div>
    </div>
</template>
<script setup>
import { ref,watch } from 'vue';

const selectedGameArea = defineModel("selectedGameArea");
const PAInput = ref('');


watch(() => selectedGameArea.value, (newVal) => {
    if (newVal) {
        PAInput.value = '';
    }
});

const addRange = (e) => {
    if (e.key === 'Enter') {
        const range = PAInput.value.trim();
        if (range) {
            if (!selectedGameArea.value.range) {
                selectedGameArea.value.range = [];
            }
            //判断是否重复
            // if (selectedGameArea.value.range.includes(range)) {
            //     //提示重复
            //     ElMessage.error('奖符数据重复！')
            //     return;
            // }
            selectedGameArea.value.range.push(range);
            PAInput.value = '';
        }
    }
};
const removeRange = (index) => {
    selectedGameArea.value.range.splice(index, 1);
};

</script>
<style lang="scss" scoped>
.pa-input {
    position: absolute;
    z-index: 111;
    width: 200px;
    min-height: 200px;
    background: white;
    padding: 10px;
    top: 10px;
    right: 10px;
    border-radius: 4px;

    p {
        text-align: left;
    }

    .icon-close {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
        position: absolute;
        top: 5px;
        right: 5px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.2);
    }

    p {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .data-list {
        display: flex;
        flex-wrap: wrap;

        .el-tag {
            margin-right: 10px;
            margin-bottom: 10px;
        }
    }

}
</style>