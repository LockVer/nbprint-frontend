import ApiService from '../utils/ApiService';
class CommonService {
    constructor(orderId) {
        this.apiService = new ApiService();
        this.orderId = orderId;
    }
    uploadImages(file, keyWords = ['image']) {
        let fData = new FormData();
        console.log(fData)
        fData.append('image', file);  // Assumes that value can be uploaded directly
        fData.append('orderId', this.orderId); // Add a unique identifier to the form data
        return this.apiService.post('/ossFile/uploadImage', fData, true);
    }
}

export default CommonService;
