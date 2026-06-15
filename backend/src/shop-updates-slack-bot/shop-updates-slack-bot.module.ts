import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ShopUpdatesSlackBotService } from './shop-updates-slack-bot.service';

@Module({
  imports: [ConfigModule],
  providers: [ShopUpdatesSlackBotService],
  exports: [ShopUpdatesSlackBotService],
})
export class ShopUpdatesSlackBotModule {}
