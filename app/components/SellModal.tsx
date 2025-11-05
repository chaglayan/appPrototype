import React, { useState } from 'react';
import { Modal } from './Modal';
import { useApp } from '../context/AppContext';
import { getCryptoById } from '../data/cryptocurrencies';
import { formatCurrency, formatCrypto } from '../utils/format';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SellStep = 'select' | 'summary' | 'processing' | 'complete';

export const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    wallets,
    updateUsdBalance,
    updateWallet,
    addNotification,
  } = useApp();

  const [step, setStep] = useState<SellStep>('select');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');

  // Only show Xcoins wallets with balance
  const xcoinsWallets = wallets.filter(w => w.isXcoinsWallet && w.amount > 0);

  const wallet = wallets.find(w => w.id === selectedWalletId);
  const crypto = wallet ? getCryptoById(wallet.cryptoId) : null;
  const amount = parseFloat(cryptoAmount) || 0;
  const usdAmount = crypto ? amount * crypto.currentPrice : 0;

  const handleReset = () => {
    setStep('select');
    setSelectedWalletId('');
    setCryptoAmount('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleContinueToSummary = () => {
    if (!selectedWalletId) {
      addNotification({
        type: 'error',
        title: 'Select Wallet',
        message: 'Please select a wallet to sell from',
      });
      return;
    }

    if (!amount || amount <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
      });
      return;
    }

    if (wallet && amount > wallet.amount) {
      addNotification({
        type: 'error',
        title: 'Insufficient Balance',
        message: 'You do not have enough crypto to sell',
      });
      return;
    }

    setStep('summary');
  };

  const handleConfirmSale = async () => {
    if (!crypto || !wallet) return;

    setStep('processing');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Update balances
      updateWallet(wallet.cryptoId, -amount);
      updateUsdBalance(usdAmount);

      setStep('complete');

      addNotification({
        type: 'success',
        title: 'Sale Completed',
        message: `Successfully sold ${formatCrypto(amount)} ${crypto.symbol} for ${formatCurrency(usdAmount)}!`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: 'There was an error processing your sale',
      });
      setStep('select');
    }
  };

  // Check if user has USD account and wallets
  if (!user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Sell Crypto">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-600 mb-4">Please sign in to sell crypto</p>
          <button onClick={handleClose} className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors">
            Close
          </button>
        </div>
      </Modal>
    );
  }

  if (xcoinsWallets.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Sell Crypto">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💼</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Wallets Available</h3>
          <p className="text-gray-600 mb-6">
            You need a Xcoins wallet with crypto to sell.
          </p>
          <button onClick={handleClose} className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors">
            Create Wallet
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Sell Crypto">
      {step === 'select' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">ℹ️</span>
              <div>
                <p className="text-sm font-medium text-blue-900">Sell to USD Account</p>
                <p className="text-xs text-blue-700 mt-1">
                  You can only sell crypto from your Xcoins wallets to your USD account.
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Wallet to Sell From
            </label>
            <div className="space-y-2">
              {xcoinsWallets.map((w) => {
                const c = getCryptoById(w.cryptoId);
                if (!c) return null;

                const value = w.amount * c.currentPrice;

                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWalletId(w.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedWalletId === w.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3">
                          {c.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{c.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatCrypto(w.amount)} {c.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(value)}</p>
                        <p className="text-xs text-gray-500">Available</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          {selectedWalletId && wallet && crypto && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Sell ({crypto.symbol})
              </label>
              <input
                type="number"
                step="0.00000001"
                min="0"
                max={wallet.amount}
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00000000"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Available: {formatCrypto(wallet.amount)} {crypto.symbol}
                </p>
                <button
                  type="button"
                  onClick={() => setCryptoAmount(wallet.amount.toString())}
                  className="text-sm text-blue-600 font-semibold hover:text-blue-700"
                >
                  Max
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {crypto && amount > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">You will receive:</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(usdAmount)}
              </p>
              <p className="text-sm text-gray-600">
                Selling {formatCrypto(amount)} {crypto.symbol} @ {formatCurrency(crypto.currentPrice)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleContinueToSummary}
              className="flex-1 bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'summary' && (
        <div className="space-y-4">
          <div className="text-center py-6">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sale Summary</h3>
            <p className="text-gray-600">Please review your sale details</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Selling:</span>
              <span className="font-semibold text-gray-900">
                {formatCrypto(amount)} {crypto?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Price:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(crypto?.currentPrice || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">From Wallet:</span>
              <span className="font-semibold text-gray-900">Xcoins {crypto?.symbol} Wallet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To Account:</span>
              <span className="font-semibold text-gray-900">USD Account</span>
            </div>
            <div className="border-t border-gray-300 pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">You'll Receive:</span>
                <span className="text-green-600">{formatCurrency(usdAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setStep('select')}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmSale}
              className="flex-1 bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
            >
              Confirm Sale
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-pulse">⚡</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Sale...</h3>
          <p className="text-gray-600">Please wait while we process your transaction</p>
          <div className="mt-6">
            <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-green-600 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Sale Complete!</h3>
          <p className="text-gray-600 mb-2">
            You have successfully sold {formatCrypto(amount)} {crypto?.symbol}
          </p>
          <p className="text-2xl font-bold text-green-600 mb-6">
            +{formatCurrency(usdAmount)}
          </p>
          <button
            onClick={handleClose}
            className="bg-green-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-green-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
};
