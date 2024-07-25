import ApiService from '../utils/ApiService';
class SearchService {
    constructor() {
        this.apiService = new ApiService();
    }
    // 获取部门列表层级
    GetDepartmentsList() {
        return this.apiService.get(`/dept/getListDict`, {}, true);
    }
    // 获取成员列表
    GetMembersList(data) {
        // console.log(data)
        return this.apiService.post(`/user/getList`, data, true);
    }
    // 获取成员详情
    GetMembersDetail(userId) {
        return this.apiService.get(`/user/getInfo?userId=${userId}`, {}, true);
    }
}

export default SearchService;