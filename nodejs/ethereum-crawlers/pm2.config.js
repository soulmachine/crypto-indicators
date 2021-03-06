const apps = [
  {
    name: 'crawler_block_header',
    script: 'dist/cli.js',
    args: 'crawler_block_header',
    exec_mode: 'fork', // cluster mode is incompatible with pm2-runtime !!!
    instances: 1,
  },
  {
    name: 'crawler_gas_price',
    script: 'dist/cli.js',
    args: 'crawler_gas_price',
    exec_mode: 'fork',
    instances: 1,
  },
  {
    name: 'eth_miner_revenue',
    script: 'dist/cli.js',
    args: 'eth_miner_revenue',
    exec_mode: 'fork',
    instances: 1,
  },
];

module.exports = {
  apps,
};
