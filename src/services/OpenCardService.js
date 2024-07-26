import ApiService from '../utils/ApiService';


class OpenCardService {
    constructor() {
        this.apiService = new ApiService();
    }

    createOrder(data) {
        return this.apiService.post('/pdf/render', data, true);
    }
    getList(data) {
        return this.apiService.post('/uncardOrder/getList', data, true);
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
    getOrderById(id) {
        return this.apiService.get(`/uncardOrder/edit?id=${id}`, {}, true);
    }
}

export default OpenCardService;
