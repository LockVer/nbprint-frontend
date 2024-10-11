<template>
    <x-card title="小卡信息">
        <x-component label="尺寸(mm)" padding="0 0 10px 0">
            <x-check-box :disabled="hasOpenRegion" disabledText="宣传卡揭开区已创建，禁止修改，如需修改，请先清空揭开区。" v-model="initData.size"
                :DataList="cardSizeList" type="radio"></x-check-box>
        </x-component>
        <x-component width="440px" label="自定义尺寸(mm)" padding="0 0 18px 0" v-if="initData.size.type == 'CUSTOM'"
            :showErrorMsg="!(initData.size.width && initData.size.height)">
            <div class="custom-size">
                <el-input-number v-model="initData.size.width" :precision="1" :step="0.1" :min="1" :controls="false" />
                <span>*</span>
                <el-input-number v-model="initData.size.height" :precision="1" :step="0.1" :min="1"
                    :controls="false" />
            </div>
        </x-component>
        <x-component label="揭开口数量" padding="0 0 10px 0">
            <x-check-box v-model="initData.openQuantity" :DataList="cardOpenList" type="radio"></x-check-box>
        </x-component>
        <x-component label="小卡单价" width="220px" padding="0 0 18px 0" :showErrorMsg="!initData.price">
            <el-input-number :step="0.1" :min="0.01" :precision="2" :controls="false" v-model="initData.price" placeholder="请输入小卡单价" />
        </x-component>
        <x-component label="刀模开口方向" padding="0 0 10px 0">
            <x-check-box v-model="initData.openDirection" :DataList="openDirectionList" type="radio"></x-check-box>
        </x-component>
        <x-component label="小卡盒号" padding="0 0 18px 0" width="220px" :showErrorMsg="!initData.smallBoxCode">
            <el-input v-model="initData.smallBoxCode" placeholder="请输入小卡盒号" />
        </x-component>
        <x-component label="小卡盒号位置" padding="0 0 10px 0">
            <x-check-box v-model="initData.smallBoxCodePosition" :DataList="boxCodePositionList"
                type="radio"></x-check-box>
        </x-component>
        <x-component label="盒数" padding="0 0 18px 0">
            <el-input-number v-model="initData.boxCount" :min="1" />
        </x-component>
        <x-component label="每盒数量" padding="0 0 18px 0">
            <el-input-number :disabled="hasOpenRegion" v-model="initData.quantityPerBox" :min="1" />
        </x-component>
        <div class="calcBox">
            <x-component label="列数" padding="0 0 18px 0" width="220px">
                <el-input-number :step="1" :disabled="hasOpenRegion" v-model="initData.columnCount" :min="1" />
            </x-component>
            <x-component label="每列数量" padding="0 0 18px 0" width="220px">
                <el-input-number :disabled="hasOpenRegion" v-model="initData.columnQuantity" :min="1" :step="1"/>
            </x-component>
        </div>
        <div class="bg-img">
            <x-component label="正面背景" width="48%" :showErrorMsg="!initData.frontImage">
                <x-image-upload v-model="initData.frontImage"></x-image-upload>
            </x-component>
            <x-component label="小卡揭开面背景" width="48%" :showErrorMsg="!initData.backImage">
                <x-image-upload v-model="initData.backImage"></x-image-upload>
            </x-component>
        </div>
        <div class="canvas-container">
            <canvas ref="boxCanvas" width="500" height="500"></canvas>
        </div>
    </x-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import XCheckBox from '@/components/functional/XCheckBox.vue';
import XImageUpload from '@/components/functional/XImageUpload.vue';
import { ElMessageBox, ElMessage } from 'element-plus';


const props = defineProps({
    hasOpenRegion: Boolean,
});


const initData = defineModel("initData");
initData.smallBoxCodePosition = initData.smallBoxCodePosition || 'BL';
const boxCanvas = ref(null);


const cardSizeList = [
    { text: '48*76', value: { width: 48, height: 76 } },
    { text: '48*96', value: { width: 48, height: 96 } },
    { text: '47.5*66', value: { width: 47.5, height: 66 } },
    { text: '50.8*88.9', value: { width: 50.8, height: 88.9 } },
    { text: '51*76', value: { width: 51, height: 76 } },
    { text: '51*51', value: { width: 51, height: 51 } },
    { text: '42*71', value: { width: 42, height: 71 } },
    { text: '44*60', value: { width: 44, height: 60 } },
    { text: '自定义尺寸', value: { width: 0, height: 0, type: "CUSTOM" } }
];

const cardOpenList = [
    { text: '1', value: 1 },
    { text: '3', value: 3 },
    { text: '5', value: 5 }
];

const openDirectionList = [
    { text: '上', value: 'T' },
    { text: '下', value: 'B' },
    { text: '左', value: 'L' },
    { text: '右', value: 'R' }
];

const boxCodePositionList = [
    { text: '下左', value: 'BL' },
    { text: '下中', value: 'BC' },
    { text: '下右', value: 'BR' },
];

const calcRowCount = () => {
    const box = {
        width: 0,
        height: 0,
        thickness: 0
    }
    // 长：宽得倍数
    const ratio = 1;
    // 最大倍数
    const maxRatio = 2;
    // 最小每列数量
    const minColumnCount = 250;
    // 最大每列数量
    const maxColumnCount = 700;
    // 最大size，刀模最大尺寸480x310，纸张最大尺寸470mmx325mm，渲染器最大尺寸456mmx320mm，所以最大尺寸为456x310
    const maxSize = { width: 456, thickness: 310 };
    //找出每盒数量的所有因数
    const divisors = findDivisors(initData.value.quantityPerBox);

    const findBox = (columnCount, level = 0) => {
        const width = initData.value.size.width;    //小卡宽度
        const height = initData.value.size.height;  //小卡高度
        const thickness = 0.67;                      //小卡厚度
        const quantityPerBox = initData.value.quantityPerBox;  //每盒数量
        columnCount = columnCount;  //列数
        //在最高条件等级时，判断每列数量是否大于500，如果大于500不计算
        if (level == 0) {
            if (quantityPerBox / columnCount > 500) return;  //每列数量大于500不计算
        }
        //限制每列数量的最小值和最大值
        if (quantityPerBox / columnCount < minColumnCount) return;
        if (quantityPerBox / columnCount > maxColumnCount) return;


        const calcBox = {
            width: width * columnCount,
            height: height,
            thickness: thickness * (quantityPerBox / columnCount) + 15//每列厚度,15为固定值（生产要求）
        }

        //计算长宽比
        const newRatio = calcBox.width / calcBox.thickness;
        //如果长宽比在ratio和maxRatio之间，并且尺寸在最大尺寸之内
        if (newRatio >= ratio && newRatio <= maxRatio) {
            box.width = Math.ceil(calcBox.width);
            box.height = Math.ceil(calcBox.height);
            box.thickness = Math.ceil(calcBox.thickness);
            initData.value.columnCount = columnCount;
            //计算每列数量，如果每列数量不是整数，向上取最接近的整数
            initData.value.columnQuantity = Math.ceil(quantityPerBox / columnCount);
            console.log('box:', initData.value.columnQuantity);
            initData.value.box = box;
        }
    }
    //首先看看是否能找到整数的每列数量
    divisors.forEach((divisor) => {
        if (box.width !== 0) return;
        findBox(divisor, 9999);    //找到整数的每列数量为最高优先级，所以其他的条件全部无效
    });
    //条件等级,0为最高，1为次高
    let level = 0;
    while (box.width == 0 && level < 2) {
        if (box.width === 0) {
            //首先计算出在多少列的情况下，长宽比最接近1，假如最小为1列，最大为1000列
            for (let columnCount = 1; columnCount <= 1000; columnCount++) {
                findBox(columnCount, level);
                if (box.width !== 0) break;
            }
        }
        level++;
    }

    //如果没有找到合适的尺寸，就取能找到的最大尺寸
    if (box.width === 0) {
        //ElMessage.error('根据当前的限制条件，无法找到合适的尺寸，请手动更改列数选择一个尺寸。');
    } else {
        ElMessage.success('已找到合适的尺寸：' + box.width + 'x' + box.height + 'x' + box.thickness + 'mm');
    }
}

//手动计算尺寸
const calcBoxSize = (columnCount, columnQuantity) => {
    const width = initData.value.size.width;    //小卡宽度
    const height = initData.value.size.height;  //小卡高度
    const thickness = 0.67;                      //小卡厚度
    if (!columnQuantity) {
        columnQuantity = Math.ceil(initData.value.quantityPerBox / columnCount);
    }
    if (!columnCount) {
        columnCount = initData.value.quantityPerBox / columnQuantity;
    }
    initData.value.columnQuantity = columnQuantity;
    initData.value.columnCount = Math.ceil(columnCount);
    const calcBox = {
        width: width * columnCount,
        height: height,
        thickness: thickness * columnQuantity + 15//每列厚度,15为固定值（生产要求）
    }
    const box = {
        width: Math.ceil(calcBox.width),
        height: Math.ceil(calcBox.height),
        thickness: Math.ceil(calcBox.thickness)
    }
    initData.value.box = box;
}
//计算最大公约数
const findDivisors = (A) => {
    const divisors = [];
    for (let B = 1; B <= A; B++) {
        if (A % B === 0) {
            divisors.push(B);
        }
    }
    return divisors;
}


// Function to draw 3D box
const draw3DBox = (box) => {
    const canvas = boxCanvas.value;
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    // Calculate the maximum scale that fits the box within the canvas
    const maxWidthScale = canvasWidth / (box.width + box.thickness);
    const maxHeightScale = canvasHeight / (box.height + box.thickness);
    const maxDepthScale = canvasHeight / (box.height + box.thickness); // Depth is considered in height for perspective

    // Use the smallest scale to ensure the box fits in both dimensions
    const scale = Math.min(maxWidthScale, maxHeightScale, maxDepthScale) * 0.8; // Leave some margin
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const w = box.width * scale;
    const h = box.height * scale;
    const d = box.thickness * scale * 0.5; //厚度

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //绘制底部
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - h / 2);
    ctx.lineTo(x + w / 2, y - h / 2);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.lineTo(x - w / 2, y + h / 2);
    ctx.closePath();
    ctx.stroke();

    // 绘制上侧面
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + d, y - h / 2 - d);
    ctx.lineTo(x + w / 2 + d, y - h / 2 - d);
    ctx.lineTo(x + w / 2 + d - h, y + h / 2 - d);
    ctx.lineTo(x - w / 2 + d, y + h / 2 - d);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制左侧面
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - h / 2);
    ctx.lineTo(x - w / 2 + d, y - h / 2 - d);
    ctx.moveTo(x - w / 2 + h, y + h / 2 - h);
    ctx.lineTo(x - w / 2 + d, y + h / 2 - d);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制右侧面

    ctx.beginPath();
    ctx.moveTo(x + w / 2, y - h / 2);
    ctx.lineTo(x + w / 2 + d, y - h / 2 - d);
    ctx.lineTo(x + w / 2 + d, y + h / 2 - d);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.closePath();
    ctx.stroke();

    //绘制尺寸
    ctx.font = '14px Arial';
    ctx.fillText(`长: ${box.width}mm`, x, y + h);
    ctx.fillText(`高: ${box.height}mm`, x + w / 2 + 10, y + h / 2);
    ctx.fillText(`宽: ${box.thickness}mm`, x - w / 2 - d, y + h / 2 - d - 10);
};

watch(() => initData.value.box, draw3DBox, { deep: true });

watch(() => initData.value.size, (newVal) => {
    calcRowCount();
});
watch(() => initData.value.quantityPerBox, (newVal) => {
    calcRowCount();
});

watch(() => initData.value.columnCount, (newVal) => {
    calcBoxSize(newVal, null);
});
watch(() => initData.value.columnQuantity, (newVal) => {
    calcBoxSize(null, newVal);
});

</script>

<style lang="scss" scoped>
.bg-img {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.calcBox {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 10px;
}

.canvas-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 30;
}

.custom-size {
    display: flex;
    align-items: center;

    span {
        margin: 0 10px;
    }
}
</style>
