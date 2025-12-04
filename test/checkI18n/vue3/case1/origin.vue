<template>
  <nav class="navbar">{{ i18n.t('中文') }}</nav>
</template>

<script setup lang="ts">
import i18n from '@/i18n';
/* eslint-disable */
// @ts-nocheck
import { useCartStore } from '../store/cart';

const cartStore = useCartStore();
</script>
