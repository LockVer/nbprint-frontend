import ApiService from '../utils/ApiService';
class UserService {
    constructor() {
        this.apiService = new ApiService();
    }
    login(data) {
        return this.apiService.post('/auth/login', data, false);
    }
    getUserInfo() {
        return this.apiService.get('/auth/getUserinfo',{},true);
    }
    getPermissions() {
        return this.apiService.get('/auth/permissions');
    }
}

export default UserService;
