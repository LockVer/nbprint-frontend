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
    name: 'orderdetails',
    component: ()=> import('../views/OpenCard/OrderDetail/DetailView.vue')
  },
  {
    path: '/factoryaudit',
    name: 'factoryaudit',
    component: ()=> import('../views/OpenCard/FactoryAudit/FactoryAuditView.vue')
  },
  {
    path: '/factoryaudit/detail/:id',
    name: 'auditdetails',
    component: ()=> import('../views/OpenCard/FactoryAudit/AuditDetails/DetailView.vue')
  },
  {
    path: '/PersonnelManagement',
    name: 'PersonnelManagement',
    component: ()=> import('../views/OpenCard/PersonnelManagement/PersonnelManagementView.vue')
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
