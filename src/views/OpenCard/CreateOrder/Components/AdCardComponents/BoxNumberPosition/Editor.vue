<template>
    <div class="panel">
        <x-canvas :communicatorName="'boxNumberCommunicator'" :initData="initData" @addDone="addDone"
            @closePanel="closePanel">
        </x-canvas>
    </div>
</template>
<script setup>
import { ref, onMounted, reactive, provide } from 'vue';
import XCanvas from '@/components/functional/xcanvas/XCanvas.vue';
import Communicator from '@/utils/Communicator';
import RectHandler from '@/components/functional/xcanvas/utils/ToolbarUtils/RectHandler';

const emits = defineEmits(['addDone', 'closePanel']);
const props = defineProps({
    currentAdCard: {
        type: Object,
        default: null
    }
});

const communicatorName = 'boxNumberCommunicator';  // 通信器名称
const communicator = reactive(new Communicator());
communicator.data.adCardSize = props.currentAdCard.adCardSize;
communicator.data.backgroundImage = props.currentAdCard.image;
communicator.data.showMainActions = ['rect'];
communicator.data.showHelperActions = ['addDone', 'closePanel'];
communicator.data.showHelperActionsAlways = true;
communicator.data.maxShapeCount = 1;
communicator.data.showShapeDistance = false;
communicator.data.showShapeSizeText = true;
provide(communicatorName, communicator);
const initData = () => {
    communicator.data.regions = props.currentAdCard.boxNumberRegions;
    // communicator.data.shapeList = props.currentAdCard.boxNumberRegions.map((region) => {
    //     const rectHandler = new RectHandler({
    //         x: region.x,
    //         y: region.y,
    //         width: region.width,
    //         height: region.height,
    //         id: region.id,
    //         type: 'rect',
    //     }, communicator);
    //     return rectHandler;
    // });
    console.log('communicator.data:', communicator.data);
}

onMounted(() => {
    initData();
});

const addDone = () => {
    const { shapeList } = communicator.data;
    props.currentAdCard.boxNumberRegions = shapeList.map((shape) => {
        return {
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            id: shape.id,
            text: shape.text
        }
    });
    emits('addDone');
}
const closePanel = () => {
    emits('closePanel');
}

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

        .operatePanel {
            width: 270px;
            min-height: 200px;
            max-height: calc(100% - 20px);
            overflow-y: auto;
            align-self: flex-start;
            background-color: white;
            box-shadow: 4px 0px 10px 0px #00000014;
            z-index: 1;
            margin: 10px;
            border-radius: 5px;
        }

        .panel-header {
            height: 70px;
            background-color: white;
        }

        .panel-body {
            flex: 1;
            background-color: black;
        }

        .game-award {
            padding: 16px;

            .award-title {
                font-size: 20px;
                font-weight: bold;
                color: #333333;
                border-bottom: 1px solid #ebeef5;
                padding-bottom: 12px;
            }

            .game-award-action {
                display: flex;
                flex-direction: column;
                padding: 16px 0;

                .add-award {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;

                    span {
                        margin-right: 10px;
                    }
                }

                .tag {
                    margin-right: 5px !important;
                    margin-bottom: 5px !important;
                }

                .set-award {
                    display: flex;
                    justify-content: flex-end;
                    flex: 1;

                    .el-button.is-link {
                        padding: 0;
                        padding-top: 3px;
                    }
                }

                .award-operate-list {
                    display: flex;
                    flex-direction: column;
                    padding: 10px;
                    background-color: #E5E9F5;
                    border-radius: 5px;

                    .award-operate-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 10px;

                        &:last-child {
                            margin-bottom: 0;
                        }

                        label {
                            margin-right: 10px;
                            font-size: 12px;
                        }
                    }
                }
            }

            .footer {
                margin-top: 20px;
                text-align: center;
                width: 100%;
            }
        }
    }
}
</style>