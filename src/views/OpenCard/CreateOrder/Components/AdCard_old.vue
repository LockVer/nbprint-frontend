<template>
    <x-card title="宣传卡信息">
        <div class="ad-card-header">
            <x-component label="宣传卡数量" padding="0 0 18px 0">
                <el-input-number v-model="adCardQty" :min="1" :max="10" />
            </x-component>

        </div>
        <div class="ad-card-list" v-for="(item, index) in componentData" :key="index">
            <x-component :label="'宣传卡' + (index + 1) + '有无揭开口'" padding="0 0 10px 0">
                <x-check-box :DataList="isOpenable" v-model="item.type" type="radio"></x-check-box>
            </x-component>
            <x-component v-if="item.type == 'openable'" label="揭开口方向" padding="0 0 10px 0">
                <x-check-box v-model="item.openDirection" :DataList="openDirectionList" type="radio"></x-check-box>
            </x-component>
            <x-component label="盒号位置">
                <x-check-box :DataList="adCardNoPostionList" v-model="item.adBoxCodePosition"
                    type="radio"></x-check-box>
            </x-component>
            <div class="ad-card-info">
                <div class="row">
                    <x-component label="宣传卡盒号" width="220px">
                        <el-input v-model="item.adBoxCode" placeholder="请输入宣传卡盒号" />
                    </x-component>

                    <x-component label="背景图" width="220px">
                        <x-input-upload :disabled="getRevealAreaCount(index) > 0" v-model:size="item.imageSize"
                            v-model:image="item.imageName" @changeImage="changeImage(item)"></x-input-upload>
                    </x-component>
                    <x-component label="宣传卡尺寸(mm)" width="220px">
                        <el-input :value="item.adCardSize" disabled></el-input>
                    </x-component>
                    <x-component label="揭开区" width="220px" :hide="item.type != 'openable'"
                        v-if="item.type == 'openable'">
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
                    <x-component label="备注" width="220px">
                        <el-input v-model="item.comment" placeholder="" />
                    </x-component>
                    <!-- <x-component label="奖符" width="220px" :hide="item.type != 'openable'">
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
                    </x-component> -->
                </div>

            </div>
        </div>
        <el-dialog v-model="revealDialogVisible" :destroy-on-close="true" title="添加揭开区" :close-on-click-modal="false"
            :close-on-press-escape="false" :fullscreen="true">
            <!-- 添加揭开区的内容 -->
            <RevealAreaEditor ref="RAEditor" :ad-card-size="adCardSize"
                :pre-areas="componentData[currentEditingIndex].revealAreas" :background-image-url="backgroundImageUrl"
                :image-size="backgroundImageSize" />
            <template #footer>
                <el-button @click="closeRevealArea">取消</el-button>
                <el-button type="primary" @click="confirmRevealArea">确定</el-button>
            </template>
        </el-dialog>
    </x-card>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick, computed } from 'vue';
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import XCheckBox from '@/components/functional/XCheckBox.vue';
import RevealAreaEditor from './AdCardComponents/RevealArea/Editor.vue';
import XInputUpload from '@/components/functional/XInputUpload.vue';
import { useStore } from 'vuex';
import _, { max } from 'lodash';

const store = useStore();
const initData = defineModel("initData");
const smallCard = defineModel("smallCard");

console.log("adcard", initData.value)

const RAEditor = ref(null);
const PAEditor = ref(null);
// 默认宣传卡数量
const adCardQty = ref(1);
// 背景图片 URL 和尺寸
const backgroundImageUrl = ref('');
const backgroundImageSize = ref(null);
const adCardSize = ref(null);
// 对话框显示状态
const revealDialogVisible = ref(false);
const prizeDialogVisible = ref(false);
// 当前编辑的索引
const currentEditingIndex = ref(-1);

// 选择是否有揭开口的选项
const isOpenable = [
    { text: '有', value: 'openable' },
    { text: '无', value: 'non-openable' }
];
// 盒号位置选项
const adCardNoPostionList = [
    { text: '下左', value: 'BL' },
    { text: '下中', value: 'BC' },
    { text: '下右', value: 'BR' }
];
// 方向选项
const openDirectionList = [
    { text: '上', value: 'T' },
    { text: '下', value: 'B' },
    { text: '左', value: 'L' },
    { text: '右', value: 'R' }
];
// 组件数据
const componentData = ref([]);
// 填充组件数据
const populateComponentData = () => {
    if (!initData.value) {
        return;
    }
    // 使用 initData.value 的数据来填充 componentData.value
    componentData.value = initData.value.map((item) => {
        return {
            type: item.type,
            imageSelected: item.image ? true : false,
            // 初始化 imageFile 为一个空的 File 对象
            imageFile: new File([], ''),
            imageName: item.image,
            imageSize: item.imageSize,
            // 揭开区信息
            revealAreas: item.openRegions,
            adCardSize: item.adCardSize,
            adBoxCode: item.adBoxCode,
            adBoxCodePosition: item.adBoxCodePosition || "BL",
            // 备注信息
            comment: item.comment,
            openDirection: item.openDirection || "T"
        };
    });
};
// 更改图片时的处理函数
const changeImage = (item) => {
    // smallCard.value.box 盒子大小
    // item.imageSize 图片原始尺寸
    item.adCardSize = findMaxRectBWithRatio(smallCard.value.box, item.imageSize);
}

const findMaxRectBWithRatio = (rectA, image) => {
    /**
     * 根据矩形A的尺寸、矩形B的尺寸限制和图片的原始宽高比，找出矩形B的最大可能尺寸，
     * 同时保持图片的原始比例不变。
     *
     * 参数:
     * rectA (Array): 矩形A的尺寸，格式为[width, height]。
     * sizeLimits (Array): 矩形B的最大尺寸限制，格式为[maxShortSide, maxLongSide]。
     * originalRatio (Number): 图片的原始宽高比。
     *
     * 返回:
     * Array: 矩形B的最大可能尺寸，格式为[width, height]。
     */
    if (!image || !rectA)
        return false;
    if (!image.width || !image.height) {
        return false;
    }
    if (!rectA.width || !rectA.height || !rectA.thickness) {
        return false;
    }
    const sizeLimits = [456, 310]; //刀模最大限制480x310，纸张最大限制470x325，渲染器最大限制456x320，这里取最小值
    // 将三个数放入数组
    let numbers = [rectA.width, rectA.height, rectA.thickness];

    // 对数组进行排序，从大到小
    numbers.sort(function (x, y) {
        return y - x;
    });
    rectA = [numbers[0], numbers[1]]

    // 确定短边和长边
    let shortSide, longSide;
    if (image.width > image.height) {
        shortSide = image.height;
        longSide = image.width;
    } else {
        shortSide = image.width;
        longSide = image.height;
    }

    // 计算短边/长边的比例
    const originalRatio = shortSide / longSide;
    // 确保rectA的宽度总是小于等于高度
    rectA.sort((a, b) => a - b);

    // 初始化矩形B的最大可能尺寸为尺寸限制,定义最大矩形 B 并排序（从小到大）
    let maxRectB = [...sizeLimits].sort((a, b) => a - b);

    // 调整最大矩形 B 的短边和长边，以保持原始比例
    // [456, 310];
    maxRectB[0] = Math.min(maxRectB[0], maxRectB[1] * originalRatio);
    maxRectB[1] = Math.min(maxRectB[1], maxRectB[0] / originalRatio);
     // 如果调整后的最大矩形 B 超过了矩形 A 的尺寸，则进行进一步调整
    if (maxRectB[0] > rectA[0] || maxRectB[1] > rectA[1]) {
        var tempWidth = rectA[1] * originalRatio
        if (tempWidth >= rectA[0]) {
            //长边true、以长边缩放
            var tempLength = rectA[0] / originalRatio
            maxRectB[0] = rectA[0];
            maxRectB[1] = tempLength;
        } else {
            //宽边true、以宽边缩放
            maxRectB[0] = tempWidth;
            maxRectB[1] = rectA[1];
        }
    }
    // 宣传卡尺寸向下取整
    maxRectB = maxRectB.map((size) => Math.floor(size));
    return maxRectB;
}

onMounted(() => {
    populateComponentData();

});

watch(initData, (newVal, oldVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        populateComponentData();
    }
});
watch(smallCard, (newVal, oldVal) => {
    console.log(componentData.value)
    componentData.value.forEach((item) => {
        item.adCardSize = findMaxRectBWithRatio(smallCard.value.box, item.imageSize);
    });
}, { deep: true });
watch(adCardQty, (newVal, oldVal) => {
    const difference = newVal - oldVal;
    if (difference > 0) {
        // 如果数量增加，添加新的宣传卡
        for (let i = 0; i < difference; i++) {
            componentData.value.push({
                type: 'non-openable',
                imageSelected: false,
                imageName: 0,
                imageFile: new File([], ''),
                imageSize: "",
                revealAreas: [],
                prizeAreas: [],
                adBoxCode: "",
                adBoxCodePosition: "BL",
                openDirection: "T",
                comment: ""
            });
        }
    } else if (difference < 0) {
        // 如果数量减少，从尾部移除宣传卡
        componentData.value.splice(newVal, Math.abs(difference));
    }
});

watch(componentData, async (newVal, oldVal) => {
    //将数据还原成initData的格式
    let pageInitData = newVal.map((item) => {
        return {
            type: item.type,
            name: 'Ad Card',
            adCardSize: item.adCardSize,
            image: item.imageName,
            imageSize: item.imageSize,
            comment: item.comment,
            openRegions: item.revealAreas,
            adBoxCode: item.adBoxCode,
            adBoxCodePosition: item.adBoxCodePosition,
            openDirection: item.openDirection
        };
    });

    initData.value = pageInitData;

}, { deep: true });

// 获取揭开区数量
const getRevealAreaCount = (index) => {
    if (!componentData.value[index] || !componentData.value[index].revealAreas) {
        return 0;
    }
    return componentData.value[index].revealAreas.length;
};
// 获取奖符区数量
const getPrizeAreaCount = (index) => {
    if (!componentData.value[index] || !componentData.value[index].prizeAreas) {
        return 0;
    }
    return componentData.value[index].prizeAreas.length;
};

// 添加揭开区
const addRevealArea = (index) => {
    currentEditingIndex.value = index;
    revealDialogVisible.value = true;
    backgroundImageUrl.value = componentData.value[index].imageName;
    backgroundImageSize.value = componentData.value[index].imageSize;
    adCardSize.value = componentData.value[index].adCardSize;

}

// 添加揭开区确认事件
const confirmRevealArea = async () => {
    // 获取揭开区的区域信息
    let raAreas = RAEditor.value.getAreas();
    // 如果没有揭开区
    if (raAreas.length == 0) {
        // 判断是否是清空后点击的确定
        if(!store.state.isPrizeDialogShow){
            componentData.value[currentEditingIndex.value].revealAreas = raAreas;
            revealDialogVisible.value = false;
            // 关闭后重新将isPrizeDialogShow置为false
            store.commit('SET_PRIZEdIALOGSHOW', true);
            return;
        }
        return;
    }
    // 更新当前编辑的宣传卡的揭开区域信息
    componentData.value[currentEditingIndex.value].revealAreas = raAreas;
    // 关闭揭开区对话框
    revealDialogVisible.value = false;

    // 这里可以添加更多逻辑来处理揭开区的内容
}
// 关闭揭开区对话框
const closeRevealArea = () => {
    revealDialogVisible.value = false;
}

const addPrizeArea = (index) => {
    currentEditingIndex.value = index;

    prizeDialogVisible.value = true;
    backgroundImageUrl.value = componentData.value[index].imageName;

}
// 确认添加奖符区
const confirmPrizeArea = () => {
    // 获取奖符区的区域信息
    let paAreas = PAEditor.value.getAreas();
    console.log(paAreas)
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

    .row {
        display: grid;
        margin-top: 10px;
        grid-template-columns: repeat(5, 1fr);
        grid-gap: 10px;
    }
}

.row {
    display: flex;
    justify-content: flex-start;
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

.ad-card-header {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 10px;
}
</style>
