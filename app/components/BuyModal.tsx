import React, { useState } from 'react';
import { Modal } from './Modal';
import { useApp } from '../context/AppContext';
import { cryptocurrencies, getCryptoById } from '../data/cryptocurrencies';
import { paymentMethods } from '../data/paymentMethods';
import { formatCurrency, formatCrypto } from '../utils/format';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BuyStep = 'select' | 'summary' | 'processing' | 'complete';
type WalletOption = 'xcoins' | 'create' | 'external' | 'new-external';

export const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose }) => {
  const {
    usdBalance,
    wallets,
    externalWallets,
    updateUsdBalance,
    updateWallet,
    addExternalWallet,
    addNotification,
  } = useApp();

  const [step, setStep] = useState<BuyStep>('select');
  const [selectedCrypto, setSelectedCrypto] = useState(cryptocurrencies[0].id);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('usd_account');
  const [walletOption, setWalletOption] = useState<WalletOption>('xcoins');
  const [selectedExternalWallet, setSelectedExternalWallet] = useState('');
  const [newExternalAddress, setNewExternalAddress] = useState('');
  const [newExternalLabel, setNewExternalLabel] = useState('');
  const [usdAmount, setUsdAmount] = useState('');

  const crypto = getCryptoById(selectedCrypto);
  const paymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
  const hasXcoinsWallet = wallets.some(w => w.cryptoId === selectedCrypto && w.isXcoinsWallet);
  const cryptoExternalWallets = externalWallets.filter(w => w.cryptoId === selectedCrypto);

  const amount = parseFloat(usdAmount) || 0;
  const fee = paymentMethod ? (amount * paymentMethod.fee) / 100 : 0;
  const total = amount + fee;
  const cryptoAmount = crypto ? amount / crypto.currentPrice : 0;

  const handleReset = () => {
    setStep('select');
    setSelectedCrypto(cryptocurrencies[0].id);
    setSelectedPaymentMethod('usd_account');
    setWalletOption('xcoins');
    setSelectedExternalWallet('');
    setNewExternalAddress('');
    setNewExternalLabel('');
    setUsdAmount('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleContinueToSummary = () => {
    if (!amount || amount <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
      });
      return;
    }

    if (selectedPaymentMethod === 'usd_account' && total > usdBalance) {
      addNotification({
        type: 'error',
        title: 'Insufficient Funds',
        message: 'You do not have enough USD balance',
      });
      return;
    }

    if (walletOption === 'create' && hasXcoinsWallet) {
      addNotification({
        type: 'error',
        title: 'Wallet Exists',
        message: `You already have a ${crypto?.name} wallet`,
      });
      return;
    }

    if (walletOption === 'external' && !selectedExternalWallet) {
      addNotification({
        type: 'error',
        title: 'Select Wallet',
        message: 'Please select an external wallet',
      });
      return;
    }

    if (walletOption === 'new-external' && (!newExternalAddress || !newExternalLabel)) {
      addNotification({
        type: 'error',
        title: 'Incomplete Information',
        message: 'Please provide wallet address and label',
      });
      return;
    }

    setStep('summary');
  };

  const handleConfirmPurchase = async () => {
    if (!crypto) return;

    setStep('processing');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Add external wallet if new
      if (walletOption === 'new-external') {
        addExternalWallet({
          cryptoId: selectedCrypto,
          address: newExternalAddress,
          label: newExternalLabel,
        });
      }

      // Update balances only if using USD account
      if (selectedPaymentMethod === 'usd_account') {
        updateUsdBalance(-total);
        // updateWallet will create the wallet if it doesn't exist
        if (walletOption === 'xcoins' || walletOption === 'create') {
          updateWallet(selectedCrypto, cryptoAmount);
        }
      }

      setStep('complete');

      addNotification({
        type: 'success',
        title: 'Purchase Completed',
        message: `Successfully purchased ${formatCrypto(cryptoAmount)} ${crypto.symbol}!`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: 'There was an error processing your purchase',
      });
      setStep('select');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Buy Crypto">
      {step === 'select' && (
        <div className="space-y-4">
          {/* Cryptocurrency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cryptocurrency
            </label>
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {cryptocurrencies.map((crypto) => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.icon} {crypto.name} ({crypto.symbol}) - {formatCurrency(crypto.currentPrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-600">Fee: {method.fee}%</p>
                    </div>
                    <div className="flex gap-2">
                      {method.labels?.map((label) => (
                        <span
                          key={label}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Wallet
            </label>
            <div className="space-y-2">
              {/* Xcoins Wallet Option */}
              {hasXcoinsWallet && (
                <button
                  type="button"
                  onClick={() => setWalletOption('xcoins')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    walletOption === 'xcoins'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Your Xcoins {crypto?.symbol} Wallet</p>
                      <p className="text-sm text-gray-600">Recommended</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      0% Fee
                    </span>
                  </div>
                </button>
              )}

              {/* Create Wallet Option */}
              {!hasXcoinsWallet && (
                <button
                  type="button"
                  onClick={() => setWalletOption('create')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    walletOption === 'create'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Create Xcoins {crypto?.symbol} Wallet</p>
                      <p className="text-sm text-gray-600">New wallet will be created</p>
                    </div>
                    <span className="text-2xl">+</span>
                  </div>
                </button>
              )}

              {/* External Wallet Options */}
              {cryptoExternalWallets.length > 0 && (
                <>
                  <p className="text-sm text-gray-600 mt-4 mb-2">External Wallets</p>
                  {cryptoExternalWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => {
                        setWalletOption('external');
                        setSelectedExternalWallet(wallet.id);
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        walletOption === 'external' && selectedExternalWallet === wallet.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{wallet.label}</p>
                      <p className="text-sm text-gray-600 font-mono truncate">{wallet.address}</p>
                    </button>
                  ))}
                </>
              )}

              {/* Add New External Wallet */}
              <button
                type="button"
                onClick={() => setWalletOption('new-external')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  walletOption === 'new-external'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">Use External Wallet</p>
                <p className="text-sm text-gray-600">Send to a different wallet address</p>
              </button>

              {/* External Wallet Form */}
              {walletOption === 'new-external' && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Label</label>
                    <input
                      type="text"
                      value={newExternalLabel}
                      onChange={(e) => setNewExternalLabel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="My Ledger Wallet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                    <input
                      type="text"
                      value={newExternalAddress}
                      onChange={(e) => setNewExternalAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder={`Enter ${crypto?.symbol} address`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Spend (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-500 text-lg">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            {selectedPaymentMethod === 'usd_account' && (
              <p className="text-sm text-gray-500 mt-1">
                Available: {formatCurrency(usdBalance)}
              </p>
            )}
          </div>

          {/* Preview */}
          {crypto && amount > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">You will receive approximately:</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatCrypto(cryptoAmount)} {crypto.symbol}
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between">
                    <span>Fee ({paymentMethod?.fee}%):</span>
                    <span>{formatCurrency(fee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-300">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
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
              className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'summary' && (
        <div className="space-y-4">
          <div className="text-center py-6">
            <div className="text-6xl mb-4">{crypto?.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Summary</h3>
            <p className="text-gray-600">Please review your purchase details</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Cryptocurrency:</span>
              <span className="font-semibold text-gray-900">{crypto?.name} ({crypto?.symbol})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-gray-900">{formatCrypto(cryptoAmount)} {crypto?.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900">{paymentMethod?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Destination:</span>
              <span className="font-semibold text-gray-900">
                {walletOption === 'xcoins' && 'Xcoins Wallet'}
                {walletOption === 'create' && 'New Xcoins Wallet'}
                {walletOption === 'external' && externalWallets.find(w => w.id === selectedExternalWallet)?.label}
                {walletOption === 'new-external' && newExternalLabel}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-3 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">{formatCurrency(amount)}</span>
              </div>
              {fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fee:</span>
                  <span className="text-gray-900">{formatCurrency(fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold mt-2">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">{formatCurrency(total)}</span>
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
              onClick={handleConfirmPurchase}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-pulse">⚡</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</h3>
          <p className="text-gray-600">Please wait while we process your transaction</p>
          <div className="mt-6">
            <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Complete!</h3>
          <p className="text-gray-600 mb-6">
            You have successfully purchased {formatCrypto(cryptoAmount)} {crypto?.symbol}
          </p>
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
};
