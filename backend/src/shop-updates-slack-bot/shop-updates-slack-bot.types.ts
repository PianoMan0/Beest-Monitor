export type ShopItemUpdateFields = Partial<{
  name: string;
  description: string;
  detailedDescription: string | null;
  imageUrl: string;
  priceHours: number;
  stock: number | null;
  estimatedShip: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}>;

export type ShopItemChangedAction = 'created' | 'updated' | 'deleted' | 'reordered';

export type ShopItemChangedEvent = {
  action: ShopItemChangedAction;
  shopItemId: string;

  occurredAt: Date;

  oldValues: ShopItemUpdateFields;
  newValues: ShopItemUpdateFields;

  actor?: {
    adminId?: string;
    slackId?: string;
    name?: string;
  };
};

export type ShopUpdatesBotConfig = {
  channelId: string;
  botToken: string;
  includeFieldDiffs: boolean;
  includeActor: boolean;
};
