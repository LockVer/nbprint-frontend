// store.js
import { createStore } from 'vuex';
import UserService from '@/services/UserService';
const userService = new UserService();
export default createStore({
  state() {
    return {
      userInfo: {},
      permissions: []
    };
  },
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
    },
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions;
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
