import type { ShopItemChangedEvent } from './shop-updates-slack-bot.types';
import type { ShopItemFieldDiff } from './shop-updates-slack-bot.diff';

type SlackBlock = Record<string, unknown>;

function escape(s: string): string {
  return s.replace(/[<>&]/g, (ch) => {
    if (ch === '<') return '&lt;';
    if (ch === '>') return '&gt;';
    if (ch === '&') return '&amp;';
    return ch;
  });
}

export function shopItemChangedBlocks(args: {
  event: ShopItemChangedEvent;
  diffs: ShopItemFieldDiff[];
  includeFieldDiffs: boolean;
  includeActor: boolean;
}): SlackBlock[] {
  const { event, diffs, includeFieldDiffs, includeActor } = args;

  const itemName =
    event.newValues.name ??
    event.oldValues.name ??
    '(unnamed item)';

  const actionEmoji =
    event.action === 'created' ? ':new:' :
    event.action === 'updated' ? ':pencil2:' :
    event.action === 'deleted' ? ':wastebasket:' :
    ':arrows_clockwise:';

  const actorLine =
    includeActor && event.actor?.name
      ? `\nActor: ${escape(event.actor.name)}`
      : includeActor && event.actor?.adminId
        ? `\nActor adminId: \`${escape(event.actor.adminId)}\``
        : '';

  const base: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${actionEmoji} Shop item ${event.action}`, emoji: true },
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          `*${escape(itemName)}*\n` +
          `Item ID: \`${escape(event.shopItemId)}\`\n` +
          `Time: \`${event.occurredAt.toISOString()}\`${actorLine}`,
      },
    },
  ];

  if (!includeFieldDiffs) return base;

  if (event.action === 'created') {
    const createdFields = Object.keys(event.newValues ?? {});
    const lines = createdFields.map(
      (f) => `• *${escape(f)}*: \`${escape(String((event.newValues as any)[f] ?? '—'))}\``,
    );
    return [
      ...base,
      {
        type: 'section',
        text: { type: 'mrkdwn', text: ['*Created fields:*', ...lines].join('\n') },
      },
    ];
  }

  if (event.action === 'deleted') {
    return [
      ...base,
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*Item deleted.*' },
      },
    ];
  }

  if (diffs.length === 0) {
    return [
      ...base,
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*No field changes detected.*' },
      },
    ];
  }

  const diffLines = diffs.map((d) => {
    const oldS = escape(String(d.oldValue ?? '—'));
    const newS = escape(String(d.newValue ?? '—'));
    return `• *${escape(d.field)}*: \`${oldS}\` → \`${newS}\``;
  });

  return [
    ...base,
    {
      type: 'section',
      text: { type: 'mrkdwn', text: ['*Field diffs:*', ...diffLines].join('\n') },
    },
  ];
}
