<template>
  <div class="product-detail">
    <div v-if="product" class="detail-container">
      <div class="product-image-section">
        <img :src="product.image" :alt="product.name" />
      </div>
      <div class="product-info-section">
        <h1>{{ product.name }}</h1>
        <p class="category">{{ product.category }}</p>
        <p class="description">{{ product.description }}</p>
        <div class="price-section">
          <span class="price">¥{{ product.price.toLocaleString() }}</span>
          <span
            class="stock"
            :class="{
              'low-stock': product.stock < 10,
              'out-of-stock': product.stock === 0,
            }"
          >
            {{ product.stock === 0 ? '缺货' : `库存: ${product.stock}` }}
          </span>
        </div>
        <div class="actions">
          <div class="quantity-selector">
            <button @click="decreaseQuantity" :disabled="quantity <= 1">
              -
            </button>
            <span>{{ quantity }}</span>
            <button
              @click="increaseQuantity"
              :disabled="quantity >= product.stock"
            >
              +
            </button>
          </div>
          <button
            @click="handleAddToCart"
            :disabled="product.stock === 0"
            class="add-to-cart-btn"
            :class="{ disabled: product.stock === 0 }"
          >
            {{ product.stock === 0 ? '缺货' : '加入购物车' }}
          </button>
        </div>
        <div class="features">
          <div class="feature">
            <span class="icon">🚚</span>
            <span>免费配送</span>
          </div>
          <div class="feature">
            <span class="icon">↩️</span>
            <span>7天无理由退货</span>
          </div>
          <div class="feature">
            <span class="icon">🔒</span>
            <span>正品保证</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="not-found">
      <p>商品不存在</p>
      <router-link to="/" class="back-link">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../store/cart';
import { useProductsStore } from '../store/products';

const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const cartStore = useCartStore();

const quantity = ref(1);

const product = computed(() => {
  const id = Number(route.params.id);
  return productsStore.getProductById(id);
});

function increaseQuantity() {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++;
  }
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

function handleAddToCart() {
  if (product.value && product.value.stock > 0) {
    for (let i = 0; i < quantity.value; i++) {
      cartStore.addToCart({
        id: product.value.id,
        name: product.value.name,
        price: product.value.price,
        image: product.value.image,
      });
    }
    quantity.value = 1;
  }
}

onMounted(() => {
  if (!product.value) {
    router.push('/');
  }
});
</script>

<style scoped>
.product-detail {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.product-image-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.product-image-section img {
  width: 100%;
  height: auto;
  display: block;
}

.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-info-section h1 {
  font-size: 2.5rem;
  margin: 0;
  color: #333;
}

.category {
  background: #f0f0f0;
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: #666;
  font-size: 0.9rem;
}

.description {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #666;
  margin: 0;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
}

.stock {
  font-size: 1rem;
  color: #28a745;
}

.stock.low-stock {
  color: #ffc107;
}

.stock.out-of-stock {
  color: #dc3545;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem;
}

.quantity-selector button {
  width: 40px;
  height: 40px;
  border: none;
  background: #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s;
}

.quantity-selector button:hover:not(:disabled) {
  background: #ddd;
}

.quantity-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-selector span {
  min-width: 50px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.add-to-cart-btn {
  flex: 1;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    opacity 0.3s,
    transform 0.2s;
}

.add-to-cart-btn:hover:not(.disabled) {
  opacity: 0.9;
  transform: scale(1.02);
}

.add-to-cart-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}

.features {
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.feature .icon {
  font-size: 1.5rem;
}

.not-found {
  text-align: center;
  padding: 4rem 0;
}

.not-found p {
  font-size: 1.5rem;
  color: #999;
  margin-bottom: 2rem;
}

.back-link {
  display: inline-block;
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .detail-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .product-info-section h1 {
    font-size: 2rem;
  }

  .price {
    font-size: 2rem;
  }

  .features {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
