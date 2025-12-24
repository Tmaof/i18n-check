/* eslint-disable */
// @ts-nocheck
// 测试是否可以正确获取 i18nTextKeyList
import { t } from 'i18next';

export const translatePolicyRule = (record: BlackWhiteListItem) => {
    const { policy_rule } = record;
    if (!policy_rule || !policy_rule.binding || policy_rule.binding.length === 0) return <EmptyText />;
    const type = policy_rule.binding[0].binding_type === 'Global' ? t('全局规则') : t('应用自定义规则');
    return   `${type} ${policy_rule.name} (${policy_rule.id}) ${t('生成')}`;

  };

<div>
{
    t( '当前 WAF 攻击总数为 {total}{param1}。{param2}{param3}' , {
    total: totalCount.total,
    param1: totalCount.unknown ? t( '（含未知地理位置攻击{count}）' , {count: totalCount.unknown}) : '',
    param2: mapAreas.includes(MapArea.china) ? (t( '中国攻击总数为 {total}', { total: totalCount.china }) + (mapAreas.includes(MapArea.world) ? '，' : '')) : '',
    param3: mapAreas.includes(MapArea.world) ? t( '其他国家攻击总数为 {total}', { total: totalCount.world }) : ''
    })
}
</div>
