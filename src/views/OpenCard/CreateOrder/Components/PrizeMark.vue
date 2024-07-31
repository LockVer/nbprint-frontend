<template>
    <x-card title="奖符">
        <x-card title="中奖标识种类" :titleStyle="{ 'font-size': '14px', 'color': '#484848' }"
            :cardStyle="{ 'padding': '0', 'background': 'none', 'box-shadow': 'none' }">
            <div class="award-id">
                <div class="addtype">
                    <el-button color="#4d65b8" @click="batchUpload(item)" :key="item.value"
                        v-for="item in awardIDList">+{{ item.text }}</el-button>
                </div>
                <div class="actions">
                    <el-button color="#4d65b8" @click="showAddBatchDialog">批量添加</el-button>
                    <el-button type="danger" @click="clearData">清空</el-button>
                </div>
            </div>
            <!-- <div v-for="item in initData">{{ item.name }}</div> -->
            <div class="award-list">
                <div class="award-item" v-for="(awardItem, index) in awardIDList" :key="index">
                    <div class="item-type">
                        <span>{{ awardItem.text }}</span>
                    </div>

                    <div class="item-content" v-for="(item, eindex) in filterPrizeMark(awardItem.value)" :key="item.id">
                        <div class="item-title">
                            <span>{{ awardItem.text }}{{ eindex + 1 }}</span>
                            <span @click="removePrize(item)" class="iconfont icon-ashbin"></span>
                        </div>
                        <div class="item-input">
                            <x-component label="名称" width="220px">
                                <el-input placeholder="请输入名称" v-model="item.name" @focus="onNameFocus" @blur="onNameBlur" />
                            </x-component>
                            <x-component label="背景图" width="220px">
                                <x-input-upload v-model:image="item.image"></x-input-upload>
                            </x-component>
                            <x-component label="金额" width="220px">
                                <el-input placeholder="请输入金额" v-model="item.amount" @input="onAmountInput(item)"
                                    :disabled="item.type === 'noPrize'" />
                            </x-component>
                            <x-component label="数量" width="220px">
                                <el-input placeholder="请输入数量" v-model="item.count" @input="onNumberInput(item)"
                                    :disabled="item.type === 'noPrize'" />
                            </x-component>
                            <x-component label="合计" width="220px">
                                <el-input placeholder="" v-model="item.total" :disabled="true" />
                            </x-component>
                        </div>
                        <div class="item-input">
                            <x-component label="备注" width="100%">
                                <el-input placeholder="请输入备注" v-model="item.comment" />
                            </x-component>
                        </div>
                        <div class="split-line" v-if="!(eindex + 1 == filterPrizeMark(awardItem.value).length)"></div>
                    </div>
                </div>
            </div>
        </x-card>
        <el-dialog v-model="prizeDialogVisible" width="350px" :destroy-on-close="true" title="批量添加"
            :close-on-click-modal="false" :close-on-press-escape="false">
            <!--批量添加-->
            <div class="batch-add" v-for="item in awardIDList" :key="item.value">
                <x-component label="奖符种类" width="45%">
                    <el-input v-model="item.text" readonly />
                </x-component>
                <x-component label="数量" width="45%">
                    <el-input-number v-model="item.qty" :min="0" :max="100" width="100%" />
                </x-component>
            </div>
            <template #footer>
                <el-button @click="closePrizeDialog">取消</el-button>
                <el-button type="primary" @click="batchAdd">确定</el-button>
            </template>
        </el-dialog>
    </x-card>
</template>

<script setup>
import { ref, reactive, watch, onMounted, inject } from 'vue';
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import XInputUpload from '@/components/functional/XInputUpload.vue';
import { ElMessageBox, ElMessage  } from 'element-plus';
import { v4 as uuidv4 } from 'uuid';

const initData = defineModel("initData");
// 注入 commonClass 实例
const commonClass = inject('commonClass');

const fileInputRefs = ref({});
const prizeDialogVisible = ref(false);
const awardIDList = reactive([
    { text: '现金奖', value: 'cash', qty: 0 },
    { text: '不中奖', value: 'noPrize', qty: 0 },
    { text: 'HOLD卡', value: 'holdCard', qty: 0 },
    { text: '自定义玩法', value: 'custom', qty: 0 }
]);

watch(() => initData.value, (newData) => {
}, { deep: true });

const isFocus = ref(false);
const onNameFocus = ()=>{
    isFocus.value = true;
}

const onNameBlur = ()=>{
    isFocus.value = false;
}

const filterPrizeMark = (type) => {
    let index = 1; // 初始化索引为1
    const filteredData = initData.value.filter((item) => {
        if (item.type === type) {
            if (!item.name && !isFocus.value) {
                const awardItem = awardIDList.find(award => award.value === type);
                if (awardItem) {
                    item.name = `${awardItem.text}${index}`;
                }
            }
            index++; // 每找到一个匹配项，索引加1
            return true;
        }
        return false;
    });
    return filteredData;
};


const removePrize = (item) => {
    ElMessageBox.confirm('确定删除该奖符信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        initData.value = initData.value.filter(i => i.id !== item.id);
    }).catch(() => {
        console.log('取消删除');
    });
};

const addPrizeMark = (item, image) => {
    const prizeMarkItem = {
        id: uuidv4(),
        type: item.value,
        // text: item.text,
        name: "", // 设置初始名称
        imageSelected: false,
        imageName: '',
        image: image || '',
        amount: '',
        count: '',
        total: '',
        comment: ''
    };

    if (!initData.value) {
        initData.value = [];
    }
    initData.value.push(prizeMarkItem);
};

const onAmountInput = (item) => {
    item.amount = item.amount.replace(/[^\d.]/g, ''); // 只允许输入数字和小数点
    if (item.type !== 'noPrize') {
        calculateTotal(item);
    }
};

const onNumberInput = (item) => {
    item.count = item.count.replace(/[^\d]/g, ''); // 只允许输入整数
    if (item.type !== 'noPrize') {
        calculateTotal(item);
    }
};

const calculateTotal = (item) => {
    const amount = parseFloat(item.amount) || 0;
    const count = parseInt(item.count) || 0;
    item.total = (amount * count).toString();
};

const clearData = () => {
    initData.value = [];
    fileInputRefs.value = {};
};

const closePrizeDialog = () => {
    prizeDialogVisible.value = false;
};
const batchAdd = () => {
    prizeDialogVisible.value = false;
    awardIDList.forEach(item => {
        if (item.qty > 0) {
            for (let i = 0; i < item.qty; i++) {
                addPrizeMark(item);
            }
        }
    });
};
const showAddBatchDialog = () => {
    prizeDialogVisible.value = true;

    awardIDList.forEach(item => {
        item.qty = 0;
    });
};

const batchUpload = async (awardType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; // 允许选择多个文件
    input.onchange = async (event) => {
        const files = Array.from(event.target.files);
        files.sort((a, b) => a.name.localeCompare(b.name)); // 根据文件名排序

        for (const file of files) {
            try {
                // 使用你提供的上传方法
                const res = await commonClass.uploadImages(file, localStorage.getItem('orderId'));
                // 上传成功后添加数据到awardIDList
                addPrizeMark(awardType, res.data);
            } catch (err) {
                console.error(err);
                ElMessage.error(err);
            }
        }
    };
    input.click(); // 触发文件选择
};
onMounted(() => {
    initData.value.forEach((item) => {
        if (!item.id) item.id = uuidv4();
        calculateTotal(item);
    });
});
</script>

<style lang="scss">
.award-id {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.award-list {
    display: flex;
    flex-direction: column;

    .award-item {
        display: flex;
        flex-direction: column;

        .item-type {
            width: 100%;
            height: 30px;
            display: flex;
            align-items: center;
            background: rgba(#002299, 0.04);
            padding: 0 10px;
            margin: 10px 0;
            color: #002299;
            font-weight: bold;

            span {
                font-size: 14px;
            }
        }

        .item-content {
            display: flex;
            flex-direction: column;

            .item-title {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: #666666;
                position: relative;
                padding-left: 15px;
                margin-bottom: 10px;

                span:after {
                    content: ' ';
                    width: 8px;
                    height: 8px;
                    background: #4D64B8;
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                }

                .icon-ashbin {
                    font-size: 16px;
                    color: white;
                    background: #e47470;
                    margin-left: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;

                    &:hover {
                        background: #ff937d;
                    }
                }
            }

            .item-input {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 10px;

                .xcomponent-title {
                    font-weight: normal !important;
                    color: #484848 !important;
                }

                &:last-child {
                    margin-bottom: 0;
                }
            }

            .split-line {
                width: 100%;
                height: 1px;
                background: rgba(#002299, 0.2);
                margin: 10px 0 15px 0;
            }
        }
    }
}

.batch-add {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .el-input-number {
        width: 100%;
    }
}
</style>
