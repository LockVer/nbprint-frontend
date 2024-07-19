import ApiService from '../utils/ApiService';
class searchService {
    constructor() {
        this.apiService = new ApiService('http://192.168.1.224:8084');
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

export default searchService;