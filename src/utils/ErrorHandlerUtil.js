/*
    ErrorHandlerUtil.js
    错误处理工具类
*/
import { ElMessage, ElMessageBox } from 'element-plus'

class ErrorHandlerUtil {
    constructor() {
    }
    // 显示错误信息
    showError(message) {
        ElMessage.error(message);
    }
    // 显示警告信息
    showWarning(message) {
        ElMessage.warning(message);
    }
    // 显示成功信息
    showSuccess(message) {
        ElMessage.success(message);
    }
    // 显示提示信息
    showInfo(message) {
        ElMessage.info(message);
    }
    // 显示确认框
    showConfirm(message, title = '提示', confirmButtonText = '确定', cancelButtonText = '取消') {
        return ElMessageBox.confirm(message, title, {
            confirmButtonText,
            cancelButtonText,
            type: 'warning'
        });
    }
}

export default ErrorHandlerUtil;