import axios from 'axios';
import { ElLoading } from 'element-plus';
import { useRouter } from 'vue-router';

class ApiService {
  constructor(baseURL) { 
    this.api = axios.create({
      baseURL: baseURL || import.meta.env.VITE_API_BASE_URL, // 使用环境变量配置的API基础URL'
      timeout: 120000, // 请求超时时间
    });
    this.router = useRouter();
    this.$loading=[];
    // console.log(this.router)
    // 请求拦截器
    this.api.interceptors.request.use((config) => {
      if (config.requireAuth === false) return config;
      const token = this.getToken();
      if (token) {
        config.headers['Authorization'] = `${token}`;
      }
      return config;
    }, (error) => {
      // 对请求错误做些什么
      return Promise.reject(error);
    });

    // 响应拦截器
    this.api.interceptors.response.use((response) => {
      // 对响应数据做点什么
      return response;
    }, (error) => {
      // 对响应错误做点什么
      return Promise.reject(error);
    });

  }


  getToken() {
    return localStorage.getItem('token');
  }
  // New method for downloading files
  downloadFile(url, fileName, requireAuth = true) {

    return new Promise((resolve, reject) => {

      this.api.get(url, {
        requireAuth
      }).then(response => {
        if (response.status === 200) {
          if (response.data.code == 0) {
            console.log(response.data);
            reject(response.data.msg);
            return;
          }
          const contentDisposition = response.headers['content-disposition'];
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch) {
              fileName = fileNameMatch[1];
              fileName = decodeURIComponent(fileName);
            }
          }
          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          //link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          resolve();
        } else {
          reject("File download failed");
        }
      }).catch(error => {
        reject(error);
      });
    });
  }
  // API 调用方法
  get(url, params, requireAuth = true) {
    this.$loading.push(ElLoading.service({
      lock: true,
      text: '处理中...',
      background: 'rgba(0, 0, 0, 0.7)',
      customClass: 'loading'
    }));
    //EventBus.$emit('showloading');
    return new Promise((resolve, reject) => {
      this.api.get(url, { params, requireAuth }).then(response => {
        //EventBus.$emit('closeloading');
        this.$loading.forEach(item => {
          item.close();
        })
        if (response.status === 200) {
          switch (response.data.code) {
            case 1:
              resolve(response.data);
              break;
            case -1:
                this.router.push('/login');
                reject("请重新登录");
              break;
            default:
              reject(response.data.msg);
              break;
          }
        } else {
          reject("请求失败");
        }
      }).catch(error => {
        //EventBus.$emit('closeloading');
        reject(error);
      });
    })
  }

  post(url, data, requireAuth = true) {
    //EventBus.$emit('showloading');
    this.$loading.push(ElLoading.service({
      lock: true,
      text: '处理中...',
      background: 'rgba(0, 0, 0, 0.7)',
      customClass: 'loading'
    }));

    return new Promise((resolve, reject) => {
      this.api.post(url, data, { requireAuth }).then(response => {
        //EventBus.$emit('closeloading');
        // console.log("closeloading");
        this.$loading.forEach(item => {
          item.close();
        })
        if (response.status === 200) {
          switch (response.data.code) {
            case 1:
              resolve(response.data);
              break;
            case -1:
              this.router.push('/login');
              reject("请重新登录");
              break;
            default:
              reject(response.data.msg);
              break;
          }
        } else {
          reject("请求失败");
        }
      }).catch(error => {
        //EventBus.$emit('closeloading');
        // console.log(error)
        reject(error);
      });
    })
  }
}

export default ApiService;
