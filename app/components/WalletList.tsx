import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCryptoById, cryptocurrencies } from '../data/cryptocurrencies';
import { formatCurrency, formatCrypto, formatPercentage, maskValue } from '../utils/format';
import { WalletDetailModal } from './WalletDetailModal';
import { Wallet } from '../types';

export const WalletList: React.FC = () => {
  const { wallets, balancesHidden, createWallet, addNotification } = useApp();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCreateWallet = (cryptoId: string) => {
    const existingWallet = wallets.find(w => w.cryptoId === cryptoId && w.isXcoinsWallet);
    if (existingWallet) {
      addNotification({
        type: 'error',
        title: 'Wallet Exists',
        message: `You already have a ${getCryptoById(cryptoId)?.name} wallet`,
      });
      return;
    }

    createWallet(cryptoId);
    addNotification({
      type: 'success',
      title: 'Wallet Created',
      message: `Your ${getCryptoById(cryptoId)?.name} wallet has been created`,
    });
    setShowCreateWallet(false);
  };

  const xcoinsWallets = wallets.filter(w => w.isXcoinsWallet);

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <span>My Wallets</span>
            <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
          </button>
          <button
            onClick={() => setShowCreateWallet(true)}
            className="text-blue-600 text-sm font-semibold hover:text-blue-700"
          >
            + Create Wallet
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3">
          {xcoinsWallets.map(wallet => {
            const crypto = getCryptoById(wallet.cryptoId);
            if (!crypto) return null;

            const usdValue = wallet.amount * crypto.currentPrice;
            const changeColor = crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600';

            return (
              <button
                key={wallet.id}
                onClick={() => setSelectedWallet(wallet)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                    {crypto.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{crypto.name}</h3>
                    <p className="text-sm text-gray-500">{crypto.symbol}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {maskValue(`${formatCrypto(wallet.amount)} ${crypto.symbol}`, balancesHidden)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {maskValue(formatCurrency(usdValue), balancesHidden)}
                  </p>
                  <p className={`text-xs ${changeColor}`}>
                    {formatPercentage(crypto.change24h)} 24h
                  </p>
                </div>
              </button>
            );
          })}

          {xcoinsWallets.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">💼</div>
              <p className="text-gray-600 mb-4">No wallets yet</p>
              <button
                onClick={() => setShowCreateWallet(true)}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <span className="text-xl">+</span>
                <span>Create Xcoins Wallet</span>
              </button>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Wallet Detail Modal */}
      {selectedWallet && (
        <WalletDetailModal
          isOpen={!!selectedWallet}
          onClose={() => setSelectedWallet(null)}
          wallet={selectedWallet}
        />
      )}

      {/* Create Wallet Modal */}
      {showCreateWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateWallet(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Wallet</h3>
            <p className="text-gray-600 mb-4">Choose a cryptocurrency to create your wallet</p>

            <div className="space-y-2">
              {cryptocurrencies.map(crypto => {
                const hasWallet = wallets.some(w => w.cryptoId === crypto.id && w.isXcoinsWallet);
                return (
                  <button
                    key={crypto.id}
                    onClick={() => !hasWallet && handleCreateWallet(crypto.id)}
                    disabled={hasWallet}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                      hasWallet
                        ? 'bg-gray-100 cursor-not-allowed opacity-50'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3">
                        {crypto.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{crypto.name}</p>
                        <p className="text-sm text-gray-500">{crypto.symbol}</p>
                      </div>
                    </div>
                    {hasWallet && (
                      <span className="text-xs text-gray-500 font-medium">Already created</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowCreateWallet(false)}
              className="w-full mt-4 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
