<template>
    <x-card title="小卡信息">
        <x-component label="尺寸(mm)" padding="0 0 10px 0">
            <x-check-box v-model="initData.size" :DataList="cardSizeList" type="radio"></x-check-box>
        </x-component>
        <x-component label="揭开口数量" padding="0 0 10px 0">
            <x-check-box v-model="initData.openQuantity" :DataList="cardOpenList" type="radio"></x-check-box>
        </x-component>
        <x-component label="小卡单价" width="220px" padding="0 0 18px 0">
            <el-input v-model="initData.price" placeholder="请输入小卡单价" />
        </x-component>
        <x-component label="盒数" padding="0 0 18px 0">
            <el-input-number v-model="initData.boxCount" :min="1" />
        </x-component>
        <x-component label="每盒数量" padding="0 0 18px 0">
            <el-input-number v-model="initData.quantityPerBox" :min="1"/>
        </x-component>
        <div class="calcBox">
            <x-component label="列数" padding="0 0 18px 0" width="220px">
                <el-input-number v-model="initData.columnCount" :min="1" />
            </x-component>
            <x-component label="每列数量" padding="0 0 18px 0" width="220px">
                <el-input-number v-model="initData.columnQuantity" :min="1" />
            </x-component>
            <x-component label="盒子宽度(mm)" padding="0 0 18px 0" width="220px">
                <el-input v-model="initData.box.thickness" disabled/>
            </x-component>
            <x-component label="盒子高度(mm)" padding="0 0 18px 0" width="220px">
                <el-input v-model="initData.box.height" disabled/>
            </x-component>
            <x-component label="盒子长度(mm)" padding="0 0 18px 0" width="220px">
                <el-input v-model="initData.box.width" disabled/>
            </x-component>
        </div>
        <div class="bg-img">
            <x-component label="正面背景" width="48%">
                <x-image-upload v-model="initData.frontImage"></x-image-upload>
            </x-component>
            <x-component label="小卡揭开面背景" width="48%">
                <x-image-upload v-model="initData.backImage"></x-image-upload>
            </x-component>
        </div>
        <el-button type="primary" @click="calcRowCount">计算列数</el-button>
        <div class="canvas-container">
            <canvas ref="boxCanvas" width="500" height="500"></canvas>
        </div>
    </x-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import XCard from '../../../components/container/XCard.vue';
import XComponent from '../../../components/container/XComponent.vue';
import XCheckBox from '../../../components/functional/XCheckBox.vue';
import XImageUpload from '../../../components/functional/XImageUpload.vue';

const initData = defineModel("initData");
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
];

const cardOpenList = [
    { text: '1', value: 1 },
    { text: '3', value: 3 },
    { text: '5', value: 5 }
];

const calcRowCount = () => {
    const box = {
        width: 0,
        height: 0,
        thickness: 0
    }
    //长：宽得倍数
    const ratio = 1;
    //最大倍数
    const maxRatio = 2;
    //最大size，刀模最大尺寸480x310，纸张最大尺寸470mmx325mm，渲染器最大尺寸456mmx320mm，所以最大尺寸为456x310
    const maxSize = { width: 456, thickness: 310 };
    //找出每盒数量的所有因数
    const divisors = findDivisors(initData.value.quantityPerBox);

    const findBox = (columnCount, level = 0) => {
        const width = initData.value.size.width;    //小卡宽度
        const height = initData.value.size.height;  //小卡高度
        const thickness = 0.67;                      //小卡厚度
        const quantityPerBox = initData.value.quantityPerBox;  //每盒数量
        //在最高条件等级时，判断每列数量是否大于500，如果大于500不计算
        if (level == 0) {
            if (quantityPerBox / columnCount > 500) return;  //每列数量大于500不计算
        }
        const calcBox = {
            width: width * columnCount,
            height: height,
            thickness: thickness * (quantityPerBox / columnCount) + 15//每列厚度,15为固定值（生产要求）
        }

        //计算长宽比
        const newRatio = calcBox.width / calcBox.thickness;
        console.log('newRatio', newRatio, calcBox.width, calcBox.thickness, columnCount, quantityPerBox / columnCount);
        //如果长宽比在ratio和maxRatio之间，并且尺寸在最大尺寸之内
        if (newRatio >= ratio && newRatio <= maxRatio) {
            console.log('box', calcBox);
            box.width = Math.ceil(calcBox.width);
            box.height = Math.ceil(calcBox.height);
            box.thickness = Math.ceil(calcBox.thickness);
            initData.value.columnCount = columnCount;
            //计算每列数量，如果每列数量不是整数，向上取最接近的整数
            initData.value.columnQuantity = Math.ceil(quantityPerBox / columnCount);
            initData.value.box = box;
        }
    }
    //条件等级,0为最高，1为次高
    let level = 0;
    while (box.width == 0 && level < 2) {
        //首先看看是否能找到整数的每列数量
        divisors.forEach((divisor) => {
            if (box.width !== 0) return;
            findBox(divisor, level);
        });
        if (box.width === 0) {
            //首先计算出在多少列的情况下，长宽比最接近1，假如最小为1列，最大为10000列
            for (let columnCount = 1; columnCount <= 20; columnCount++) {
                findBox(columnCount, level);
                if (box.width !== 0) break;
            }
        }
        level++;
    }
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
// Function to draw the 3D box on the canvas
const draw3DBox = () => {
    const canvas = boxCanvas.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get box dimensions
    const { width, height, thickness } = initData.value.box;

    // Calculate scale to fit the box in the canvas
    const scale = Math.min(canvas.width / (width + thickness), canvas.height / (height + thickness));

    // Scaled dimensions
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const scaledThickness = thickness * scale;

    // Coordinates for the front face
    const frontTopLeft = { x: scaledThickness, y: scaledThickness };
    const frontTopRight = { x: scaledThickness + scaledWidth, y: scaledThickness };
    const frontBottomLeft = { x: scaledThickness, y: scaledThickness + scaledHeight };
    const frontBottomRight = { x: scaledThickness + scaledWidth, y: scaledThickness + scaledHeight };

    // Coordinates for the top face
    const topTopLeft = { x: 0, y: 0 };
    const topTopRight = { x: scaledWidth, y: 0 };
    const topBottomLeft = { x: scaledThickness, y: scaledThickness };
    const topBottomRight = { x: scaledThickness + scaledWidth, y: scaledThickness };

    // Coordinates for the side face
    const sideTopLeft = { x: scaledWidth, y: 0 };
    const sideTopRight = { x: scaledWidth + scaledThickness, y: scaledThickness };
    const sideBottomLeft = { x: scaledThickness + scaledWidth, y: scaledThickness };
    const sideBottomRight = { x: scaledWidth + scaledThickness, y: scaledHeight + scaledThickness };

    // Draw top face
    ctx.beginPath();
    ctx.moveTo(topTopLeft.x, topTopLeft.y);
    ctx.lineTo(topTopRight.x, topTopRight.y);
    ctx.lineTo(topBottomRight.x, topBottomRight.y);
    ctx.lineTo(topBottomLeft.x, topBottomLeft.y);
    ctx.closePath();
    ctx.stroke();

    // Draw front face
    ctx.beginPath();
    ctx.moveTo(frontTopLeft.x, frontTopLeft.y);
    ctx.lineTo(frontTopRight.x, frontTopRight.y);
    ctx.lineTo(frontBottomRight.x, frontBottomRight.y);
    ctx.lineTo(frontBottomLeft.x, frontBottomLeft.y);
    ctx.closePath();
    ctx.stroke();

    // Draw side face
    ctx.beginPath();
    ctx.moveTo(sideTopLeft.x, sideTopLeft.y);
    ctx.lineTo(sideTopRight.x, sideTopRight.y);
    ctx.lineTo(sideBottomRight.x, sideBottomRight.y);
    ctx.lineTo(sideBottomLeft.x, sideBottomLeft.y);
    ctx.closePath();
    ctx.stroke();

    // Draw dimensions
    ctx.font = '16px Arial';
    ctx.fillText(`${width}mm`, scaledThickness + scaledWidth / 2, scaledThickness / 2);
    ctx.fillText(`${height}mm`, scaledThickness / 2, scaledThickness + scaledHeight / 2);
    ctx.fillText(`${thickness}mm`, scaledThickness + scaledWidth / 2, scaledThickness + scaledHeight);
};


// Watch for changes in box data and draw the box
watch(() => initData.value.box, draw3DBox, { deep: true });

watch(() => initData.value.size, (newVal) => {
    calcRowCount();
});
watch(() => initData.value.quantityPerBox, (newVal) => {
    calcRowCount();
});
</script>

<style lang="scss" scoped>
.bg-img {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.calcBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.canvas-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
