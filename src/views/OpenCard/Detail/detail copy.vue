<template>
    <div class="title">订单详情</div>
    <x-card :cardStyle="{ 'height': 'auto' }">
        <div class="audit">
            <span class="audit-title">审核详情</span>
            <el-tag :type="['warning', 'danger', 'success'][2]">{{ ["待审核", "未通过",
                "已通过"][2] }}</el-tag>
        </div>
        <div class="exception">
            <div class="exception-title">异常项</div>
            <div class="items">
                <el-tag color="#0022991A">装盒参数</el-tag>
                <el-tag color="#0022991A">装盒参数</el-tag>
            </div>
        </div>
        <div class="exception">
            <div class="exception-title">备注</div>
            <span>无</span>
        </div>
        <div class="exception">
            <div class="exception-title">审核人</div>
            <span>张萨捍</span>
        </div>
    </x-card>
    <x-card title="通用信息" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }">
        <div class="generalInfo">
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="产品译名" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">快乐星期五</div>
            </x-component>
            <x-component label="客户名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Admin-Wang</div>
            </x-component>
            <x-component label="货币符号" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">$</div>
            </x-component>
            <x-component label="业务员" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">王红梅</div>
            </x-component>
        </div>
    </x-card>
    <x-card title="小卡信息" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }">
        <div class="generalInfo">
            <x-component label="尺寸" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                <div class="value">48*76mm</div>
            </x-component>
            <x-component label="揭开口数量" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">1</div>
            </x-component>
            <x-component label="小卡单价" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">1</div>
            </x-component>
            <x-component label="刀模开口方向" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">上</div>
            </x-component>
            <x-component label="盒号位置" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">下左</div>
            </x-component>
            <x-component label="盒号" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">FT_151165</div>
            </x-component>
            <x-component label="盒数" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">3</div>
            </x-component>
            <x-component label="每盒数量" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">3200</div>
            </x-component>
        </div>
    </x-card>
    <x-card title="宣传卡信息" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }">
        <div class="generalInfo">
            <x-component label="产品名称" :width="'100%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                <div class="value-number">Happy-Friday</div>
            </x-component>
        </div>
        <div class="generalInfo">
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Happy-Friday</div>
            </x-component>
        </div>
        <div class="generalInfo">
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                <div class="value">Happy-Friday</div>
            </x-component>
        </div>
    </x-card>
    <x-card title="奖符" :cardStyle="{ 'height': 'auto' }" :titleStyle="{ 'color': 'rgba(0, 0, 0, 0.8)' }">
        <div class="prize-card">
            <div class="prize-title">现金奖</div>
            <div class="item">
                <div class="item-title">
                    <div class="dot"></div>
                    <span>现金奖1</span>
                </div>
                <div class="generalInfo">
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                </div>
            </div>
            <div class="item">
                <div class="item-title">
                    <div class="dot"></div>
                    <span>现金奖2</span>
                </div>
                <div class="generalInfo">
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                </div>
            </div>
        </div>
        <div class="prize-card">
            <div class="prize-title">HODENZ</div>
            <div class="item">
                <div class="item-title">
                    <div class="dot"></div>
                    <span>现金奖1</span>
                </div>
                <div class="generalInfo">
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'" :marginBottom="'16px'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'">
                        <div class="value">Happy-Friday</div>
                    </x-component>
                    <x-component label="备注" :width="'15%'" :titleStyle="'#484848'">
                        <el-tooltip
                            content="按时发萨法沙发沙发沙发撒旦撒大苏打撒大苏打大撒大撒大撒大大大苏打大大撒大苏打大大按时发萨法沙发沙发沙发撒旦撒大苏打撒大苏打大撒大撒大撒大大大苏打大大撒大苏打大大按时发萨法沙发沙发沙发撒旦撒大苏打撒大苏打大撒大撒大撒大大大苏打大大撒大苏打大大按时发萨法沙发沙发沙发撒旦撒大苏打撒大苏打大撒大撒大撒大大大苏打大大撒大苏打大大"
                            placement="bottom" effect="light">
                            <div class="value">按时发萨法沙发沙发沙发撒旦撒大苏打撒大苏打</div>
                        </el-tooltip>
                    </x-component>
                </div>
            </div>
        </div>
    </x-card>
</template>

<script setup>
import XCard from '../../../components/container/XCard.vue';
import XComponent from '../../../components/container/XComponent.vue';
import { onMounted } from 'vue';
import OpenCardService from '../../../services/OpenCardService';
const serviceClass = new OpenCardService();
onMounted(() => {
    let id = JSON.parse(localStorage.getItem('orderDetails'));
    id = id.id
    serviceClass.GetDetails(id).then(res => {
        delete res.data.id
        console.log(res.data)
    })
})



</script>

<style lang="scss" scoped>
.title {
    margin-bottom: 20px;
    color: rgba(0, 0, 0, 0.80);
    font-family: "Helvetica Neue";
    font-size: 24px;
    font-weight: 700;
}

.el-tag {
    padding: 4px 16px;
}

.audit {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 18px;

    .audit-title {
        color: rgba(0, 0, 0, 0.80);
        text-align: center;
        font-family: "Helvetica Neue";
        font-size: 24px;
        font-weight: 700;
    }
}

.exception {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: "Helvetica Neue";
    font-size: 12px;
    font-weight: 700;
    color: var(--Grey-70, #484848);
    margin-bottom: 18px;

    .items {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .el-tag__content {
            font-family: "Helvetica Neue";
            font-size: 12px;
        }
    }

    >span {
        font-weight: 400;
    }

    &:last-child {
        margin-bottom: 0;
    }
}

.generalInfo {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    column-gap: 30px;

    .value,.value-number {
        color: rgba(0, 0, 0, 0.80);
        font-family: "Helvetica Neue";
        font-size: 12px;
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; //溢出不换行
        margin-bottom: 18px;
    }
    .value-number{
        margin-bottom: 0;
    }
}

.prize-card {
    .prize-title {
        height: 30px;
        line-height: 30px;
        padding-left: 10px;
        box-sizing: border-box;
        background: rgba(0, 34, 153, 0.04);
        color: #029;
        font-family: "Helvetica Neue";
        font-size: 14px;
        font-weight: 700;
        /* margin-bottom: 16px; */
    }

    .item {

        /* background-color: red; */
        &:not(:first-child) {
            padding-top: 16px;
            border-top: 1px solid #f0f0f0;
        }

        &:not(:last-child) {
            /* padding-bottom: 16px; */
        }

        .item-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;

            .dot {
                width: 6px;
                height: 6px;
                background: #4D64B8;
            }

            span {
                color: #666;
                font-family: "Helvetica Neue";
                font-size: 12px;
                font-weight: 700;
            }
        }
    }
}
</style>