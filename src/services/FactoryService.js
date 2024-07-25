import ApiService from '../utils/ApiService';
class FactoryService {
    constructor() {
        this.apiService = new ApiService();
        this.userDatas = JSON.parse(localStorage.getItem('userInfo'));
        this.wechatUserId = { wechatUserId: this.userDatas.wechatUserId };
    }
    // 获取工厂审核列表
    getFactoryList(data) {
        return this.apiService.post('/check/getList', data, true);
    }
    // 审核锁单
    checkLock(data) {
        return this.apiService.post(`/check/lock`, { "id": data, ...this.wechatUserId }, true);
    }
    // 审核解单
    checkUnlock(data) {
        return this.apiService.post(`/check/unlock?id=${data}`, {}, true);
    }
    // 提交工厂审核
    submitFactoryCheck(data) {
        return this.apiService.post('/check/submit', { ...data, ...this.wechatUserId }, true);
    }
}

export default FactoryService;

