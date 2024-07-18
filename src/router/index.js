import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
const routes = [
  {
    path: '/',
    name: 'index',
    redirect: '/opencard',
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
    path: '/opencard',
    name: 'orderlist',
    component: ()=> import('../views/OpenCard/OrderListView.vue')
  },
  {
    path: '/opencard/orderlist/detail/:id',
    name: 'detail',
    component: ()=> import('../views/OpenCard/Detail/detail.vue')
  },
  {
    path: '/factory',
    name: 'factory',
    component: ()=> import('../views/Factory/index.vue')
  },
  {
    path: '/factory/detail/:id',
    name: 'auditDetails',
    component: ()=> import('../views/Factory/ui/details.vue')
  },
  {
    path: '/hrm',
    name: 'hrm',
    component: ()=> import('../views/hrm/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

//添加导航守卫
router.beforeEach((to, from, next) => {
  if (to.name !== 'login' && !localStorage.getItem('token')) {
    next({ name: 'login' })
  } else {
    next()
  }
  // next()
})

export default router
