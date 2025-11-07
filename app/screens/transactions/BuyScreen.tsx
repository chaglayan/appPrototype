import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cryptocurrencies, getCryptoById } from '../data/cryptocurrencies';
import { paymentMethods } from '../data/paymentMethods';
import { formatCurrency, formatCrypto } from '../utils/format';

type BuyStep = 'select' | 'summary' | 'processing' | 'complete';
type WalletOption = 'xcoins' | 'create' | 'external' | 'new-external';

export function BuyScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    usdBalance,
    wallets,
    externalWallets,
    updateUsdBalance,
    updateWallet,
    addExternalWallet,
    addNotification,
  } = useApp();

  const preselectedCrypto = searchParams.get('crypto');
  const preselectedWallet = searchParams.get('wallet');

  const [step, setStep] = useState<BuyStep>('select');
  const [selectedCrypto, setSelectedCrypto] = useState(preselectedCrypto || cryptocurrencies[0].id);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('usd_account');
  const [walletOption, setWalletOption] = useState<WalletOption>(preselectedWallet === 'xcoins' ? 'xcoins' : 'xcoins');
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

  // Set wallet option based on preselection
  useEffect(() => {
    if (preselectedWallet === 'xcoins' && hasXcoinsWallet) {
      setWalletOption('xcoins');
    } else if (preselectedWallet === 'xcoins' && !hasXcoinsWallet) {
      setWalletOption('create');
    }
  }, [preselectedWallet, hasXcoinsWallet]);

  const handleBack = () => {
    if (step === 'select') {
      navigate('/home');
    } else {
      setStep('select');
    }
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
      // Redirect to top up
      addNotification({
        type: 'info',
        title: 'Insufficient Funds',
        message: 'Please top up your USD account',
      });
      navigate('/home'); // Will implement top-up redirect later
      return;
    }

    setStep('summary');
  };

  const handleConfirmPurchase = async () => {
    if (!crypto) return;

    setStep('processing');

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      if (walletOption === 'new-external') {
        addExternalWallet({
          cryptoId: selectedCrypto,
          address: newExternalAddress,
          label: newExternalLabel,
        });
      }

      if (selectedPaymentMethod === 'usd_account') {
        updateUsdBalance(-total);
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={handleBack} className="text-blue-600 text-lg mr-4">
              ← {step === 'select' ? 'Back' : 'Edit'}
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Buy Crypto</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {step === 'select' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            {/* Crypto Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cryptocurrency</label>
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

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
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
                        <p className="text-sm text-gray-600">
                          Fee: {method.fee}%
                          {method.id === 'usd_account' && ` • Available: ${formatCurrency(usdBalance)}`}
                        </p>
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

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
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
                <p className="text-3xl font-bold text-gray-900 mb-3">
                  {formatCrypto(cryptoAmount)} {crypto.symbol}
                </p>
                <div className="text-sm text-gray-600 space-y-1 border-t border-gray-300 pt-3">
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

            {/* Continue Button */}
            <button
              onClick={handleContinueToSummary}
              className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Continue to Summary
            </button>
          </div>
        )}

        {step === 'summary' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">{crypto?.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Summary</h3>
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
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmPurchase}
              className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Confirm Purchase
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">⚡</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</h3>
            <p className="text-gray-600">Please wait</p>
            <div className="mt-6">
              <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Complete!</h3>
            <p className="text-gray-600 mb-2">
              You have successfully purchased {formatCrypto(cryptoAmount)} {crypto?.symbol}
            </p>
            <button
              onClick={() => navigate('/home')}
              className="mt-6 bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
