<template>
    <x-card :title="'订单信息'" :cardStyle="{ 'height': 'auto' }">
        <div class="generalInfo">
            <x-component label="产品名称" :titleStyle="'#484848'" :width="'15%'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="客户名称" :titleStyle="'#484848'" :width="'15%'">
                <div class="value">Admin-Wang</div>
            </x-component>
            <x-component label="业务员" :titleStyle="'#484848'" :width="'15%'">
                <div class="value">王红梅</div>
            </x-component>
            <x-component label="产品名称" :titleStyle="'#484848'" :width="'15%'">
                <div class="value">Happy-Friday</div>
            </x-component>
            <x-component label="创建时间" :titleStyle="'#484848'" :width="'15%'">
                <div class="value">2024-06-09 12:00:13</div>
            </x-component>
            <x-component label="审核人" :titleStyle="'#484848'" :width="'15%'">
                <div class="value">王山山</div>
            </x-component>
        </div>
    </x-card>
    <x-card :title="'审核内容'" :cardStyle="{ 'height': 'auto' }" class="audit">
        <div class="audit-card">
            <div class="audit-title">基本审核项</div>
            <div class="audit-content">
                <div class="generalInfo">
                    <x-component label="产品信息" :width="'15%'" :titleStyle="'#484848'" :titleBottom="'12px'"
                        :marginBottom="'16px'">
                        <x-check-box v-model="initData.type" :DataList="cardSizeList" type="radio"></x-check-box>
                    </x-component>
                    <x-component label="装盒参数" :width="'15%'" :titleStyle="'#484848'" :titleBottom="'12px'"
                        :marginBottom="'16px'">
                        <x-check-box v-model="initData.type" :DataList="cardSizeList" type="radio"></x-check-box>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'" :titleBottom="'12px'"
                        :marginBottom="'16px'">
                        <x-check-box v-model="initData.type" :DataList="cardSizeList" type="radio"></x-check-box>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'" :titleBottom="'12px'"
                        :marginBottom="'16px'">
                        <x-check-box v-model="initData.type" :DataList="cardSizeList" type="radio"></x-check-box>
                    </x-component>
                    <x-component label="产品名称" :width="'15%'" :titleStyle="'#484848'" :titleBottom="'12px'"
                        :marginBottom="'16px'">
                        <x-check-box v-model="initData.type" :DataList="cardSizeList" type="radio"></x-check-box>
                    </x-component>
                </div>
            </div>
        </div>
        <div class="audit-card">
            <div class="audit-title">修改意见</div>
            <div class="exception">
                <div class="exception-title">异常项</div>
                <div class="items">
                    <el-tag color="#0022991A">装盒参数</el-tag>
                    <el-tag color="#0022991A">装盒参数</el-tag>
                </div>
            </div>
            <div class="remark">
                <div class="remark-title">异常描述（必填）</div>
                <div class="items">
                    <el-input v-model="textarea1" style="width: 100%" autosize type="textarea"
                        placeholder="备注" />
                </div>
            </div>
        </div>
        <div class="audit-card">
            <div class="audit-title">修改意见</div>
            <div class="exception">
                <div class="exception-title">异常项</div>
                <div class="items">
                    <el-tag color="#0022991A">装盒参数</el-tag>
                    <el-tag color="#0022991A">装盒参数</el-tag>
                </div>
            </div>
            <div class="remark">
                <div class="remark-title">异常描述（必填）</div>
                <div class="items">
                    <el-input v-model="textarea1" style="width: 100%" autosize type="textarea"
                        placeholder="备注" />
                </div>
            </div>
        </div>
        <div class="audit-card">
            <div class="audit-title">修改意见</div>
            <div class="exception">
                <div class="exception-title">异常项</div>
                <div class="items">
                    <el-tag color="#0022991A">装盒参数</el-tag>
                    <el-tag color="#0022991A">装盒参数</el-tag>
                </div>
            </div>
            <div class="remark">
                <div class="remark-title">异常描述（必填）</div>
                <div class="items">
                    <el-input v-model="textarea1" style="width: 100%" autosize type="textarea"
                        placeholder="备注" />
                </div>
            </div>
        </div>
        
    </x-card>
    <layout-footer @submit="handleSubmit" @back="router.go(-1)"></layout-footer>
</template>

<script setup>
import XCard from '@/components/container/XCard.vue';
import XComponent from '@/components/container/XComponent.vue';
import XCheckBox from '@/components/functional/XCheckBox.vue';
import LayoutFooter from '@/components/common/LayoutFooter.vue';
import { reactive,ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const textarea1 = ref('')
const initData = reactive({
    type: "1"
})
const cardSizeList = [
    { text: '正常', value: "1" },
    { text: '异常', value: "0" }
]

const handleSubmit = () => {
    console.log(initData);
}

</script>

<style lang="scss" scoped>
.generalInfo {
    display: flex;
    /* column-gap: 30px; */
    justify-content: space-between;
    flex-wrap: wrap;

    .value {
        color: rgba(0, 0, 0, 0.80);
        font-family: "Helvetica Neue";
        font-size: 12px;
    }
}
.audit{
    margin-bottom: 90px;
}

.audit-card {
    .audit-title {
        height: 30px;
        line-height: 30px;
        padding-left: 10px;
        box-sizing: border-box;
        background: rgba(0, 34, 153, 0.04);
        color: #029;
        font-family: "Helvetica Neue";
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 18px;
    }

    .audit-content {
        width: 100%;
        /* display: flex; */
        gap: 18px;

        .generalInfo {
            width: 100%;
            display: flex;
            column-gap: 200px;
            justify-content: flex-start;

            .value {
                color: rgba(0, 0, 0, 0.80);
                font-family: "Helvetica Neue";
                font-size: 12px;
            }
        }
    }

    .exception,
    .remark {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 18px;
        font-family: "Helvetica Neue";
        font-size: 12px;
        color: var(--Grey-70, #484848);

        .items {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .el-tag__content {
                font-family: "Helvetica Neue";
                font-size: 12px;
            }
        }
    }

    .remark {
        margin: 0px;

        span {
            font-weight: 400;
        }
    }
}
</style>