import ApiService from '../utils/ApiService';
class CommonService {
    constructor(orderId) {
        console.log("111");
        this.apiService = new ApiService();
        this.orderId = orderId;
        console.log(orderId);
    }
    uploadImages(file) {
        console.log(this.orderId);
        let fData = new FormData();
        fData.append('image', file);  // Assumes that value can be uploaded directly
        fData.append('orderId', this.orderId.value); // Add a unique identifier to the form data
        // fData.append('fileP', keyWords);
        return this.apiService.post('/ossFile/uploadImage', fData, true);
    }
}

export default CommonService;
