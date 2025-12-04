/* eslint-disable */
// @ts-nocheck
import { t } from 'i18next';
// 模版字符串中包含中文，但是所有中文已经被i18n包裹
const a = `${t('攻击数量')}<br /> <span style="color: orange"></span>`;
// 下面的需要处理
const b = t(`中文 ${xxx}`);
