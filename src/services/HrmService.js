import ApiService from '../utils/ApiService';
class searchService {
    constructor() {
        this.apiService = new ApiService('http://192.168.1.224:8084');
    }
    // 同步部门数据
    getDepartments() {
        return this.apiService.get('/dept/asyncList', {}, true);
    }
    // 获取部门列表
    // getDepartmentsList() {
    //     return this.apiService.get(`/dept/getListInfo?deptId=1`, {}, true);
    // }
    getDepartmentsList() {
        return this.apiService.get(`/dept/getListDict`, {}, true);
    }
    // 获取部门列表层级
    getDepartmentsListLevel() {
        return this.apiService.get(`/dept/getListInfo?deptId=1`, {}, true);
    }
    // 同步成员数据
    getMembers() {
        return this.apiService.get('/user/async?deptId=1', {}, true);
    }
    // 获取成员列表
    getMembersList() {
        return this.apiService.get('/user/getList?deptId=1', {}, true);
    }
}

export default searchService;