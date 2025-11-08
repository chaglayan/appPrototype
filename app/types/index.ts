export type UserCategory = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  category: UserCategory;
}

export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  currentPrice: number;
  change24h: number;
  isStablecoin?: boolean;
}

export interface ExternalWallet {
  id: string;
  cryptoId: string;
  address: string;
  label: string;
}

export interface Wallet {
  id: string;
  cryptoId: string;
  amount: number;
  address: string;
  isXcoinsWallet: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'usd_account' | 'credit_card' | 'debit_card' | 'skrill' | 'neteller';
  name: string;
  labels?: string[];
  fee: number;
  isInstant: boolean;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'swap' | 'topup' | 'withdraw' | 'deposit';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  fromCurrency?: string;
  toCurrency?: string;
  fromAmount?: number;
  toAmount?: number;
  usdAmount?: number;
  paymentMethod?: string;
  walletAddress?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  type: 'checking' | 'savings';
  bankName: string;
  icon: string;
  isVerified: boolean;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  usdBalance: number;
  wallets: Wallet[];
  externalWallets: ExternalWallet[];
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  notifications: Notification[];
  balancesHidden: boolean;
}
