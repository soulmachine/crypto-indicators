import { strict as assert } from 'assert';
import crawl, { SUPPORTED_EXCHANGES, TradeMsg } from 'crypto-crawler';
import { MarketType, MARKET_TYPES } from 'crypto-markets';
import { createLogger, Heartbeat, Publisher } from 'utils';
import yargs from 'yargs';
import { calcPairs, REDIS_TOPIC_TRADE } from './common';

const EXCHANGE_THRESHOLD: { [key: string]: number } = {
  BitMEX: 900,
  Bitfinex: 600,
  Bitstamp: 240,
  CoinbasePro: 120,
  Huobi: 120,
  Kraken: 240,
  MXC: 120,
  WhaleEx: 120,
};

async function crawlTrade(
  exchange: string,
  marketType: MarketType,
  pairs: readonly string[],
): Promise<void> {
  pairs = Array.from(new Set(pairs)); // eslint-disable-line no-param-reassign

  const publisher = new Publisher<TradeMsg>(process.env.REDIS_URL || 'redis://localhost:6379');

  const logger = createLogger(`crawler-trade-${exchange}-${marketType}`);
  const heartbeat = new Heartbeat(logger, EXCHANGE_THRESHOLD[exchange] || 60);

  crawl(
    exchange,
    marketType,
    ['Trade'],
    pairs,
    async (msg): Promise<void> => {
      heartbeat.updateHeartbeat();

      publisher.publish(REDIS_TOPIC_TRADE, msg as TradeMsg);
    },
  );
}

const commandModule: yargs.CommandModule = {
  command: 'crawler_trade <exchange> <marketType>',
  describe: 'Crawl trades',
  // eslint-disable-next-line no-shadow
  builder: (yargs) =>
    yargs
      .positional('exchange', {
        choices: SUPPORTED_EXCHANGES,
        type: 'string',
        demandOption: true,
      })
      .positional('marketType', {
        choices: MARKET_TYPES,
        type: 'string',
        demandOption: true,
      }),
  handler: async (argv) => {
    const params: {
      exchange: string;
      marketType: MarketType;
    } = argv as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const pairs = await calcPairs(params.exchange, params.marketType);
    assert.ok(pairs.length > 0);

    await crawlTrade(params.exchange, params.marketType, pairs);
  },
};

export default commandModule;
