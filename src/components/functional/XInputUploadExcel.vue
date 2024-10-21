<template>
  <div class="x-input-upload">
    <el-button
      class="xbutton"
      color="#4d65b8"
      :disabled="disabled"
      type="primary"
      v-if="!fileName"
      @click="selectFile"
    >
      上传 Excel 文件
    </el-button>
    <el-input placeholder="请选择 Excel 文件" v-model="fileName" readonly v-if="fileName">
      <template #append>
        <el-button class="edit-button"  link @click="selectFile">修改</el-button>
        <el-button  class="delete-button" link @click="selectFile">删除</el-button>
      </template>
    </el-input>
    <input
      :disabled="disabled"
      type="file"
      ref="inputRef"
      @change="handleFileChange"
      accept=".xls,.xlsx"
      style="display: none"
    />
  </div>
</template>

<script setup>
import { ref, watch, inject, reactive } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});
watch(
  () => props.disabled,
  (val) => {
    console.log(val);
  }
);
const emit = defineEmits(["changeFile"]);
const fileName = ref("");
const inputRef = ref(null);

// 注入 CommonService 实例
const commonClass = inject('commonClass');
console.log(commonClass.value);

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file) {
      // 处理文件上传逻辑
      uploadFile(file)
        .then((res) => {
          fileName.value = file.name;
          emit("changeFile", res.data);
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error("文件上传失败");
        });
    }
  }
};

const selectFile = () => {
  inputRef.value.click();
};

const uploadFile = async (file) => {
  // 模拟上传文件的函数
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: file.name });
    }, 1000);
  });
};
</script>

<style lang="scss">
.x-input-upload {
  .el-input {
    width: 218px;
  }
  .el-input-group__append {
    width: 100px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 10px;
    column-gap: 8px;
  }
  .edit-button {
    color: #029 !important;
    &:hover {
      color: rgba(0, 33, 153, 0.699) !important;
    }
  }
  .delete-button {
    color: #F33 !important;
    &:hover {
      color: rgba(255, 51, 51, 0.788) !important;
    }
  }
}
</style>
