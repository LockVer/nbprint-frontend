<template>
    <x-card title="奖符">
        <div class="award-id">
            <div class="addtype">
                <el-button color="#4d65b8" @click="batchUpload(item)" :key="item.value" v-for="item in awardIDList">+{{
                    item.text }}</el-button>
            </div>
            <div class="actions">
                <el-button color="#4d65b8" @click="onCustomName">添加自定义玩法</el-button>
                <el-button type="danger" @click="clearData">清空</el-button>
            </div>
        </div>

        <div class="award-list">
            <div class="award-item" v-for="(awardItem, index) in awardIDList" :key="index">
                <div class="item-type" v-if="filterPrizeMark(awardItem.value).length > 0">
                    <span>{{ awardItem.text }}</span>
                    <span class="delBtn" @click="onTypeClick(awardItem)">删除</span>
                </div>
                <div class="item-content" v-for="(item, eindex) in filterPrizeMark(awardItem.value)" :key="item.id">
                    <div class="item-input">
                        <x-component :label="eindex == 0 ? '序号' : ''" width="5%">
                            <div style="height: 32px; line-height: 32px; font-size: 12px;">{{ eindex + 1 }}</div>
                        </x-component>
                        <div class="items-content">
                            <x-component :label="eindex == 0 ? '名称' : ''" width="15%">
                                <el-input placeholder="请输入名称" v-model="item.name" @focus="onNameFocus"
                                    @blur="onNameBlur" />
                            </x-component>
                            <x-component :label="eindex == 0 ? '文件' : ''" width="15%">
                                <el-popover placement="top-start" :width="200" trigger="hover">
                                    <template #default>
                                        <div class="thumbnail">
                                            <img :src="item.image" alt="">
                                        </div>
                                    </template>
                                    <template #reference>
                                        <x-input-upload v-model:image="item.image"></x-input-upload>
                                    </template>
                                </el-popover>
                            </x-component>
                            <x-component :label="eindex == 0 ? '备注' : ''" width="30%">
                                <el-input placeholder="请输入备注" v-model="item.comment" />
                            </x-component>
                            <x-component width="100px">
                                <el-button class="removePrizes" @click="removePrize(item)">-</el-button>
                                <el-button type="primary" v-if="eindex + 1 == filterPrizeMark(awardItem.value).length"
                                    class="addPrize" @click="batchUpload(item)">+</el-button>
                            </x-component>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="custom-dialog">
            <el-dialog v-model="customDialogVisible" width="350px" :destroy-on-close="true"
                :close-on-click-modal="false" :close-on-press-escape="false">
                <template #header>
                    <div class="dialog-header">奖符-添加自定义玩法</div>
                </template>
                <div class="custom-content" style="margin-bottom: 18px;">
                    <label class="common-label">输入自定义玩法名称</label>
                    <el-input style="width: 200px;" v-model="customName" placeholder="请输入自定义玩法名称" />
                </div>
                <template #footer>
                    <el-button style="width: 100px;" @click="closePrizeDialog">取消</el-button>
                    <el-button type="primary" style="width: 100px;" @click="batchAdd('addCustomPrize')">确定</el-button>
                </template>
            </el-dialog>
        </div>
    </x-card>
</template>

<script setup>
import { ref, reactive, watch, onMounted, inject } from 'vue';
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import XInputUpload from '@/components/functional/XInputUpload.vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { v4 as uuidv4 } from 'uuid';

const initData = defineModel("initData");
// 注入 commonClass 实例
const commonClass = inject('commonClass');

const fileInputRefs = ref({});
const prizeDialogVisible = ref(false);
const customDialogVisible = ref(false);
const awardIDList = ref([
    { text: 'Instant Winning', value: 'cash', qty: 0 },
    { text: 'Instant No Winning', value: 'noPrize', qty: 0 },
    { text: 'HOLD', value: 'holdCard', qty: 0 },
    { text: 'WINDOW', value: 'window', qty: 0 },
]);

const customName = ref('');


watch(() => initData.value, (newData) => {
    newData.forEach(item => {
        let prize = awardIDList.value.find(award => award.value === item.type);
        if (!prize) {
            awardIDList.value.push({ text: item.type, value: item.type, qty: 0 })
        }
    })
}, { deep: true });
watch(() => awardIDList.value, (newData) => {
    awardIDList.value = newData;
}, { deep: true })


const isFocus = ref(false);
const onNameFocus = () => {
    isFocus.value = true;
}

const onNameBlur = () => {
    isFocus.value = false;
}

// 删除游戏分类
const onTypeClick = (item) => {
    ElMessageBox.confirm('确定删除该奖符的全部信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        initData.value = initData.value.filter(items => items.type !== item.value);
        let list = awardIDList.value.slice(3);
        console.log(list)
        list.forEach(type => {
            console.log(type.value, item.value)
            if (type.value === item.value) {
                awardIDList.value.splice(awardIDList.value.indexOf(type), 1);
            }
        })
    }).catch(() => {
        console.log('取消删除');
    });
}

const filterPrizeMark = (type) => {
    let index = 1; // 初始化索引为1
    const filteredData = initData.value.filter((item) => {
        if (item.type === type) {
            const awardItem = awardIDList.value.find(award => award.value === type);
            if (awardItem) {
                // if (!item.name && !isFocus.value) {
                //     item.name = `${awardItem.text}${index}`;
                //     // item.name = `${awardItem.text}`;
                // }
                if ((!item.name || item.name.startsWith(awardItem.text)) && !isFocus.value) {
                    const str = item.name;
                    // 动态部分
                    const dynamicPart = awardItem.text + index;
                    if (!str || str == (`${awardItem.text}${index >= 1 ? index + 1 : index}`)) {
                        // 构建正则表达式
                        const regex = new RegExp(dynamicPart + "(.*)");
                        // 使用正则表达式匹配
                        console.log('str', str)
                        console.log('dynamicPart', dynamicPart)
                        const match = str.match(regex);
                        console.log('match', match)
                        if (match) {
                            // 提取并输出匹配到的内容
                            const result = match ? match[1] : match;
                            console.log('result', result); // 输出 "485465"

                        } else {
                            console.log("未找到匹配内容");
                            item.name = `${awardItem.text}${index}`;
                        }
                    }
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
        // 重新生成名称
        initData.value.forEach(award => {
            filterPrizeMark(award.value);
        });
    }).catch(() => {
        console.log('取消删除');
    });
};

const addPrizeMark = (item, image) => {
    const prizeMarkItem = {
        id: uuidv4(),
        type: item.value || item.type,
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



const calculateTotal = (item) => {
    const amount = parseFloat(item.amount) || 0;
    const count = parseInt(item.count) || 0;
    item.total = (amount * count).toString();
};

const clearData = () => {
    initData.value = [];
    fileInputRefs.value = {};
    if (awardIDList.value.length > 4) {
        awardIDList.value.splice(4);  // 保留前四个元素，删除其余元素
    }
};

const closePrizeDialog = () => {
    prizeDialogVisible.value = false;
    customDialogVisible.value = false
};
const batchAdd = (type) => {
    if (type == 'addCustomPrize') {
        customDialogVisible.value = false
        if (customName.value !== '') {
            awardIDList.value.push({ text: customName.value, value: customName.value, qty: 0 })
        }
        customName.value = ''
    } else {
        prizeDialogVisible.value = false;
        awardIDList.value.forEach(item => {
            if (item.qty > 0) {
                for (let i = 0; i < item.qty; i++) {
                    addPrizeMark(item);
                }
            }
        });
    }

};

const onCustomName = () => {
    customDialogVisible.value = true;
}

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

            .delBtn {
                color: #484848;
                font-size: 12px;
                display: inline-block;
                font-weight: 400;
                margin-left: 10px;
                cursor: pointer;
                opacity: 0;
            }

            &:hover {
                .delBtn {
                    opacity: 1;
                }
            }
        }

        .item-content {
            display: flex;
            flex-direction: column;
            margin-bottom: 18px;
            &:last-child {
                margin-bottom: 0;
            }


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
                margin-bottom: 10px;

                .items-content {
                    flex: 1;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .xcomponent-title {
                    font-weight: normal !important;
                    color: #484848 !important;
                }

                &:last-child {
                    margin-bottom: 0;
                }

                .addPrize,
                .removePrizes {
                    width: 28px;
                    height: 28px;
                }

                .removePrizes {
                    margin-right: 10px;
                    border: 1px solid #4D64B8;
                    color: #4D64B8;
                    opacity: 0;
                    cursor: pointer;
                }
            }

            .split-line {
                width: 100%;
                height: 1px;
                margin: 10px 0 4px 0;
            }

            &:hover {
                .removePrizes {
                    opacity: 1;
                }
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

.dialog-header {
    font-size: 24px;
    font-weight: 700;
}

.common-label {
    font-size: 12px;
    font-weight: 700;
}


.custom-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.upload-file {
    justify-content: flex-start !important;

    .common-label {
        margin-right: 70px;
    }
}

::v-deep(.el-dialog__header) {
    display: flex !important;
    align-items: center;
}
</style>

<style lang="scss">
.custom-dialog {
    .el-dialog__header {
        border-bottom: 1px solid #E4E4E4;
        margin-bottom: 18px;

        .el-dialog__headerbtn {
            top: 10px;
        }


    }

    .el-dialog__footer {
        text-align: center;

        .el-button--primary {
            background-color: #4D64B8;
            border: 1px solid #4D64B8;
        }
    }
}

.thumbnail {
    width: 180px;
    /* height: 300px; */

    img {
        width: 100%;
    }
}
</style>
