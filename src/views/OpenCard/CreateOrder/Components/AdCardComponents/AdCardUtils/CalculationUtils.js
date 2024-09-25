class CalculationUtils {
    constructor() {

    }
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
    findMaxRectBWithRatio(rectA, image) {
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
}

export default new CalculationUtils();