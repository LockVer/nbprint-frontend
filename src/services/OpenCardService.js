import ApiService from '../utils/ApiService';
class OpenCardService {
    constructor() {
        this.apiService = new ApiService();
        this.userDatas = JSON.parse(localStorage.getItem('userInfo'));
        this.employeeId = { employeeId: this.userDatas.id };
    }

    createOrder(data) {
        return this.apiService.post('/pdf/render', { ...data, ...this.employeeId}, true);
    }
    getList(data) {
        return this.apiService.post('/uncardOrder/getList', { ...data, ...this.employeeId}, true);
    }
    deleteOrder(orderId) {
        return this.apiService.post('/uncardOrder/delete?id=' + orderId, true);
    }
    downloadPDF(orderId) {
        return this.apiService.downloadFile('/ossFile/downloadPdf?orderId=' + orderId, false)
    }
    getDetails(id) {
        return this.apiService.get(`/uncardOrder/getInfo?id=${id}`, {}, true);
    }
}

export default OpenCardService;
