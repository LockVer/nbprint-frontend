class CanvasRenderer {
    constructor(communicator) {
        this.communicator = communicator;
    }
    updateTest() {
        console.log('updateTest');
        this.communicator.data.test = '111222';
    }
}

export default CanvasRenderer;