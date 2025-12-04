/* eslint-disable */
// @ts-nocheck
import { t } from 'i18next';
// 嵌套的模版字符串
<b>
{t(
  /** 此模版字符串中包含中文 */ `点击确认 ${
    type === white ? '加白' : `阻断 ${xxxx}`
  }是否继续？`
)}
</b>
