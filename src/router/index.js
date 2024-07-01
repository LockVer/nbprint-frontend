import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login/LoginView.vue')
  },
  {
    path: '/opencard/createorder',
    name: 'createorder',
    component: ()=> import('../views/OpenCard/CreateOrderView.vue')
  },
  {
    path: '/opencard/orderlist',
    name: 'orderlist',
    component: ()=> import('../views/OpenCard/OrderListView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

//添加导航守卫
router.beforeEach((to, from, next) => {
  if (to.name !== 'login' && !localStorage.getItem('token')) {
    next({ name: 'login' })
  } else {
    next()
  }
  next()
})

export default router
