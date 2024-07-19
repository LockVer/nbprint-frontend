import ApiService from '../utils/ApiService';
class searchService {
    constructor() {
        this.apiService = new ApiService('http://192.168.1.224:8084');
    }
    getOptions() {
        return this.apiService.get('uncardOrder/getOptions', {}, true);
    }
}

export default searchService;