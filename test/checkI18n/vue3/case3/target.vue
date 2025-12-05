<template>
  <label>{{ i18n.t('联系电话') }}</label>
  <input
    v-model="form.phone"
    type="tel"
    required
    placeholder="{{ i18n.t('请输入联系电话') }}"
  />
  <!-- 这是注释，不需要匹配 -->
  <div>  <!-- 这是注释，
    不需要匹配 --> </div>
</template>

<script setup lang="ts">
import i18n from '@/i18n';
</script>
