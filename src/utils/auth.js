export function checkIfUserIsAuthenticated() {
    // 在这里编写检查用户是否已登录的逻辑
    // 返回 true 表示已登录，返回 false 表示未登录
    return localStorage.getItem('token') ? true : false;
}