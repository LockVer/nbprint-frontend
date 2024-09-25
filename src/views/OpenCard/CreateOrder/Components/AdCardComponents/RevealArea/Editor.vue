<template>
    <div class="panel">
        <div class="left-panel">
            <OperationArea />
        </div>
        <div class="right-panel">
            <XCanvas />
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, provide } from 'vue';
import OperationArea from './Components/OperationArea.vue';
import XCanvas from '@/components/functional/xcanvas/XCanvas.vue';
import Communicator from '@/utils/Communicator';
//utils
import CanvasRenderer from './utils/CanvasRenderer';

const communicatorName = 'revealAreaCommunicator';  // 通信器名称
// 实例化 Communicator 并创建响应式对象
const communicator = reactive(new Communicator());
// Canvas渲染器
const canvasRenderer = new CanvasRenderer(communicator);
// 将通信器提供给子组件
provide(communicatorName, communicator);

const update = () => {
    canvasRenderer.updateTest();
};

</script>
<style scoped lang="scss">
.panel {
    display: flex;
    width: 100vw;
    height: 100vh;

    .left-panel {
        width: 270px;
        height: 100%;
        background-color: white;
        box-shadow: 4px 0px 10px 0px #00000014;
        z-index: 1;
    }

    .right-panel {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;

        .panel-header {
            height: 70px;
            background-color: white;
        }

        .panel-body {
            flex: 1;
            background-color: black;
        }
    }
}
</style>