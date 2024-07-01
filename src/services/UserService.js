import ApiService from '../utils/ApiService';
class UserService {
    constructor() {
        this.apiService = new ApiService();
    }
    Login(data) {
        return this.apiService.post('/auth/login', data, false);
    }
}

export default UserService;
