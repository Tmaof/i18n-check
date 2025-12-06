<template>
  <label>{{ i18n.t('联系电话') }}</label>
  <input
    v-model="form.phone"
    type="tel"
    required
    placeholder="请输入联系电话"
  />
<!-- 没有 script 标签，不进行引入i18n处理 -->
</template>
