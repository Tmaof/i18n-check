<template>
  <label>{{ i18n.t('联系电话') }}</label>
  <input
    v-model="form.phone"
    type="tel"
    required
    placeholder="{{ i18n.t('请输入联系电话') }}"
  />
</template>

<script setup lang="ts">
import i18n from '@/i18n';
/* eslint-disable */
// @ts-nocheck
// 测试包裹props
</script>
