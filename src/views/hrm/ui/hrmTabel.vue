<template>
    <x-card :title="title" :isHrmBtn="true">
        <div class="search-content">
            <x-component label="ID" :width="'15%'">
                <el-input v-model="searchForm.id" placeholder="请输入ID" />
            </x-component>
            <x-component label="姓名" :width="'15%'">
                <el-input v-model="searchForm.name" placeholder="请输入姓名" />
            </x-component>
            <x-component label="性别" :width="'15%'">
                <el-select v-model="searchForm.sex" placeholder="请选择性别">
                    <el-option label="男" value="man" />
                    <el-option label="女" value="woman" />
                </el-select>
            </x-component>
            <x-component label="职位" :width="'15%'">
                <el-input v-model="searchForm.positions" placeholder="请输入职位" />
            </x-component>
        </div>
        <el-table :data="tableData" style="width: 100%" @row-dblclick="rowClick">
            <el-table-column prop="userId" label="ID" />
            <el-table-column prop="userName" label="姓名" />
            <el-table-column prop="gender" label="性别">
                <template #default="scope">
                    <div>{{ ["-", "男", "女"][scope.row.gender] }}</div>
                </template>
            </el-table-column>
            <el-table-column prop="position" label="职位" />
            <el-table-column prop="mobile" label="电话" />
            <el-table-column fixed="right" label="操作">
                <template #default="scope">
                    <el-button disabled link>编辑</el-button>
                    <el-button disabled link>删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </x-card>
    <el-dialog class="new-dialog" v-model="dialogVisible" :close-on-click-modal="false"
        :title="'个人信息-' + presonData.userName" width="870">
        <x-card title="基础信息" style="padding: 0; box-shadow: none;" :headerStyle="{ 'margin-bottom': '12px' }"
            :titleStyle="{ 'font-size': '18px' }">
            <div class="deInfo">
                <x-component label="ID" :width="'15%'">{{ presonData.userId }}</x-component>
                <x-component label="姓名" :width="'15%'">{{ presonData.userName }}</x-component>
                <x-component label="性别" :width="'15%'">{{ ["-", "男", "女"][presonData.gender] }}</x-component>
                <x-component label="别名" :width="'15%'">{{ presonData.alias }}</x-component>
                <x-component label="电话" :width="'15%'">{{ presonData.mobile }}</x-component>
                <x-component label="座机" :width="'15%'">{{ presonData.telephone }}</x-component>
                <x-component label="地址" :width="'15%'">{{ presonData.address }}</x-component>
                <x-component label="企业邮箱" :width="'15%'">{{ presonData.bizMail }}</x-component>
                <x-component label="头像" :width="'15%'">
                    <el-image v-if="presonData.avatar !== '-'" style="width: 36px; height: 36px"
                        :src="presonData.avatar" />
                    <el-image v-else>
                        <template #error>
                            <div class="image-slot">
                                <el-icon><icon-picture /></el-icon>
                            </div>
                        </template>
                    </el-image>
                </x-component>
            </div>
        </x-card>
        <x-card title="职务信息" style="padding: 0; box-shadow: none;" :headerStyle="{ 'margin-bottom': '12px' }"
            :titleStyle="{ 'font-size': '18px' }">
            <div class="deInfo">
                <x-component label="职位" :width="'15%'">{{ presonData.position }}</x-component>
                <x-component label="所属部门" :width="'15%'">{{ presonData.mainDepartment }}</x-component>
                <x-component label="直属上级" :width="'15%'">{{ presonData.directLeader }}</x-component>
            </div>
        </x-card>
    </el-dialog>
</template>

<script setup>
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import { Picture as IconPicture } from '@element-plus/icons-vue'
import HrmService from '@/services/HrmService';
import { ref, reactive, onMounted,watch } from 'vue'

const props = defineProps({
    title: {
        type: String,
        default: ""
    }
})
const tableData = ref([])
const servicesClass = new HrmService()
const searchForm = reactive({
    id: "",
    name: "",
    sex: "",
    positions: ""
})
const presonData = ref({})
const dialogVisible = ref(false)

watch(() => props.title, () => {
    console.log(props.title)
    servicesClass.getMembersList().then(res => {
        tableData.value = res.data
        tableData.value.forEach(element => {
            for (const key in element) {
                if (element[key] == null || element[key] == '') {
                    element[key] = '-'
                }
            }
            if (element.gender == '-') {
                element.gender = 0
            }
        });
    }).catch(err => {
        console.log(err)
    })
})

onMounted(() => {
    // servicesClass.getMembersList().then(res => {
    //     tableData.value = res.data
    //     tableData.value.forEach(element => {
    //         for (const key in element) {
    //             if (element[key] == null || element[key] == '') {
    //                 element[key] = '-'
    //             }
    //         }
    //         if (element.gender == '-') {
    //             element.gender = 0
    //         }
    //     });
    // }).catch(err => {
    //     console.log(err)
    // })
})

const rowClick = (row) => {
    presonData.value = row
    dialogVisible.value = true
}
</script>

<style lang="scss" scoped>
.search-content {
    display: flex;
    column-gap: 40px;
    margin-bottom: 20px;

    :deep(.el-select__suffix) {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        background: #F1F1F1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    :deep(.el-select__wrapper) {
        padding: 4px 8px;
    }
}

.deInfo {
    display: flex;
    flex-wrap: wrap;
    column-gap: 40px;
    row-gap: 12px;

    .x-component {
        width: 20%;
    }
}

.el-image {
    padding: 0 5px;
    max-width: 36px;
    max-height: 36px;
    width: 100%;
    height: 100%;
}

.image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 11px;
}
</style>

<style lang="scss">
.new-dialog .el-dialog__header {
    color: rgba(0, 0, 0, 0.80);
    font-family: "Helvetica Neue";
    font-size: 24px;
    font-weight: 700;
    padding-bottom: 16px;
    border-bottom: 1px solid #E4E4E4;
    margin-bottom: 16px;

}
</style>