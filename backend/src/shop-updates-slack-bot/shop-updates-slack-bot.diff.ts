import type { ShopItemChangedEvent, ShopItemUpdateFields } from './shop-updates-slack-bot.types';

export type ShopItemFieldDiff = {
  field: string;
  oldValue: unknown;
  newValue: unknown;
};

function fieldsUnion(oldValues: ShopItemUpdateFields, newValues: ShopItemUpdateFields): string[] {
  const keys = new Set<string>([
    ...Object.keys(oldValues ?? {}),
    ...Object.keys(newValues ?? {}),
  ]);
  return Array.from(keys);
}

export function diffShopItemFields(event: ShopItemChangedEvent): ShopItemFieldDiff[] {
  const keys = fieldsUnion(event.oldValues, event.newValues);
  const diffs: ShopItemFieldDiff[] = [];

  for (const field of keys) {
    const oldValue = (event.oldValues as any)?.[field];
    const newValue = (event.newValues as any)?.[field];

    // strict diff: null vs undefined treated as different (good for admin audit clarity)
    if (oldValue === newValue) continue;

    diffs.push({ field, oldValue, newValue });
  }

  return diffs;
}
