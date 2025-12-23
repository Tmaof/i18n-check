/* eslint-disable */
// @ts-nocheck
import { t } from 'i18next';


const message = t('这行应该被处理');
const node = <div>{ t('这行应该被处理') }</div>

// 测试：标记在注释中，应该禁用下一行
// i18n-disable-next-line
const node2 = <div>这行不应该被处理</div>

