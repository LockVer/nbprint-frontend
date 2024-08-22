// store.js
import { createStore } from 'vuex';
import UserService from '@/services/UserService';
const userService = new UserService();
export default createStore({
  state() {
    return {
      userInfo: {},
      permissions: [],
      // 用于表示是否是点击清空后的标识，默认为true  如果点击则表示false
      isPrizeDialogShow: true,
    };
  },
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
    },
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions;
    },
    SET_PRIZEdIALOGSHOW(state, isPrizeDialogShow) {
      state.isPrizeDialogShow = isPrizeDialogShow;
    }
  },
  actions: {
    setUserInfo({ commit }, userInfo) {
      commit('SET_USER_INFO', userInfo);
    },
    setPermissions({ commit }, permissions) {
      commit('SET_PERMISSIONS', permissions);
    },
    async getUserInfo({ commit }) {
      try {
        const response = await userService.getUserInfo();
        commit('SET_USER_INFO', response.data);
      } catch (error) {
        console.error(error);
      }
    },
    async getPermissions({ commit }) {
      try {
        const response = await userService.getPermissions();
        commit('SET_PERMISSIONS', response.data);
      } catch (error) {
        console.error(error);
      }
    }
  }
});
