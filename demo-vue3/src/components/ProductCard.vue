<template>
  <div class="product-card">
    <router-link :to="`/product/${product.id}`" class="product-link">
      <div class="product-image">
        <img :src="product.image" :alt="product.name" />
        <div v-if="product.stock === 0" class="out-of-stock">缺货</div>
      </div>
      <div class="product-info">
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-description">{{ product.description }}</p>
        <div class="product-footer">
          <span class="product-price">¥{{ product.price.toLocaleString() }}</span>
          <span class="product-category">{{ product.category }}</span>
        </div>
      </div>
    </router-link>
    <button
      @click="handleAddToCart"
      :disabled="product.stock === 0"
      class="add-to-cart-btn"
      :class="{ disabled: product.stock === 0 }"
    >
      {{ product.stock === 0 ? '缺货' : '加入购物车' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../store/cart';
import type { Product } from '../store/products';

interface Props {
  product: Product
}

const props = defineProps<Props>()
const cartStore = useCartStore()

function handleAddToCart() {
  if (props.product.stock > 0) {
    cartStore.addToCart({
      id: props.product.id,
      name: props.product.name,
      price: props.product.price,
      image: props.product.image
    })
  }
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.product-link {
  text-decoration: none;
  color: inherit;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-image {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.out-of-stock {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.product-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.product-description {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.product-category {
  background: #f0f0f0;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  color: #666;
}

.add-to-cart-btn {
  margin: 0 1.5rem 1.5rem 1.5rem;
  padding: 0.8rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s, transform 0.2s;
}

.add-to-cart-btn:hover:not(.disabled) {
  opacity: 0.9;
  transform: scale(1.02);
}

.add-to-cart-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

