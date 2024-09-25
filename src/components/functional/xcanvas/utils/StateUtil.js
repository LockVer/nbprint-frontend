import _ from 'lodash';

class StateUtil {
    constructor(comunicator) {
        this.comunicator = comunicator;
        this.history = [];
    }

    saveState() {
        const { allowSaveStateItem } = this.comunicator.data;
        if (!allowSaveStateItem) return;

        let state = {};
        allowSaveStateItem.forEach(element => {
            state[element] = _.cloneDeep(this.comunicator.data[element]);
        });

        // 如果历史记录为空或者新状态与上一条状态不同，则保存
        if (this.history.length === 0 || !_.isEqual(state, this.history[this.history.length - 1])) {
            this.history.push(state);
        }
    }

    restoreState() {
        if (this.history.length === 0) return;
        const state = this.history.pop();
        const { allowSaveStateItem } = this.comunicator.data;
        allowSaveStateItem.forEach(element => {
            this.comunicator.data[element] = _.cloneDeep(state[element]);
        });
    }

    clearState() {
        this.comunicator.data.stateList = [];
    }

    undo() {
        this.restoreState();
        this.comunicator.data.rendererUtil.render();
    }

    redo() {
        this.saveState();
        this.comunicator.data.rendererUtil.render();
    }
}

export default StateUtil;
