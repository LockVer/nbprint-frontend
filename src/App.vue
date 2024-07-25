<script setup lang="ts">
import LayoutHeader from './components/common/LayoutHeader.vue';
import LayoutNav from './components/common/LayoutNav.vue';
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { on } from 'json2csv/JSON2CSVTransform';

const store = useStore();
const router = useRouter();
const route = useRoute();

// 获取用户信息的函数
const fetchUserInfo = async () => {
  if (route.name !== 'login') {
    try {
      await store.dispatch('getUserInfo');
      const userInfo = store.state.userInfo;
      if (!userInfo || Object.keys(userInfo).length === 0) {
        // 如果没有获取到用户信息，跳转到登录页面
        router.push({ name: 'login' });
      }
    } catch (error) {
      // 错误处理，跳转到登录页面
      router.push({ name: 'login' });
    }
  }
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<template>
  <div class="page">
    <div class="header" v-if="route.name !== 'login'">
      <LayoutHeader />
    </div>
    <div class="content" v-if="route.name != 'login'">
      <div class="nav">
        <LayoutNav />
      </div>
      <div class="content-page"> <router-view /></div>
    </div>
    <router-view v-if="route.name === 'login'" />

  </div>
</template>

<style lang="scss">
@import url('./assets/icon/iconfont.css');

.page {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .content {
    display: flex;
    flex: 1;
    overflow: hidden;

    .nav {
      width: 280px;
      min-width: 280px;
    }

    .content-page {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      box-sizing: border-box;
      background-color: #E4E4E4;
    }
  }
}
</style>
