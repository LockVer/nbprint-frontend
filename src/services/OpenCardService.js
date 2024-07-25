import ApiService from '../utils/ApiService';
class OpenCardService {
    constructor() {
        this.apiService = new ApiService();
        this.userDatas = JSON.parse(localStorage.getItem('userInfo'));
        this.nbUserId = { nbUserId: this.userDatas.id };
    }

    CreateOrder(data) {
        return this.apiService.post('/pdf/render', { ...data, ...this.nbUserId}, true);
    }
    GetList(data) {
        return this.apiService.post('/uncardOrder/getList', { ...data, ...this.nbUserId}, true);
    }
    DeleteOrder(orderId) {
        return this.apiService.post('/uncardOrder/delete?id=' + orderId, true);
    }
    DownloadPDF(orderId) {
        return this.apiService.downloadFile('/ossFile/downloadPdf?orderId=' + orderId, false)
    }
    GetDetails(id) {
        return this.apiService.get(`/uncardOrder/getInfo?id=${id}`, {}, true);
    }
}

export default OpenCardService;
