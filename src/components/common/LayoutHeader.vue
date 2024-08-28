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
                    <el-dropdown-item @click="helpDocumentHandler">帮助文档</el-dropdown-item>
                    <el-dropdown-item @click="console.log(222)" disabled>意见反馈</el-dropdown-item>
                    <el-dropdown-item disabled>个人设置</el-dropdown-item>
                    <!-- <el-dropdown-item @click="changePassword">修改密码</el-dropdown-item> -->
                    <el-dropdown-item @click="goOutHandler">退出</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
    <!-- <el-dialog v-model="dialogFormVisible" title="修改密码" width="500">
    <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon :rules="rules" label-width="auto"
      class="demo-ruleForm">
      <el-form-item label="原始密码" prop="originalPass">
        <el-input type="password" v-model="ruleForm.originalPass" placeholder="请输入原密码" />
      </el-form-item>
      <el-form-item class="newPass" label="新密码" prop="pass">
        <el-input v-model="ruleForm.pass" type="password" autocomplete="off" placeholder="请输入新密码" />
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" placeholder="请再次输入密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(ruleFormRef)">提交
        </el-button>
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
  </el-dialog> -->
</template>
<script setup>
import pdfUrl from '@/assets/揭开卡系统操作手册.pdf';
import { defineComponent, ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';
const store = useStore();
const userInfo = computed(() => store.state.userInfo);

const headerData = reactive({
    title: "揭开卡",
    actions: [
        {
            text: "工序",
            isActive: true
        }
    ]
});


const handleClick = (index) => {
    headerData.actions.forEach((action, i) => {
        action.isActive = i === index;
    });
}

const helpDocumentHandler = () => {
    window.open(pdfUrl, '_blank');
}
const changePassword = () => {
    dialogFormVisible.value = true
}
const ruleFormRef = ref()
const checkoriginalPass = (rule, value, callback) => {
    if (value === '') {
        return callback(new Error('请输入您的原密码'))
    } else {
        callback()
    }
}

const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else {
        const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!strongPasswordPattern.test(value)) {
            callback(new Error('密码必须包含大小写字母和数字，且长度至少为8位'));
        } else {
            if (ruleForm.checkPass !== '') {
                if (!ruleFormRef.value) return;
                ruleFormRef.value.validateField('checkPass');
            }
            callback();
        }
    }
}
const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== ruleForm.pass) {
        callback(new Error("两次输入密码不一致"))
    } else {
        callback()
    }
}

const ruleForm = reactive({
    originalPass: '',
    pass: '',
    checkPass: '',
})

const rules = reactive({
    pass: [{ required: true, validator: validatePass, trigger: 'blur' }],
    checkPass: [{ required: true, validator: validatePass2, trigger: 'blur' }],
    originalPass: [{ required: true, validator: checkoriginalPass, trigger: 'blur' }],
})

const submitForm = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            console.log('submit!', ruleForm)
        } else {
            console.log('error submit!', ruleForm)
        }
    })
}

const resetForm = (formEl) => {
    if (!formEl) return
    formEl.resetFields()
}
const goOutHandler = () => {
    ElMessage({
        type: 'success',
        message: '退出成功',
    });
    localStorage.clear(),
        window.location.reload();
}
</script>
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

::v-deep(.el-button) {
    padding: 8px 25px;
}

::v-deep(.el-form-item__content) {
    justify-content: center;
}

::v-deep(.el-form-item__label-wrap) {
    /* width: 90px; */
    text-align: start;
    margin-left: 0px !important;
}
</style>
<style lang="scss">
.newPass {
    .el-form-item__label-wrap {
        width: 68px !important;
        margin-right: 12px;
    }
}
</style>