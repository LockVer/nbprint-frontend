import ApiService from '../utils/ApiService';
class UserService {
    constructor() {
        this.apiService = new ApiService();
    }
    Login(data) {
        return this.apiService.post('/auth/login', data, false);
    }
    GetUserInfo() {
        return this.apiService.get('/auth/getUserinfo',{},true);
    }
    GetPermissions() {
        return this.apiService.get('/auth/permissions');
    }
}

export default UserService;
