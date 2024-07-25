<template>
    <x-card :title="title" :isHrmBtn="true">
        <div class="search-content">
            <x-component label="ID" :width="'15%'">
                <el-input v-model="searchForm.id" placeholder="请输入ID" />
            </x-component>
            <x-component label="姓名" :width="'15%'">
                <el-input v-model="searchForm.userName" placeholder="请输入姓名" />
            </x-component>
            <x-component label="性别" :width="'15%'">
                <el-select v-model="searchForm.gender" placeholder="请选择性别" clearable>
                    <el-option label="男" value="1" />
                    <el-option label="女" value="2" />
                </el-select>
            </x-component>
            <x-component label="职位" :width="'15%'">
                <el-input v-model="searchForm.position" placeholder="请输入职位" />
            </x-component>
        </div>
        <el-table :data="tableData" style="width: 100%" @row-dblclick="rowClick">
            <el-table-column prop="id" label="ID" />
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
        <div class="pager" v-if="totalPage">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page.sync="currentPage" :page-size="pageSize" layout="prev, pager, next" background
                :page-count="totalPage" />
        </div>
    </x-card>
    <el-dialog class="new-dialog" v-model="dialogVisible" :close-on-click-modal="false"
        :title="'个人信息-' + memberDetails.userName" width="870">
        <x-card title="基础信息" style="padding: 0; box-shadow: none;" :headerStyle="{ 'margin-bottom': '12px' }"
            :titleStyle="{ 'font-size': '18px' }">
            <div class="deInfo">
                <x-component label="ID" :width="'15%'">{{ memberDetails.id }}</x-component>
                <x-component label="姓名" :width="'15%'">{{ memberDetails.userName }}</x-component>
                <x-component label="性别" :width="'15%'">{{ ["-", "男", "女"][memberDetails.gender] }}</x-component>
                <x-component label="别名" :width="'15%'">{{ memberDetails.alias }}</x-component>
                <x-component label="电话" :width="'15%'">{{ memberDetails.mobile }}</x-component>
                <x-component label="座机" :width="'15%'">{{ memberDetails.telephone }}</x-component>
                <x-component label="地址" :width="'15%'">{{ memberDetails.address }}</x-component>
                <x-component label="企业邮箱" :width="'15%'">{{ memberDetails.bizMail }}</x-component>
                <x-component label="头像" :width="'15%'">
                    <el-image v-if="memberDetails.avatar !== '-'" style="width: 36px; height: 36px"
                        :src="memberDetails.avatar" />
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
                <x-component label="职位" :width="'15%'">{{ memberDetails.position }}</x-component>
                <x-component label="所属部门" :width="'15%'">{{ memberDetails.mainDepartment }}</x-component>
                <x-component label="直属上级" :width="'15%'">{{ memberDetails.directLeader == null ? '-' :
                    memberDetails.directLeader }}</x-component>
            </div>
        </x-card>
    </el-dialog>
</template>

<script setup>
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import { Picture as IconPicture } from '@element-plus/icons-vue'
import HrmService from '@/services/HrmService';
import { ref, reactive, watch, onMounted } from 'vue';
import { debounce } from 'lodash';

const props = defineProps({
    title: {
        type: String,
        default: ""
    },
    titleId: {
        type: Number,
        default: 1
    }
})
const tableData = ref([])
const servicesClass = new HrmService()
const searchForm = reactive({
    id: "",
    userName: "",
    gender: "",
    position: ""
})
// 当前选中的员工数据
const presonData = ref({})
const dialogVisible = ref(false)
// 员工详细信息
const memberDetails = ref({})
const currentPage = ref(1);
const pageSize = ref(16);
const totalPage = ref(0);
// 查询参数
const queryParams = ref({})

watch(() => props.titleId, () => {
    for (const key in searchForm) {
        searchForm[key] = ''
    }
    loadData()
})
watch(searchForm, (newVal) => {
    debouncedLoadData(newVal)
})
// 防抖
const debouncedLoadData = debounce((newVal) => {
    const filteredVal = { ...newVal }
    for (const key in filteredVal) {
        if (filteredVal[key] === '' || filteredVal[key] === null) {
            delete filteredVal[key]
        }
    }
    queryParams.value = filteredVal
    loadData()
}, 1000)

onMounted(() => {
    loadData()
})

const rowClick = (row) => {
    // presonData.value = row
    dialogVisible.value = true
    servicesClass.getMembersDetail(row.userId).then(res => {
        memberDetails.value = res.data
        for (const key in memberDetails.value) {
            if (memberDetails.value[key] == null || memberDetails.value[key] == '') {
                memberDetails.value[key] = '-'
            }
        }
        console.log(memberDetails.value.avatar)
    })
}

const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
    loadData();
};

const handleCurrentChange = (newSize) => {
    currentPage.value = newSize;
    loadData();
};

const loadData = () => {
    let params = {
        "deptId": props.titleId,
        "pageSize": pageSize.value,
        "pageNum": currentPage.value
    }
    if (queryParams.value) {
        params = Object.assign(params, queryParams.value);
    }
    servicesClass.getMembersList(params).then((res) => {
        tableData.value = res.data.userList
        totalPage.value = res.data.totalPage
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
    }).catch((err) => {
        console.log(err);
    });
};
</script>

<style lang="scss" scoped>
.pager {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

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