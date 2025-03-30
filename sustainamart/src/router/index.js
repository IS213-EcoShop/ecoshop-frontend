import { createRouter, createWebHistory } from 'vue-router'

// Import views based on your updated structure
import About from '../views/About.vue'
import Marketplace from '../views/Marketplace.vue'
import Rewards from '../views/Rewards.vue'
import TradeIn from '../views/TradeIn.vue'
import ContactSupport from '../views/ContactSupport.vue'
import Cart from '../views/Cart.vue' // Adjust the path as per your structure
import ProductDetail from '../views/ProductDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/contact',
      name: 'contact',
      component: ContactSupport, // If this is your default page, use it as the home
    },
    {
      path: '/about',
      name: 'home',
      component: About, 
    },
    {
      path: '/',
      redirect: '/about',
    },
    {
      path: '/marketplace',
      name: 'marketplace',
      component: Marketplace,
    },
    {
      path: '/rewards',
      name: 'rewards',
      component: Rewards,
    },
    {
      path: '/trade-in',
      name: 'trade-in',
      component: TradeIn,
    },
    {
      path: '/cart',
      name: 'cart',
      component: Cart,
    },
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: ProductDetail, 
      props: true 
    }
  ],
})

export default router
