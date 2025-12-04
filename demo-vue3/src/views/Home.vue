<template>
  <div class="home">
    <div class="hero-section">
      <h1>欢迎来到我们的商城</h1>
      <p>发现最新最优质的产品</p>
    </div>

    <div class="filters">
      <button
        v-for="category in categories"
        :key="category"
        @click="selectedCategory = category"
        :class="['filter-btn', { active: selectedCategory === category }]"
      >
        {{ category || '全部' }}
      </button>
    </div>

    <div class="products-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>

    <div v-if="filteredProducts.length === 0" class="empty-state">
      <p>暂无商品</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ProductCard from '../components/ProductCard.vue';
import { useProductsStore } from '../store/products';

const productsStore = useProductsStore();
const selectedCategory = ref<string>('');

const categories = computed(() => {
  const cats = new Set(productsStore.products.map((p) => p.category));
  return ['', ...Array.from(cats)];
});

const filteredProducts = computed(() => {
  return productsStore.getProductsByCategory(selectedCategory.value);
});
</script>

<style scoped>
.home {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.hero-section {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 3rem;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
}

.hero-section p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.filters {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.6rem 1.5rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.filter-btn:hover {
  background: #f0f0f0;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.products-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: #999;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .hero-section h1 {
    font-size: 2rem;
  }
}
</style>
