import ApiService from '../utils/ApiService';
class OpenCardService {
    constructor() {
        this.apiService = new ApiService();
        this.userDatas = JSON.parse(localStorage.getItem('userInfo'));
        this.nbUserId = { nbUserId: this.userDatas.id };
    }

    createOrder(data) {
        return this.apiService.post('/pdf/render', { ...data, ...this.nbUserId}, true);
    }
    getList(data) {
        return this.apiService.post('/uncardOrder/getList', { ...data, ...this.nbUserId}, true);
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
