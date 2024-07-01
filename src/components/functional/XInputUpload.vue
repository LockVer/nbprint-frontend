<template>
    <div class="x-input-upload">
        <el-button class="xbutton" type="primary" v-if="!image" @click="selectImage">
            上传图片
        </el-button>
        <el-input placeholder="请选择图片" v-model="image" readonly v-if="image">
            <template #append>
                <el-button type="primary" link @click="selectImage">修改</el-button>
            </template>
        </el-input>
        <input type="file" ref="inputRef" @change="(event) => handleFileChange(event)" style="display: none" />
    </div>
</template>
<script setup>
import { ref, watch, inject } from 'vue';

import { ElMessage } from 'element-plus';


const image = defineModel("image");
// 注入 commonClass 实例
const commonClass = inject('commonClass');
console.log(image.value);

const inputRef = ref(null);
const componentData = ref({
    imageSelected: false,
    imageName: ''
})
const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        const file = files[0];

        commonClass.uploadImages(file).then((res) => {
            componentData.imageSelected = true;
            componentData.imageName = res.data;
            image.value = res.data;
            console.log(image.value);
        }).catch((err) => {
            console.log(err);
            ElMessage.error(err);
        });
    }
};
const selectImage = () => {
    inputRef.value.click();
};


</script>