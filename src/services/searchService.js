import ApiService from '../utils/ApiService';
class SearchService {
    constructor() {
        this.apiService = new ApiService();
    }
    getOptions() {
        return this.apiService.get('uncardOrder/getOptions', {}, true);
    }
}


export default SearchService;