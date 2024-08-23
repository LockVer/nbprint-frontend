import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'



const routes = [
  // 首页
  {
    path: '/',
    name: 'index',
    redirect: '/opencard',
    component: HomeView
  },
  // 登录
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login/LoginView.vue')
  },
  // 创建订单
  {
    path: '/opencard/createorder',
    name: 'createorder',
    component: () => import('../views/OpenCard/CreateOrder/CreateOrderView.vue')
  },
  // 订单列表
  {
    path: '/opencard',
    name: 'orderlist',
    component: () => import('../views/OpenCard/OrderListView.vue')
  },
  // 订单详情
  {
    path: '/opencard/orderlist/detail/:id',
    name: 'orderdetails',
    component: () => import('../views/OpenCard/OrderDetail/DetailView.vue')
  },
  // 工厂审核
  {
    path: '/factoryaudit',
    name: 'factoryaudit',
    component: () => import('../views/OpenCard/FactoryAudit/FactoryAuditView.vue')
  },
  // 工厂审核详情
  {
    path: '/factoryaudit/detail/:id',
    name: 'auditdetails',
    component: () => import('../views/OpenCard/FactoryAudit/AuditDetails/DetailView.vue')
  },
  // 人员管理
  {
    path: '/PersonnelManagement',
    name: 'PersonnelManagement',
    component: () => import('../views/OpenCard/PersonnelManagement/PersonnelManagementView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

//添加导航守卫
router.beforeEach((to, from, next) => {
  if (to.name == 'login') {
    if (to.query.token) {
      localStorage.setItem('token', to.query.token);
      next({ name: 'orderlist' })
    } 
  }
  if (to.name !== 'login' && !localStorage.getItem('token')) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
