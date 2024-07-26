<template>
    <div class="x-input-upload">
        <el-button class="xbutton" :disabled="disabled" type="primary" v-if="!image" @click="selectImage">
            上传图片
        </el-button>
        <el-input placeholder="请选择图片" v-model="image" readonly v-if="image">
            <template #append>
                <el-button :disabled="disabled" type="primary" link @click="selectImage">修改</el-button>
            </template>
        </el-input>
        <input :disabled="disabled" type="file" ref="inputRef" @change="(event) => handleFileChange(event)" style="display: none" />
    </div>
</template>
<script setup>
import { ref, watch, inject, reactive,defineProps} from 'vue';

import { ElMessage } from 'element-plus';

const props = defineProps({
    disabled: {
        type: Boolean,
        default: false
    }
});
console.log(props.disabled);
watch(() => props.disabled, (val) => {
    console.log(val);
});
const emit = defineEmits(['changeImage']);
const image = defineModel("image");
const imageSize = defineModel("size");
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
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    imageSize.value = {
                        width: img.width,
                        height: img.height
                    };
                    console.log(imageSize);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
        commonClass.uploadImages(file).then((res) => {
            componentData.imageSelected = true;
            componentData.imageName = res.data;
            image.value = res.data;
            emit('changeImage');
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