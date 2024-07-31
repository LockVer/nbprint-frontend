import ApiService from '../utils/ApiService';
class CommonService {
    constructor(orderId) {
        this.apiService = new ApiService();
        this.orderId = orderId;
    }
    uploadImages(file, orderId, keyWords = ['image']) {
        let fData = new FormData();
        fData.append('image', file);  // Assumes that value can be uploaded directly
        fData.append('orderId', orderId); // Add a unique identifier to the form data
        return this.apiService.post('/ossFile/uploadImage', fData, true);
    }
}

export default CommonService;
