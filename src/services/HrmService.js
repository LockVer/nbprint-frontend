import ApiService from '../utils/ApiService';
class SearchService {
    constructor() {
        this.apiService = new ApiService();
    }
    // 获取部门列表层级
    getDepartmentsList() {
        return this.apiService.get(`/dept/getListDict`, {}, true);
    }
    // 获取成员列表
    getMembersList(data) {
        // console.log(data)
        return this.apiService.post(`/user/getList`, data, true);
    }
    // 获取成员详情
    getMembersDetail(userId) {
        return this.apiService.get(`/user/getInfo?userId=${userId}`, {}, true);
    }
}

export default SearchService;