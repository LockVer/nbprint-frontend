<template>
    <div class="x-image-upload" @dragover.prevent @drop="handleDrop" @click="$refs.fileInput.click()">
        <input type="file" @change="handleClickUpload" style="display: none;" ref="fileInput">
        <div class="no-image" v-if="!internalValue">
            <span class="iconfont icon-upload"></span>
            <span>拖入图片或点击上传</span>
        </div>
        <div class="image-preview" v-else>
            <div class="image-item">
                <img :src="internalValue" v-if="internalValue" alt="uploaded image"
                    @click.stop="openModal(internalValue)">
                <!-- <button @click.stop="removeImage">×</button> -->
            </div>
        </div>
    </div>
    <div v-if="showModal" class="modal">
        <span class="close" @click="closeModal">&times;</span>
        <img class="modal-content" :src="modalImage">
    </div>
</template>
<script setup>
import { ref, watch, inject } from 'vue';

import { ElMessage } from 'element-plus';

// 注入 CommonService 实例
const commonClass = inject('commonClass');
// console.log(commonClass.value);
const internalValue = defineModel();

const showModal = ref(false);
const modalImage = ref('');

const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        handleFiles(files);
    }
};

const handleFiles = (files) => {
    if (files.length > 0) {
        const file = files[0];
        commonClass.uploadImages(file,commonClass.value.orderId).then((res) => {
            internalValue.value = res.data;
        }).catch((err) => {
            console.log(err);
            ElMessage.error(err);
        });
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target && e.target.result) {
                internalValue.value = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
};

const handleClickUpload = (event) => {
    const input = event.target;
    if (input.files && input.files.length > 0) {
        handleFiles(input.files);
    }
};

const removeImage = () => {
    internalValue.value = '';
};

const openModal = (image) => {
    modalImage.value = image;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    modalImage.value = '';
};

</script>
<style lang="scss" scoped>
@import "../../styles/variables.scss";

.x-image-upload {
    width: 100%;
    height: 100px;
    border: 1px dashed #909090;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    cursor: pointer;

    .no-image {
        color: #909090;
        font-size: 16px;
        display: flex;
        align-items: center;

        .iconfont {
            font-size: 28px;
        }
    }

    &:hover {
        border-color: $primary-color-light;
        color: $primary-color-light;

        .no-image {
            color: $primary-color-light;
        }
    }

    .image-preview {
        display: flex;
        flex-wrap: wrap;

        .image-item {
            margin: 5px;
            position: relative;

            img {
                max-width: 90px;
                max-height: 90px;
                border: 1px solid #ccc;
                cursor: pointer;
                display: block;
            }

            button {
                position: absolute;
                top: 5px;
                right: 5px;
                background-color: red;
                color: white;
                border: none;
                cursor: pointer;
            }
        }
    }
}

.modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);

    .modal-content {
        max-width: 90%;
        max-height: 90%;
    }

    .close {
        position: absolute;
        top: 10px;
        right: 20px;
        color: white;
        font-size: 30px;
        cursor: pointer;
    }
}
</style>
