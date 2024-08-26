import ApiService from '../utils/ApiService';
class FactoryService {
    constructor() {
        this.apiService = new ApiService();
        this.userDatas = JSON.parse(localStorage.getItem('userInfo'));
        this.nbUserId = { nbUserId: this.userDatas.id };
        this.outUserType = { outUserType: this.userDatas.outUserType };
    }

    getFactoryList(data) {
        return this.apiService.post('/check/getList', data, true);
    }
    // 审核锁单
    auditLock(data) {
        console.log(data)
        return this.apiService.post(`/check/lock`, { "checkId":data, ...this.nbUserId }, true);
    }
    // 审核解单
    auditUnlock(data) {
        return this.apiService.post(`/check/unlock?id=${data}`, {}, true);
    }
    // 提交工厂审核
    submitFactoryAudit(data) {
        return this.apiService.post('/check/submit', { ...data, ...this.nbUserId, ...this.outUserType }, true);
    }
}

export default FactoryService;

