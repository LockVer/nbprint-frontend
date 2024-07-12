<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
export default defineComponent({
    name: "XComponents",
    props: {
        label: {
            type: String,
            default: ""
        },
        width: {
            type: String,
            default: "100%"
        },
        padding: {
            type: String,
            default: "0px"
        },
        marginBottom:{
            type: String,
            default: "0px"
        },
        hide: {
            type: Boolean,
            default: false
        },
        fontWeight: {
            type: String,
            default: 'bold'
        },
        isFullWidth: {
            type: Boolean,
            default: false
        },
        titleStyle: {
            type: String,
            default: ""
        },
        titleBottom: {
            type: String,
            default: '8px'
        }
    },
    setup() {

        return {

        }
    }
})
</script>
<template>
    <div class="xcomponent-container" :class="{ 'hide': hide, 'full': isFullWidth }" :style="{ width: width, padding: padding,marginBottom:marginBottom }">
        <div class="xcomponent-header">
            <div class="xcomponent-title" :style="{ 'font-weight': fontWeight, 'color': titleStyle,'margin-bottom':titleBottom }" :class="{'hide':!label}">{{ label||"无" }}</div>

        </div>
        <div class="xcomponent-content">
            <slot></slot>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.xcomponent-container {

    display: flex;
    flex-direction: column;


    &.full {
        width: auto !important;
        flex: 1;
        align-items: center;
    }

    .xcomponent-header {
        display: flex;
        align-items: center;
        /* margin-bottom: 8px; */
        font-weight: bold;

        .xcomponent-title {
            font-size: 12px;
        }
    }

    .xcomponent-content {
        .xbutton {
            width: 100%;
        }
        .el-input-number {
            width: 100%!important;
        }
    }

    &.layout {
        margin-bottom: 18px;

        .black {
            font-size: 18px !important;
            color: black;
            margin-top: 18px;
        }

        .xcomponent-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
        }
    }
}
</style>
