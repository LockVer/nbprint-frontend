<template>
    <div class="x-input-upload">
        <el-button class="xbutton" :link="link" :plain="plain" :disabled="disabled" type="primary" v-if="!image"
            @click="selectImage">
            {{ uploadType === 'image' ? '上传图片' : '上传文件' }}
        </el-button>
        <el-input placeholder="请选择文件" v-model="image" readonly v-if="image">
            <template #append>
                <el-button :disabled="disabled" type="primary" link @click="selectImage">修改</el-button>
            </template>
        </el-input>
        <input :disabled="disabled" type="file" ref="inputRef" @change="(event) => handleFileChange(event)"
            style="display: none" />
    </div>
</template>
<script setup>
import { ref, watch, inject, reactive } from 'vue';

import { ElMessage } from 'element-plus';

const props = defineProps({
    disabled: {
        type: Boolean,
        default: false
    },
    uploadType: {
        type: String,
        default: 'image'
    },
    autoUpload: {
        type: Boolean,
        default: true
    },
    link: {
        type: Boolean,
        default: false
    },
    plain: {
        type: Boolean,
        default: false
    }
});
watch(() => props.disabled, (val) => {
    console.log(val);
});
const emit = defineEmits(['changeImage', 'changeFile']);
const uploadfile = defineModel("file");
const image = defineModel("image");
const imageSize = defineModel("size");
// 注入 commonClass 实例
const commonClass = inject('commonClass');
// console.log('commonClass.value',localStorage.getItem('orderId'));
// console.log(image.value);

const inputRef = ref(null);
const componentData = ref({
    imageSelected: false,
    imageName: ''
})
const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        const file = files[0];
        if (props.autoUpload) {
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
                emit('changeImage', res.data);
            }).catch((err) => {
                console.log(err);
                ElMessage.error(err);
            });
        } else {
            uploadfile.value = file;
            image.value = file.name;
            componentData.imageSelected = true;
            componentData.imageName = file.name;

            console.log('file:', uploadfile);
            emit('changeFile', uploadfile);
        }

    }

};
const selectImage = () => {
    inputRef.value.click();
};

watch(uploadfile, (val) => {
    console.log('uploadfile:', val);
    if(!val){
        image.value = '';
        componentData.imageSelected = false;
        componentData.imageName = '';
    }
});

</script>