import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCryptoById } from '../data/cryptocurrencies';
import { formatCurrency, maskValue } from '../utils/format';
import { TopUpModal } from './TopUpModal';

export const BalanceOverview: React.FC = () => {
  const { usdBalance, wallets, balancesHidden, toggleBalancesHidden } = useApp();
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

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
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Total Balance Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-gray-900">
              {maskValue(formatCurrency(totalBalance), balancesHidden)}
            </p>
          </div>
          <button
            onClick={toggleBalancesHidden}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            title={balancesHidden ? 'Show balances' : 'Hide balances'}
          >
            {balancesHidden ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        {/* USD Account Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">USD Account</p>
              <p className="text-2xl font-bold text-gray-900">
                {maskValue(formatCurrency(usdBalance), balancesHidden)}
              </p>
            </div>
            <div className="text-3xl">💵</div>
          </div>

          {/* Add USD or Top up/Withdraw buttons */}
          {!hasUsdBalance ? (
            <button
              onClick={() => setShowTopUp(true)}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <span className="text-xl">+</span>
              <span>Add USD</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowTopUp(true)}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Top Up
              </button>
              <button
                onClick={() => setShowWithdraw(true)}
                className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors text-sm"
              >
                Withdraw
              </button>
            </div>
          )}
        </div>

        {/* Crypto Wallets Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Crypto Wallets</p>
              <p className="text-xl font-semibold text-gray-900">
                {maskValue(formatCurrency(totalWalletValue), balancesHidden)}
              </p>
            </div>
            <div className="text-2xl">₿</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Modals */}
      {showTopUp && <TopUpModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} />}

      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowWithdraw(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Withdraw USD</h3>
            <p className="text-gray-600 mb-6">Withdraw feature coming soon!</p>
            <button
              onClick={() => setShowWithdraw(false)}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
