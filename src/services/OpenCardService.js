import ApiService from '../utils/ApiService';
import { v4 as uuidv4 } from 'uuid';
class OpenCardService {
    constructor() {
        this.apiService = new ApiService();
    }
    CreateOrder(data) {
        return this.apiService.post('/pdf/render', data, true);
    }
    GetList(data) {
        return this.apiService.post('/uncardOrder/getList', data, true);
    }
    DeleteOrder(orderId) {
        return this.apiService.post('/uncardOrder/delete?id='+orderId, true);
    }
    DownloadPDF(orderId) {
        return this.apiService.downloadFile('/ossFile/downloadPdf?orderId='+orderId,false)
    }
}

export default OpenCardService;
