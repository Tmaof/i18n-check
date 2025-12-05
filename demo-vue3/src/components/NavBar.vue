<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="logo">
        <!-- 这是注释，不需要匹配 -->
        <h1>🛍️ {{ i18n.t('商城') }}</h1>
      </router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">{{ $t('首页') }}</router-link>
        <router-link to="/cart" class="nav-link cart-link">
          <span>{{ $t('购物车') }}</span>
          <span v-if="cartStore.totalItems > 0" class="cart-badge">
            {{ cartStore.totalItems }}
          </span>
        </router-link>
        <span>
          <span @click="changeLanguage">
            {{ language === 'zh' ? 'English' : '中文' }}
          </span>
        </span>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useCartStore } from '../store/cart';
import { ref } from 'vue';
// import { useI18n } from 'vue-i18n';
// const i18n = useI18n();
import i18n from '@/i18n';
const cartStore = useCartStore();

const language = ref<'zh' | 'en'>(
  (localStorage.getItem('language') || 'zh') as 'zh' | 'en',
);
const changeLanguage = () => {
  language.value = language.value === 'zh' ? 'en' : 'zh';
  // i18n.locale.value = language.value;
  // i18n.locale = language.value;
  localStorage.setItem('language', language.value);
  window.location.reload();
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  color: white;
}

.logo h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: opacity 0.3s;
  position: relative;
}

.nav-link:hover {
  opacity: 0.8;
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-badge {
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
