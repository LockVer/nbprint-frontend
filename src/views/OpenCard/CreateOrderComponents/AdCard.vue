<template>
    <x-card title="宣传卡信息">
        <x-component label="宣传卡数量" padding="0 0 18px 0">
            <el-input-number v-model="adCardQty" :min="1" :max="10" />
        </x-component>
        <div class="ad-card-list" v-for="(item, index) in componentData" :key="index">
            <x-component :label="'宣传卡' + (index + 1) + '有无揭开口'" padding="0 0 10px 0">
                <x-check-box :DataList="isOpenable" v-model="item.type" type="radio"></x-check-box>
            </x-component>
            <div class="ad-card-info">
                <div class="row">
                    <x-component label="背景图" width="220px">
                        <!-- <el-button class="xbutton" type="primary" v-if="!item.imageSelected"
                            @click="selectImage(index)">
                            上传图片
                        </el-button>
                        <el-input placeholder="请选择图片" v-model="item.imageName" readonly v-if="item.imageSelected">
                            <template #append>
                                <el-button type="primary" link @click="selectImage(index)">修改</el-button>
                            </template>
</el-input>
<input type="file" :ref="setFileInputRef(index)" @change="(event) => handleFileChange(index, event)"
    style="display: none" /> -->
                        <x-input-upload v-model:image="item.imageName"></x-input-upload>
                    </x-component>
                    <x-component label="是否有揭开区" width="220px">
                        <el-input placeholder="" disabled :model-value="item.type == 'openable' ? '是' : '否'" />
                    </x-component>
                    <x-component label="揭开区" width="220px" :hide="item.type != 'openable'">
                        <el-button class="xbutton" type="primary" :disabled="!(item.imageName)"
                            @click="addRevealArea(index)" v-if="getRevealAreaCount(index) == 0">
                            添加揭开区
                        </el-button>
                        <el-input placeholder="请添加揭开区" :value="getRevealAreaCount(index)" readonly
                            v-if="getRevealAreaCount(index) > 0" :disabled="getPrizeAreaCount(index) > 0">
                            <template #append>
                                <el-button :disabled="getPrizeAreaCount(index) > 0" type="primary" link
                                    @click="addRevealArea(index)">修改</el-button>
                            </template>
                        </el-input>
                    </x-component>
                    <x-component label="奖符" width="220px" :hide="item.type != 'openable'">
                        <el-button class="xbutton" :disabled="getRevealAreaCount(index) == 0" type="primary"
                            @click="addPrizeArea(index)" v-if="getPrizeAreaCount(index) == 0">
                            添加奖符
                        </el-button>
                        <el-input placeholder="请添加奖符区" :value="getPrizeAreaCount(index)" readonly
                            v-if="getPrizeAreaCount(index) > 0">
                            <template #append>
                                <el-button type="primary" link @click="addPrizeArea(index)">修改</el-button>
                            </template>
                        </el-input>
                    </x-component>
                </div>
                <x-component label="备注" width="100%">
                    <el-input v-model="item.comment" placeholder="" />
                </x-component>
            </div>
        </div>
        <el-dialog v-model="revealDialogVisible" :destroy-on-close="true" title="添加揭开区" :close-on-click-modal="false"
            :close-on-press-escape="false" :fullscreen="true">
            <!-- 添加揭开区的内容 -->
            <RevealAreaEditor ref="RAEditor" :pre-areas="componentData[currentEditingIndex].revealAreas"
                :background-image-url="backgroundImageUrl" />
            <template #footer>
                <el-button @click="closeRevealArea">取消</el-button>
                <el-button type="primary" @click="confirmRevealArea">确定</el-button>
            </template>
        </el-dialog>
        <el-dialog v-model="prizeDialogVisible" width="1000px" :destroy-on-close="true" title="添加奖符区"
            :close-on-click-modal="false" :close-on-press-escape="false">
            <!-- 添加奖符区域的内容 -->

            <PrizeAreaEditor ref="PAEditor" :pre-areas="componentData[currentEditingIndex].prizeAreas"
                :externalRevealAreas="componentData[currentEditingIndex].revealAreas"
                :background-image-url="backgroundImageUrl" />

            <template #footer>
                <el-button @click="closePrizeArea">取消</el-button>
                <el-button type="primary" @click="confirmPrizeArea">确定</el-button>
            </template>
        </el-dialog>
    </x-card>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick, computed } from 'vue';
import XCard from '../../../components/container/XCard.vue';
import XComponent from '../../../components/container/XComponent.vue';
import XCheckBox from '../../../components/functional/XCheckBox.vue';
import RevealAreaEditor from './AdCardComponents/RevealAreaEditor.vue';
import PrizeAreaEditor from './AdCardComponents/PrizeAreaEditor.vue';
import XInputUpload from '../../../components/functional/XInputUpload.vue';
import { ElMessage } from 'element-plus'
import _ from 'lodash';


const initData = defineModel("initData");

console.log("adcard", initData.value)

const RAEditor = ref(null);
const PAEditor = ref(null);
const adCardQty = ref(1);
const backgroundImageUrl = ref('');
const revealDialogVisible = ref(false);
const prizeDialogVisible = ref(false);
const currentEditingIndex = ref(-1);
const fileInputRefs = ref({});

const isOpenable = [
    { text: '有', value: 'openable' },
    { text: '无', value: 'non-openable' }
];
const componentData = ref([]);
const populateComponentData = () => {
    if (!initData.value) {
        return;
    }
    componentData.value = initData.value.map((item) => {
        let RAs = item.openReigion.map((region) => ({
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
        }));

        let PAs = item.openReigion.flatMap((region) =>
            region.mark
                ? region.mark.map((mark) => ({
                    x: mark.x,
                    y: mark.y,
                    width: mark.width,
                    height: mark.height,
                    range: mark.range,
                    parentArea: {
                        x: region.x,
                        y: region.y,
                        width: region.width,
                        height: region.height,
                    },
                }))
                : []
        );

        return {
            type: item.type,
            imageSelected: item.image ? true : false,
            imageName: item.image,
            imageFile: new File([], ''),
            revealAreas: RAs,
            prizeAreas: PAs,
        };
    });
    console.log('componentData', componentData.value)
};
onMounted(() => {
    populateComponentData();
});

watch(initData, (newVal, oldVal) => {
    console.log('initData', newVal,oldVal)
    if(JSON.stringify(newVal) !== JSON.stringify(oldVal)){
        populateComponentData();
    }
});

watch(adCardQty, (newVal, oldVal) => {
    const difference = newVal - oldVal;
    if (difference > 0) {
        // 如果数量增加，添加新的宣传卡
        for (let i = 0; i < difference; i++) {
            componentData.value.push({
                type: 'non-openable',
                imageSelected: false,
                imageName: '',
                imageFile: new File([], ''),
                revealAreas: [],
                prizeAreas: []
            });
        }
    } else if (difference < 0) {
        // 如果数量减少，从尾部移除宣传卡
        componentData.value.splice(newVal, Math.abs(difference));
    }
});

watch(componentData, async (newVal) => {
    //将数据还原成initData的格式

    console.log('componentData', newVal)
    let pageInitData = newVal.map((item) => {
        let openReigion = item.revealAreas.map((region) => ({
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
            direction: 'L',
            mark: item.prizeAreas
                .filter((pa) => pa.parentArea.x == region.x && pa.parentArea.y == region.y)
                .map((pa) => ({
                    range: pa.range,
                    x: pa.x,
                    y: pa.y,
                    width: pa.width,
                    height: pa.height,
                })),
        }));

        return {
            type: item.type,
            name: 'Ad Card',
            image: item.imageName,
            comment: item.comment,
            openReigion: openReigion,
        };
    });

    initData.value = pageInitData;

}, { deep: true });


const getRevealAreaCount = (index) => {
    if (!componentData.value[index] || !componentData.value[index].revealAreas) {
        return 0;
    }
    return componentData.value[index].revealAreas.length;
};

const getPrizeAreaCount = (index) => {
    if (!componentData.value[index] || !componentData.value[index].prizeAreas) {
        return 0;
    }
    return componentData.value[index].prizeAreas.length;
};





const addComponent = () => {
    for (let i = 0; i < adCardQty.value; i++) {
        componentData.value.push({
            type: 'non-openable',
            imageSelected: false,
            imageName: '',
            imageFile: new File([], ''),
            revealAreas: [],
            prizeAreas: []
        })
    }
}

const setFileInputRef = (index) => (el) => {
    if (el) {
        fileInputRefs.value[index] = el;
    }
};

const selectImage = (index) => {
    currentEditingIndex.value = index;
    console.log('selectImage', index)
    fileInputRefs.value[index].click();
}

const handleFileChange = (index, event) => {
    console.log('handleFileChange', index)
    const fileInput = event.target;
    if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (index >= 0) {
            componentData.value[index].imageSelected = true;
            componentData.value[index].imageName = file.name;
            componentData.value[index].imageFile = file;
            componentData.value[index].revealAreas = [];
            componentData.value[index].prizeAreas = [];
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('reader', reader.result)
                backgroundImageUrl.value = reader.result;
            };
            reader.readAsDataURL(file);
            // console.log(componentData.value)
        }
    }
}

const addRevealArea = (index) => {
    currentEditingIndex.value = index;
    revealDialogVisible.value = true;
    backgroundImageUrl.value = componentData.value[index].imageName;
    // const reader = new FileReader();
    // reader.onloadend = () => {
    //     backgroundImageUrl.value = '';
    //     backgroundImageUrl.value = reader.result;
    // };
    // reader.readAsDataURL(componentData.value[index].imageFile);
}

const confirmRevealArea = async () => {
    console.log("confirmRevealArea")
    let raAreas = RAEditor.value.getAreas();
    componentData.value[currentEditingIndex.value].revealAreas = raAreas;
    revealDialogVisible.value = false;
    // 这里可以添加更多逻辑来处理揭开区的内容
}
const closeRevealArea = () => {
    console.log(componentData.value[currentEditingIndex.value])
    revealDialogVisible.value = false;
}

const addPrizeArea = (index) => {
    currentEditingIndex.value = index;

    console.log(componentData.value[index])
    prizeDialogVisible.value = true;
    backgroundImageUrl.value = componentData.value[index].imageName;

    // //使用正则判断imageName是否是网络图片
    // const reg = /^http(s)?:\/\//;
    // if (reg.test(componentData.value[index].imageName)) {
    //     backgroundImageUrl.value = componentData.value[index].imageName;
    // } else {
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //         backgroundImageUrl.value = reader.result;
    //     };
    //     reader.readAsDataURL(componentData.value[index].imageFile);
    // }
}

const confirmPrizeArea = () => {
    console.log(PAEditor.value)
    let paAreas = PAEditor.value.getAreas();
    if (!paAreas) {
        return;
    }

    componentData.value[currentEditingIndex.value].prizeAreas = paAreas;
    prizeDialogVisible.value = false;
    // 这里可以添加更多逻辑来处理奖符区的内容
}

const closePrizeArea = () => {
    prizeDialogVisible.value = false;
}


</script>

<style lang="scss" scoped>
.ad-card-info {
    display: flex;
    flex-direction: column;
    margin-bottom: 18px;
}

.row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 18px;
}

.pa-editor {
    display: flex;
    justify-content: space-between;

    .pa-input {
        width: 150px;
        height: 600px;
        display: flex;
        flex-direction: column;
        border-radius: 4px;
        background: rgba($color: #000000, $alpha: .1);
        margin-left: 20px;
        padding: 10px;
    }
}
</style>
