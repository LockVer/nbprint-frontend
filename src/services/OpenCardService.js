import ApiService from '../utils/ApiService';


class OpenCardService {
    constructor() {
        this.apiService = new ApiService();
    }
    // 创建订单
    createOrder(data) {
        return this.apiService.post('/pdf/render', data, true);
    }
    // 获取订单列表
    getList(data) {
        return this.apiService.post('/uncardOrder/getList', data, true);
    }
    // 删除订单
    deleteOrder(orderId) {
        return this.apiService.post('/uncardOrder/delete?id=' + orderId, true);
    }
    // 下载PDF
    downloadPDF(orderId) {
        return this.apiService.downloadFile('/ossFile/downloadPdf?orderId=' + orderId, false)
    }
    // 获取详情
    getDetails(id) {
        return this.apiService.get(`/uncardOrder/getInfo?id=${id}`, {}, true);
    }
    getOrderById(id) {
        return this.apiService.get(`/uncardOrder/edit?id=${id}`, {}, true);
    }
    autoSave(data) {
        return this.apiService.post('/draft/save', data, true, true);
    }
    loadDraft(id) {
        return this.apiService.get(`/draft/load?nbUserId=${id}`, {}, true);
    }
    deleteDraft(id) {
        return this.apiService.get(`/draft/delete?nbUserId=${id}`, {}, true);
    }
}

export default OpenCardService;
