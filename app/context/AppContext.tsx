import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, Transaction, Notification, User, Wallet, ExternalWallet } from '../types';

interface AppContextType extends AppState {
  login: (user: User) => void;
  register: (user: User) => void;
  logout: () => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  updateUsdBalance: (amount: number) => void;
  createWallet: (cryptoId: string) => void;
  updateWallet: (cryptoId: string, amount: number) => void;
  addExternalWallet: (wallet: Omit<ExternalWallet, 'id'>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  toggleBalancesHidden: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    isAuthenticated: false,
    usdBalance: 0,
    wallets: [],
    externalWallets: [],
    transactions: [],
    notifications: [],
    balancesHidden: false,
  });

  const generateWalletAddress = (cryptoId: string): string => {
    const prefixes: { [key: string]: string } = {
      bitcoin: '1',
      ethereum: '0x',
      binancecoin: '0x',
      solana: 'Sol',
      ripple: 'r',
      cardano: 'addr1',
      avalanche: '0x',
      polkadot: '1',
      polygon: '0x',
      chainlink: '0x',
      tether: '0x',
      'usd-coin': '0x',
      dai: '0x',
      'binance-usd': '0x',
    };
    const prefix = prefixes[cryptoId] || '';
    const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return prefix + randomStr;
  };

  const login = (user: User) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
      usdBalance: 10000.00,
      wallets: [
        { id: '1', cryptoId: 'bitcoin', amount: 0.5, address: generateWalletAddress('bitcoin'), isXcoinsWallet: true },
        { id: '2', cryptoId: 'ethereum', amount: 2.5, address: generateWalletAddress('ethereum'), isXcoinsWallet: true },
        { id: '3', cryptoId: 'solana', amount: 10.0, address: generateWalletAddress('solana'), isXcoinsWallet: true },
      ],
    }));
  };

  const register = (user: User) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
      usdBalance: 0,
      wallets: [],
    }));
  };

  const logout = () => {
    setState({
      user: null,
      isAuthenticated: false,
      usdBalance: 0,
      wallets: [],
      externalWallets: [],
      transactions: [],
      notifications: [],
      balancesHidden: false,
    });
  };

  const addTransaction = (transaction: Transaction) => {
    setState(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions],
    }));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  };

  const updateUsdBalance = (amount: number) => {
    setState(prev => ({
      ...prev,
      usdBalance: prev.usdBalance + amount,
    }));
  };

  const createWallet = (cryptoId: string) => {
    setState(prev => {
      const existingWallet = prev.wallets.find(w => w.cryptoId === cryptoId && w.isXcoinsWallet);
      if (existingWallet) {
        return prev; // Wallet already exists
      }

      const newWallet: Wallet = {
        id: Math.random().toString(36).substring(7),
        cryptoId,
        amount: 0,
        address: generateWalletAddress(cryptoId),
        isXcoinsWallet: true,
      };

      return {
        ...prev,
        wallets: [...prev.wallets, newWallet],
      };
    });
  };

  const updateWallet = (cryptoId: string, amount: number) => {
    setState(prev => {
      const existingWallet = prev.wallets.find(w => w.cryptoId === cryptoId && w.isXcoinsWallet);

      if (existingWallet) {
        return {
          ...prev,
          wallets: prev.wallets.map(w =>
            w.cryptoId === cryptoId && w.isXcoinsWallet
              ? { ...w, amount: w.amount + amount }
              : w
          ),
        };
      } else {
        const newWallet: Wallet = {
          id: Math.random().toString(36).substring(7),
          cryptoId,
          amount,
          address: generateWalletAddress(cryptoId),
          isXcoinsWallet: true,
        };
        return {
          ...prev,
          wallets: [...prev.wallets, newWallet],
        };
      }
    });
  };

  const addExternalWallet = (wallet: Omit<ExternalWallet, 'id'>) => {
    setState(prev => ({
      ...prev,
      externalWallets: [
        ...prev.externalWallets,
        {
          ...wallet,
          id: Math.random().toString(36).substring(7),
        },
      ],
    }));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
    }));

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  };

  const toggleBalancesHidden = () => {
    setState(prev => ({
      ...prev,
      balancesHidden: !prev.balancesHidden,
    }));
  };

  const value: AppContextType = {
    ...state,
    login,
    register,
    logout,
    addTransaction,
    updateTransaction,
    updateUsdBalance,
    createWallet,
    updateWallet,
    addExternalWallet,
    addNotification,
    removeNotification,
    toggleBalancesHidden,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
