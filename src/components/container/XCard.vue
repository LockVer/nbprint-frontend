<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
export default defineComponent({
    name: "XCard",
    props: {
        title: {
            type: String,
            default: ""
        },
        titleStyle: {
            type: Object,
            default: () => {
                return {}
            }
        },
        cardStyle: {
            type: Object,
            default: () => {
                return {}
            }
        },
    },
    setup() {

        return {

        }
    }
})
</script>
<template>
    <div class="card-container" :style="cardStyle">
        <div class="card-header" v-if="title">
            <div class="card-title" :style="titleStyle">{{ title }}</div>
        </div>
        <div class="card-content">
            <slot></slot>
        </div>
    </div>
</template>
<style scoped lang="scss">
.card-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    box-shadow: 0 0 40px rgba(0, 0, 0, .05);
    padding: 18px;
    background: white;
    margin-bottom: 18px;

    .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 18px;

        .card-title {
            font-size: 24px;
            font-weight: bold;
        }
    }

    .card-content {
        position: relative;
    }
}
</style>
