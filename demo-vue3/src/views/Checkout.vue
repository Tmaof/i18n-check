<template>
  <div class="checkout">
    <div class="checkout-container">
      <h1>结算</h1>

      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <p>购物车是空的</p>
        <router-link to="/" class="shop-link">去购物</router-link>
      </div>

      <div v-else class="checkout-content">
        <div class="checkout-form">
          <h2>收货信息</h2>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>收货人姓名</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="请输入收货人姓名"
              />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input
                v-model="form.phone"
                type="tel"
                required
                placeholder="请输入联系电话"
              />
            </div>
            <div class="form-group">
              <label>收货地址</label>
              <textarea
                v-model="form.address"
                required
                placeholder="请输入详细收货地址"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>备注</label>
              <textarea
                v-model="form.notes"
                placeholder="选填：订单备注信息"
                rows="3"
              ></textarea>
            </div>
          </form>
        </div>

        <div class="order-summary">
          <h2>订单详情</h2>
          <div class="order-items">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="order-item"
            >
              <img :src="item.image" :alt="item.name" class="item-image" />
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p>¥{{ item.price.toLocaleString() }} × {{ item.quantity }}</p>
              </div>
              <span class="item-total"
                >¥{{ (item.price * item.quantity).toLocaleString() }}</span
              >
            </div>
          </div>

          <div class="summary-section">
            <div class="summary-row">
              <span>商品总数：</span>
              <span>{{ cartStore.totalItems }} 件</span>
            </div>
            <div class="summary-row">
              <span>运费：</span>
              <span>免费</span>
            </div>
            <div class="summary-row total">
              <span>总计：</span>
              <span class="total-price"
                >¥{{ cartStore.totalPrice.toLocaleString() }}</span
              >
            </div>
          </div>

          <button
            @click="handleSubmit"
            class="submit-btn"
            :disabled="submitting"
          >
            {{ submitting ? '提交中...' : '提交订单' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../store/cart';

const router = useRouter();
const cartStore = useCartStore();
const submitting = ref(false);

const form = ref({
  name: '',
  phone: '',
  address: '',
  notes: '',
});

function handleSubmit() {
  if (submitting.value) return;

  submitting.value = true;

  // 模拟提交订单
  setTimeout(() => {
    alert(
      '订单提交成功！\n\n订单信息：\n' +
        `收货人：${form.value.name}\n` +
        `电话：${form.value.phone}\n` +
        `地址：${form.value.address}\n` +
        `总金额：¥${cartStore.totalPrice.toLocaleString()}\n\n` +
        '感谢您的购买！',
    );

    cartStore.clearCart();
    submitting.value = false;
    router.push('/');
  }, 1000);
}
</script>

<style scoped>
.checkout {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.checkout-container h1 {
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

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.checkout-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.checkout-form h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.order-summary {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.order-summary h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #333;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
}

.order-item {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.order-item .item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  margin: 0 0 0.3rem 0;
  font-size: 1rem;
  color: #333;
}

.item-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.item-total {
  font-weight: 600;
  color: #667eea;
}

.summary-section {
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  font-size: 1rem;
  color: #666;
}

.summary-row.total {
  border-top: 2px solid #eee;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.total-price {
  color: #667eea;
  font-size: 1.5rem;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition:
    opacity 0.3s,
    transform 0.2s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: scale(1.02);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 968px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}
</style>
