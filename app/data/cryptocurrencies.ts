import { Cryptocurrency } from '../types';

export const cryptocurrencies: Cryptocurrency[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    currentPrice: 67845.32,
    change24h: 2.45,
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    currentPrice: 3421.18,
    change24h: -1.23,
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    icon: '◆',
    currentPrice: 612.45,
    change24h: 1.87,
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    icon: '◎',
    currentPrice: 178.92,
    change24h: 5.67,
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    icon: '✕',
    currentPrice: 0.62,
    change24h: 0.45,
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    icon: '₳',
    currentPrice: 0.58,
    change24h: -0.89,
  },
  {
    id: 'avalanche',
    symbol: 'AVAX',
    name: 'Avalanche',
    icon: '▲',
    currentPrice: 38.67,
    change24h: 4.21,
  },
  {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    icon: '●',
    currentPrice: 7.23,
    change24h: 3.12,
  },
  {
    id: 'polygon',
    symbol: 'MATIC',
    name: 'Polygon',
    icon: '⬢',
    currentPrice: 0.89,
    change24h: -2.34,
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    icon: '⬡',
    currentPrice: 14.56,
    change24h: 1.98,
  },
  // Stablecoins
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    icon: '₮',
    currentPrice: 1.00,
    change24h: 0.01,
    isStablecoin: true,
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '$',
    currentPrice: 1.00,
    change24h: -0.01,
    isStablecoin: true,
  },
  {
    id: 'dai',
    symbol: 'DAI',
    name: 'Dai',
    icon: '◈',
    currentPrice: 1.00,
    change24h: 0.00,
    isStablecoin: true,
  },
  {
    id: 'binance-usd',
    symbol: 'BUSD',
    name: 'Binance USD',
    icon: 'Ⓑ',
    currentPrice: 1.00,
    change24h: 0.00,
    isStablecoin: true,
  },
];

export const getCryptoById = (id: string): Cryptocurrency | undefined => {
  return cryptocurrencies.find(crypto => crypto.id === id);
};

export const getCryptoBySymbol = (symbol: string): Cryptocurrency | undefined => {
  return cryptocurrencies.find(crypto => crypto.symbol === symbol);
};
