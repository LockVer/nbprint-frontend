import ApiService from '../utils/ApiService';
class CommonService {
    constructor(orderId) {
        console.log("111");
        this.apiService = new ApiService();
        this.orderId = orderId;
        console.log(orderId);
    }
    // 上传图片
    uploadImages(file, hideLoading = false) {
        console.log(this.orderId);
        let fData = new FormData();
        fData.append('image', file);  // Assumes that value can be uploaded directly
        fData.append('orderId', this.orderId.value); // Add a unique identifier to the form data
        // fData.append('fileP', keyWords);
        return this.apiService.post('/ossFile/uploadImage', fData, true, hideLoading);
    }
    // 上传Excel
    uploadExcel(file, hideLoading = false) {
        let fData = new FormData();
        fData.append('file', file);  // Assumes that value can be uploaded directly
        fData.append('orderId', this.orderId.value); // Add a unique identifier to the form data
        return this.apiService.post('/ossFile/uploadAlgorithm', fData, true, hideLoading);
    }
}

export default CommonService;
