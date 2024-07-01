<script setup lang="ts">
import LayoutHeader from './components/common/LayoutHeader.vue';
import LayoutNav from './components/common/LayoutNav.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="page">
    <div class="header" v-if="route.name!=='login'">
      <LayoutHeader />
    </div>
    <div class="content" v-if="route.name!='login'">
      <div class="nav">
        <LayoutNav />
      </div>
      <div class="content-page"> <router-view /></div>
    </div>
    <router-view v-if="route.name==='login'" />
    
  </div>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .content {
    display: flex;
    flex: 1;
    .nav {
      width: 280px;
    }
    .content-page {
      flex: 1;
      padding: 20px;
      background-color: #E4E4E4;
    }
  }
}
</style>
