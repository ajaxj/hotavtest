import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue'),
    },
    //demo
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/About1View.vue'),
    },
    {
      path: '/demos/demo1',
      name: 'demo1',
      component: () => import('@/views/demos/Demo1View.vue')
    },
    {
      path: '/demos/demo2',
      name: 'demo2',
      component: () => import('@/views/demos/Demo2View.vue')
    }
  ],
})

export default router
