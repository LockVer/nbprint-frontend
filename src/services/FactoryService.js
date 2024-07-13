import ApiService from '../utils/ApiService';
class FactoryService {
    constructor() {
        this.apiService = new ApiService();
    }
    // 获取工厂审核列表
    GetFactoryList(data) {
        return this.apiService.post('/check/getList', data, true);
    }
    // 审核锁单
    CheckLock(data) {
        return this.apiService.post(`/check/lock?id=${data}`, {}, true);
    }
    // 审核解单
    CheckUnlock(data) {
        return this.apiService.post(`/check/unlock?id=${data}`, {}, true);
    }
}

export default FactoryService;

