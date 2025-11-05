import React, { useState } from 'react';
import { Modal } from './Modal';
import { useApp } from '../context/AppContext';
import { cryptocurrencies, getCryptoById } from '../data/cryptocurrencies';
import { formatCrypto, formatCurrency } from '../utils/format';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SwapStep = 'select' | 'summary' | 'processing' | 'complete';

export const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose }) => {
  const { wallets, updateWallet, createWallet, addNotification } = useApp();

  const [step, setStep] = useState<SwapStep>('select');
  const [fromWalletId, setFromWalletId] = useState('');
  const [toCryptoId, setToCryptoId] = useState(cryptocurrencies[0]?.id || '');
  const [fromAmount, setFromAmount] = useState('');

  // Only show Xcoins wallets with balance
  const xcoinsWallets = wallets.filter(w => w.isXcoinsWallet && w.amount > 0);

  const fromWallet = wallets.find(w => w.id === fromWalletId);
  const fromCrypto = fromWallet ? getCryptoById(fromWallet.cryptoId) : null;
  const toCrypto = getCryptoById(toCryptoId);
  const hasToWallet = wallets.some(w => w.cryptoId === toCryptoId && w.isXcoinsWallet);

  const amount = parseFloat(fromAmount) || 0;
  const toAmount = fromCrypto && toCrypto && amount
    ? (amount * fromCrypto.currentPrice) / toCrypto.currentPrice
    : 0;

  const handleReset = () => {
    setStep('select');
    setFromWalletId('');
    setToCryptoId(cryptocurrencies[0]?.id || '');
    setFromAmount('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleContinueToSummary = () => {
    if (!fromWalletId) {
      addNotification({
        type: 'error',
        title: 'Select Wallet',
        message: 'Please select a wallet to swap from',
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

    if (fromWallet && amount > fromWallet.amount) {
      addNotification({
        type: 'error',
        title: 'Insufficient Balance',
        message: 'You do not have enough crypto to swap',
      });
      return;
    }

    if (fromCrypto?.id === toCrypto?.id) {
      addNotification({
        type: 'error',
        title: 'Invalid Swap',
        message: 'Cannot swap to the same cryptocurrency',
      });
      return;
    }

    setStep('summary');
  };

  const handleConfirmSwap = async () => {
    if (!fromCrypto || !toCrypto || !fromWallet) return;

    setStep('processing');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Create destination wallet if needed
      if (!hasToWallet) {
        createWallet(toCryptoId);
      }

      // Update balances
      updateWallet(fromWallet.cryptoId, -amount);
      updateWallet(toCryptoId, toAmount);

      setStep('complete');

      addNotification({
        type: 'success',
        title: 'Swap Completed',
        message: `Successfully swapped ${formatCrypto(amount)} ${fromCrypto.symbol} for ${formatCrypto(toAmount)} ${toCrypto.symbol}!`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: 'There was an error processing your swap',
      });
      setStep('select');
    }
  };

  if (xcoinsWallets.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Swap Crypto">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💼</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Wallets Available</h3>
          <p className="text-gray-600 mb-6">
            You need at least one Xcoins wallet with crypto to swap.
          </p>
          <button onClick={handleClose} className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors">
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Swap Crypto">
      {step === 'select' && (
        <div className="space-y-4">
          {/* From Wallet Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Wallet
            </label>
            <div className="space-y-2">
              {xcoinsWallets.map((w) => {
                const c = getCryptoById(w.cryptoId);
                if (!c) return null;

                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setFromWalletId(w.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      fromWalletId === w.id
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
                      <p className="text-sm text-gray-600">{formatCurrency(w.amount * c.currentPrice)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          {fromWalletId && fromWallet && fromCrypto && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Swap ({fromCrypto.symbol})
              </label>
              <input
                type="number"
                step="0.00000001"
                min="0"
                max={fromWallet.amount}
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00000000"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Available: {formatCrypto(fromWallet.amount)} {fromCrypto.symbol}
                </p>
                <button
                  type="button"
                  onClick={() => setFromAmount(fromWallet.amount.toString())}
                  className="text-sm text-blue-600 font-semibold hover:text-blue-700"
                >
                  Max
                </button>
              </div>
            </div>
          )}

          {/* Swap Icon */}
          {fromWalletId && (
            <div className="flex justify-center py-2">
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-3xl">⇅</span>
              </div>
            </div>
          )}

          {/* To Cryptocurrency Selection */}
          {fromWalletId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Cryptocurrency
              </label>
              <select
                value={toCryptoId}
                onChange={(e) => setToCryptoId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cryptocurrencies.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.icon} {crypto.name} ({crypto.symbol}) - {formatCurrency(crypto.currentPrice)}
                  </option>
                ))}
              </select>
              {!hasToWallet && toCrypto && (
                <p className="text-xs text-blue-600 mt-2">
                  ℹ️ A new {toCrypto.name} wallet will be created for you
                </p>
              )}
            </div>
          )}

          {/* Preview */}
          {fromCrypto && toCrypto && amount > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">You will receive approximately:</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {formatCrypto(toAmount)} {toCrypto.symbol}
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Swapping:</span>
                  <span>{formatCrypto(amount)} {fromCrypto.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Exchange Rate:</span>
                  <span>1 {fromCrypto.symbol} = {formatCrypto((fromCrypto.currentPrice / toCrypto.currentPrice), 6)} {toCrypto.symbol}</span>
                </div>
              </div>
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
              className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'summary' && (
        <div className="space-y-4">
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-4xl">{fromCrypto?.icon}</div>
              <div className="text-3xl">→</div>
              <div className="text-4xl">{toCrypto?.icon}</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Swap Summary</h3>
            <p className="text-gray-600">Please review your swap details</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">From:</span>
              <span className="font-semibold text-gray-900">
                {formatCrypto(amount)} {fromCrypto?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span className="font-semibold text-gray-900">
                {formatCrypto(toAmount)} {toCrypto?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Exchange Rate:</span>
              <span className="font-semibold text-gray-900 text-sm">
                1 {fromCrypto?.symbol} = {formatCrypto((fromCrypto?.currentPrice || 0) / (toCrypto?.currentPrice || 1), 6)} {toCrypto?.symbol}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Value:</span>
                <span className="font-semibold text-gray-900">
                  ≈ {formatCurrency(amount * (fromCrypto?.currentPrice || 0))}
                </span>
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
              onClick={handleConfirmSwap}
              className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors"
            >
              Confirm Swap
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-pulse">⚡</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Swap...</h3>
          <p className="text-gray-600">Please wait while we process your transaction</p>
          <div className="mt-6">
            <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Swap Complete!</h3>
          <p className="text-gray-600 mb-2">
            You have successfully swapped
          </p>
          <p className="text-lg font-semibold text-gray-900 mb-1">
            {formatCrypto(amount)} {fromCrypto?.symbol}
          </p>
          <p className="text-gray-600 mb-2">for</p>
          <p className="text-2xl font-bold text-purple-600 mb-6">
            {formatCrypto(toAmount)} {toCrypto?.symbol}
          </p>
          <button
            onClick={handleClose}
            className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
};
