import ApiService from '../utils/ApiService';
// import store from '../store';
class FactoryService {
    constructor() {
        this.apiService = new ApiService();
        this.userDatas = JSON.parse(localStorage.getItem('userInfo'));
        this.nbUserId = { nbUserId: this.userDatas.id };
        this.outUserType = { outUserType: this.userDatas.outUserType };
    }
    // 获取数据生成列表
    getAlgorithmList(data){
        return this.apiService.post('/uncardOrder/getAlgorithmList', { ...data, ...this.nbUserId }, true);
    }
}

export default FactoryService;

