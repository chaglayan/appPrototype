import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getCryptoById } from '../data/cryptocurrencies';
import { formatCurrency, maskValue } from '../utils/format';

export const BalanceOverview: React.FC = () => {
  const navigate = useNavigate();
  const { usdBalance, wallets, balancesHidden, toggleBalancesHidden } = useApp();

  // Calculate total wallet value in USD
  const totalWalletValue = wallets.reduce((total, wallet) => {
    const crypto = getCryptoById(wallet.cryptoId);
    if (!crypto) return total;
    return total + (wallet.amount * crypto.currentPrice);
  }, 0);

  const totalBalance = usdBalance + totalWalletValue;
  const hasUsdBalance = usdBalance > 0;

  return (
    <>
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 shadow-lg text-white">
        {/* Total Balance Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-blue-100 mb-1">Total Balance</p>
            <p className="text-4xl font-bold">
              {maskValue(formatCurrency(totalBalance), balancesHidden)}
            </p>
          </div>
          <button
            onClick={toggleBalancesHidden}
            className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors backdrop-blur-sm"
            title={balancesHidden ? 'Show balances' : 'Hide balances'}
          >
            {balancesHidden ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        {/* Account Cards */}
        <div className="space-y-3">
          {/* USD Account */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 border border-white border-opacity-20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
                  💵
                </div>
                <div>
                  <p className="text-xs text-blue-100">USD Account</p>
                  <p className="text-xl font-bold">
                    {maskValue(formatCurrency(usdBalance), balancesHidden)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/topup')}
                  className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors text-lg"
                  title="Top Up"
                >
                  +
                </button>
                {hasUsdBalance && (
                  <button
                    onClick={() => navigate('/withdraw-usd')}
                    className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors text-lg"
                    title="Withdraw"
                  >
                    ↓
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Crypto Wallets */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 border border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
                  ₿
                </div>
                <div>
                  <p className="text-xs text-blue-100">Crypto Assets</p>
                  <p className="text-xl font-bold">
                    {maskValue(formatCurrency(totalWalletValue), balancesHidden)}
                  </p>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
