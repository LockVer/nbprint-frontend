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
                <span class="user-name">{{ userInfo?.userName }}</span>
                <el-avatar shape="square" :size="45" fit="fill"
                    src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" />
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="changePassword">修改密码</el-dropdown-item>
                    <el-dropdown-item>
                        <a class="infoLink"
                            href="https://huivodata.feishu.cn/docx/EOyOdYW8zoGC2Tx1K76c60XbnYe?from=from_copylink"
                            target="_blank" rel="noopener noreferrer">帮助文档</a>
                    </el-dropdown-item>
                    <el-dropdown-item >
                        <a class="infoLink"
                            href="https://huivodata.feishu.cn/share/base/form/shrcnVDYEo0xgRzPEU72Ao5mSJf"
                            target="_blank" rel="noopener noreferrer">意见反馈</a>
                        </el-dropdown-item>
                    <el-dropdown-item @click="dialogVersionInforVisible = true">版本信息</el-dropdown-item>
                    <el-dropdown-item @click="goOutHandler">退出</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
    <el-dialog class="version-dialog" v-model="dialogPasswordVisible" title="修改密码" width="500">
        <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon :rules="rules"
            label-width="80px" class="demo-ruleForm" hide-required-asterisk="false">
            <el-form-item label="旧密码" prop="originalPass">
                <el-input type="password" v-model="ruleForm.originalPass" placeholder="请输入旧密码" />
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
    </el-dialog>
    <el-dialog class="version-dialog" v-model="dialogVersionInforVisible" title="版本信息" width="500" :show-close="false">
        <div class="info">
            <div class="title">当前版本号</div>
            <div class="value">V1.3.0</div>
        </div>
        <div class="info">
            <div class="title">更新时间</div>
            <div class="value">2024-09-16</div>
        </div>
        <div class="content">
            <div class="title">更新内容</div>
            <div class="item" v-for="(item, index) in promotionalCardInfoList" :key="index">
                <div class="item-title">· {{ item.title }}</div>
                <div class="item-content" v-for="(content, index) in item.contents" :key="index">&nbsp;&nbsp;{{ content
                    }}
                </div>
            </div>
        </div>
        <div class="button-container">
            <button class="goout" @click="dialogVersionInforVisible = false">退出</button>
        </div>
    </el-dialog>
</template>
<script setup>
import { defineComponent, ref, reactive, computed } from 'vue';
import UserService from '../../services/UserService';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';
const store = useStore();
const userService = new UserService();
const userInfo = computed(() => store.state.userInfo);
const promotionalCardInfoList = [
    {
        title: "宣传卡信息",
        contents: [
            "添加多个宣传卡时的样式；",
            "订单详情-页面底部添加了返回按钮；",
            "盒号位置添加 自定义位置"
        ]
    },
    {
        title: "小卡信息优化",
        contents: [
            "添加自定义尺寸；",
            "添加层数，每层均分"
        ]
    },
    {
        title: "payout优化",
        contents: [
            "添加直接上传客户payout文件功能"
        ]
    },
    {
        title: "添加揭开区优化",
        contents: [
            "全局操作步骤与布局优化"
        ]
    },
    {
        title: "全局优化",
        contents: [
            "提交时自动定位到报错位置，飘红"
        ]
    },
    {
        title: "个人设置优化",
        contents: [
            "添加修改密码功能；",
            "添加了版本信息功能"
        ]
    }
]

const dialogPasswordVisible = ref(false);
const dialogVersionInforVisible = ref(false);

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
const changePassword = () => {
    dialogPasswordVisible.value = true
}
const ruleFormRef = ref()
const checkoriginalPass = (rule, value, callback) => {
    if (value === '') {
        return callback(new Error('请输入您的旧密码'))
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
            userService.changePassword({
                password: ruleForm.originalPass,
                rePassword1: ruleForm.pass,
                rePassword2: ruleForm.checkPass
            }).then((res) => {
                ElMessage({
                    type: 'success',
                    message: res.msg,
                });
                localStorage.clear(); // 清除本地存储
                setInterval(() => {
                    window.location.reload();
                }, 3000)
                dialogPasswordVisible.value = false
            }).catch((err) => {
                ElMessage({
                    type: 'error',
                    message: err,
                });
            })
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

.info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    color: #484848;
    font-family: "Source Han Sans CN";
    font-size: 14px;
    font-weight: 600;

    .value {
        text-align: end;
    }
}

.content {
    display: flex;
    flex-direction: column;
    row-gap: 8px;

    .title {
        font-weight: 600;
        color: #484848;
    }

    .item {
        padding-left: 10px;
        box-sizing: border-box;
    }

    .item-title {
        color: #666;
        font-family: "Source Han Sans CN";
        font-size: 14px;
        font-weight: 600;
        line-height: 21px;
        margin-bottom: 4px;
    }

    .item-content {
        color: #999;
        font-family: "Source Han Sans CN";
        font-size: 12px;
        line-height: 18px;
    }
}

.button-container {
    display: flex;
    justify-content: center; // 水平居中
    margin-top: 20px; // 可选：增加一点顶部间距

    .goout {
        color: #029;
        text-align: center;
        font-family: "Source Han Sans CN";
        font-size: 12px;
        min-width: 100px;
        padding: 8px 20px;
        border-radius: 4px;
        border: 1px solid #029;
        background-color: #fff;
        cursor: pointer;
        &:hover {
            background-color: #f0f0f0;
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

.infoLink {
    text-decoration: none;
    color: #606266;

    &:hover {
        color: #002299;
    }
}
</style>
<style lang="scss">
.newPass {
    .el-form-item__label-wrap {
        width: 68px !important;
        margin-right: 12px;
    }
}

.version-dialog {
    .el-dialog__header{
        border-bottom: 1px solid #E4E4E4;
        margin-bottom: 18px;
    }
    .el-dialog__title {
        color: #333;
        font-family: "Source Han Sans CN";
        font-size: 24px;
        font-weight: 700;
    }
    .el-form-item__label{
        justify-content: flex-start;
    }
}
</style>