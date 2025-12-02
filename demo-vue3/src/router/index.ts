import { createRouter, createWebHistory } from 'vue-router';
import Cart from '../views/Cart.vue';
import Checkout from '../views/Checkout.vue';
import Home from '../views/Home.vue';
import ProductDetail from '../views/ProductDetail.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetail,
      props: true,
    },
    {
      path: '/cart',
      name: 'cart',
      component: Cart,
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: Checkout,
    },
  ],
});

export default router;
