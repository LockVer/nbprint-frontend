class Communicator {
    constructor() {
      console.log('Communicator 实例已创建');
      this.data = new Proxy({}, {
        get: (target, prop) => {
          return target[prop];
        },
        set: (target, prop, value) => {
          //console.log(`设置 ${prop} 的值为:`, value);
          target[prop] = value;
          this.notifyChange(prop, value);
          return true;
        },
        deleteProperty: (target, prop) => {
          //console.log(`删除 ${prop} 的值`);
          delete target[prop];
          this.notifyChange(prop, undefined);
          return true;
        }
      });
      this.dataKeys = new Set();
      this.listeners = {};
    }
  
    // 添加一个特定键的变化监听器的方法
    addChangeListener(key, listener) {
      if (!this.listeners[key]) {
        this.listeners[key] = [];
      }
      this.listeners[key].push(listener);
    }
  
    // 当键的值变化时通知监听器的方法
    notifyChange(key, value) {
      if (this.listeners[key]) {
        this.listeners[key].forEach(listener => listener(value));
      }
      if (value !== undefined) {
        this.dataKeys.add(key);
      } else {
        this.dataKeys.delete(key);
      }
    }
  
    // 获取所有键的方法
    getAllKeys() {
      return Array.from(this.dataKeys);
    }
  
    // 获取所有数据的方法
    getAllData() {
      return Object.assign({}, this.data);
    }
  
    // 检查某个键是否存在的方法
    hasKey(key) {
      return this.dataKeys.has(key);
    }
  
    // 检查某个键的值是否为空的方法
    isEmpty(key) {
      const value = this.data[key];
      return value === null || value === undefined || value === '';
    }
  
    // 清除所有数据的方法
    clearAllData() {
      this.dataKeys.forEach(key => {
        delete this.data[key];
      });
      this.dataKeys.clear();
    }
  
    // 删除特定键的方法
    deleteKey(key) {
      if (this.dataKeys.has(key)) {
        delete this.data[key];
        this.dataKeys.delete(key);
        this.notifyChange(key, undefined);
      }
    }
  
    // 获取某个键的值类型的方法
    getType(key) {
      const value = this.data[key];
      return typeof value;
    }
  }
  
  export default Communicator;
  