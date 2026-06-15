import { fetchWithTimeout } from '../fetch.util';
import type { ShopItemChangedEvent } from './shop-updates-slack-bot.types';
import { diffShopItemFields } from './shop-updates-slack-bot.diff';
import { shopItemChangedBlocks } from './shop-updates-slack-bot.templates';

export class ShopUpdatesSlackClient {
  constructor(
    private readonly config: {
      channelId: string;
      botToken: string;
      includeFieldDiffs: boolean;
      includeActor: boolean;
    },
  ) {}

  private async call(method: string, body: Record<string, unknown>) {
    const res = await fetchWithTimeout(`https://slack.com/api/${method}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.botToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data?.ok) return null;
    return data;
  }

  async postShopItemChanged(event: ShopItemChangedEvent): Promise<void> {
    const diffs = diffShopItemFields(event);

    const blocks = shopItemChangedBlocks({
      event,
      diffs,
      includeFieldDiffs: this.config.includeFieldDiffs,
      includeActor: this.config.includeActor,
    });

    await this.call('chat.postMessage', {
      channel: this.config.channelId,
      text: `Shop item ${event.action}`,
      blocks,
    });
  }
}
