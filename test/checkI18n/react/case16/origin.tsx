/* eslint-disable */
// @ts-nocheck
// 这里会匹配出 模版字符串
import i18n from '@/utils/i18n';
export function vaildatePassword (password: string) {
  const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([~!@#$%^&*()_+`\-={}:";'<>?,.\/]?).{8,64}$/;
  return reg.test(password);
}

// 必须包含大小写字母，数字，特殊字符四项 8-16位
export function vaildatePasswordNew (password: string) {
  const reg = /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,64}$/;
  return reg.test(password);
}

// 字符集定义
const CHAR_SETS = {
  digit: '0123456789'.split(''),
  lower: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  special: '~!@#$%^&*()_+`-={}:";<>?,./\\'.split('')
};
