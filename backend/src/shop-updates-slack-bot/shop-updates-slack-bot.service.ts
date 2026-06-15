import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ShopItemChangedEvent, ShopUpdatesBotConfig } from './shop-updates-slack-bot.types';
import { ShopUpdatesSlackClient } from './shop-updates-slack-bot.slack';

@Injectable()
export class ShopUpdatesSlackBotService {
  private readonly logger = new Logger(ShopUpdatesSlackBotService.name);
  private readonly configured: boolean;

  private readonly slackClient?: ShopUpdatesSlackClient;

  constructor(private readonly configService: ConfigService) {
    const channelId = this.configService.get<string>('SLACK_SHOP_UPDATES_CHANNEL_ID') ?? '';
    const botToken = this.configService.get<string>('SLACK_SHOP_UPDATES_BOT_TOKEN') ?? '';

    const includeFieldDiffs =
      (this.configService.get<string>('SLACK_SHOP_UPDATES_INCLUDE_FIELD_DIFFS') ?? 'true') === 'true';

    const includeActor =
      (this.configService.get<string>('SLACK_SHOP_UPDATES_INCLUDE_ACTOR') ?? 'true') === 'true';

    const cfg: ShopUpdatesBotConfig = {
      channelId,
      botToken,
      includeFieldDiffs,
      includeActor,
    };

    this.configured = !!cfg.channelId && !!cfg.botToken;
    if (!this.configured) {
      this.logger.warn(
        'ShopUpdatesSlackBotService disabled: missing SLACK_SHOP_UPDATES_CHANNEL_ID and/or SLACK_SHOP_UPDATES_BOT_TOKEN',
      );
      return;
    }

    this.slackClient = new ShopUpdatesSlackClient({
      channelId: cfg.channelId,
      botToken: cfg.botToken,
      includeFieldDiffs: cfg.includeFieldDiffs,
      includeActor: cfg.includeActor,
    });
  }

  async notifyShopItemChanged(event: ShopItemChangedEvent): Promise<void> {
    if (!this.configured || !this.slackClient) return;

    const safeEvent: ShopItemChangedEvent = {
      ...event,
      occurredAt: event.occurredAt ?? new Date(),
      oldValues: event.oldValues ?? {},
      newValues: event.newValues ?? {},
    };

    try {
      await this.slackClient.postShopItemChanged(safeEvent);
    } catch (err) {
      this.logger.error(
        `Failed to post shop item update to Slack: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
