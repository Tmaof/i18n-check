<template>
  <div class="cart">
    <div class="cart-container">
      <h1>购物车</h1>

      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <p>购物车是空的</p>
        <router-link to="/" class="shop-link">去购物</router-link>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-price">¥{{ item.price.toLocaleString() }}</p>
            </div>
            <div class="item-quantity">
              <button @click="decreaseQuantity(item.id)">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQuantity(item.id)">+</button>
            </div>
            <div class="item-total">
              <span>¥{{ (item.price * item.quantity).toLocaleString() }}</span>
            </div>
            <button @click="removeItem(item.id)" class="remove-btn">×</button>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>商品总数：</span>
            <span>{{ cartStore.totalItems }} 件</span>
          </div>
          <div class="summary-row total">
            <span>总计：</span>
            <span class="total-price"
              >¥{{ cartStore.totalPrice.toLocaleString() }}</span
            >
          </div>
          <router-link to="/checkout" class="checkout-btn">
            去结算
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../store/cart';

const cartStore = useCartStore();

function increaseQuantity(productId: number) {
  const item = cartStore.items.find((item) => item.id === productId);
  if (item) {
    cartStore.updateQuantity(productId, item.quantity + 1);
  }
}

function decreaseQuantity(productId: number) {
  const item = cartStore.items.find((item) => item.id === productId);
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(productId, item.quantity - 1);
  } else if (item) {
    cartStore.removeFromCart(productId);
  }
}

function removeItem(productId: number) {
  cartStore.removeFromCart(productId);
}
</script>

<style scoped>
.cart {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.cart-container h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #333;
}

.empty-cart {
  text-align: center;
  padding: 4rem 0;
}

.empty-cart p {
  font-size: 1.5rem;
  color: #999;
  margin-bottom: 2rem;
}

.shop-link {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 120px 1fr 150px 120px 40px;
  gap: 1.5rem;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.item-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.item-price {
  color: #666;
  font-size: 0.9rem;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-self: center;
}

.item-quantity button {
  width: 35px;
  height: 35px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.item-quantity button:hover {
  background: #f0f0f0;
  border-color: #667eea;
}

.item-quantity span {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
}

.item-total {
  text-align: right;
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
}

.remove-btn {
  width: 35px;
  height: 35px;
  border: none;
  background: #ff4757;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  transition: background 0.3s;
}

.remove-btn:hover {
  background: #ff3838;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  font-size: 1.1rem;
  color: #666;
}

.summary-row.total {
  border-top: 2px solid #eee;
  margin-top: 1rem;
  padding-top: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.total-price {
  color: #667eea;
  font-size: 1.5rem;
}

.checkout-btn {
  display: block;
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  text-align: center;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  transition:
    opacity 0.3s,
    transform 0.2s;
}

.checkout-btn:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

@media (max-width: 968px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 100px 1fr;
    gap: 1rem;
  }

  .item-quantity,
  .item-total {
    grid-column: 2;
    justify-self: start;
  }

  .remove-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .cart-summary {
    position: static;
  }
}
</style>
