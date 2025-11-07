import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getCryptoById } from '../../data/cryptocurrencies';
import { formatCurrency, formatCrypto } from '../../utils/format';

type SellStep = 'select' | 'summary' | 'processing' | 'complete';

export function SellScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { wallets, updateUsdBalance, updateWallet, addNotification } = useApp();

  const preselectedCrypto = searchParams.get('crypto');
  const preselectedWalletId = searchParams.get('walletId');

  const [step, setStep] = useState<SellStep>('select');
  const [selectedWalletId, setSelectedWalletId] = useState(preselectedWalletId || '');
  const [cryptoAmount, setCryptoAmount] = useState('');

  const xcoinsWallets = wallets.filter(w => w.isXcoinsWallet && w.amount > 0);
  const wallet = wallets.find(w => w.id === selectedWalletId);
  const crypto = wallet ? getCryptoById(wallet.cryptoId) : null;
  const amount = parseFloat(cryptoAmount) || 0;
  const usdAmount = crypto ? amount * crypto.currentPrice : 0;

  useEffect(() => {
    if (preselectedWalletId) {
      setSelectedWalletId(preselectedWalletId);
    } else if (preselectedCrypto && xcoinsWallets.length > 0) {
      const matchingWallet = xcoinsWallets.find(w => w.cryptoId === preselectedCrypto);
      if (matchingWallet) {
        setSelectedWalletId(matchingWallet.id);
      }
    }
  }, [preselectedWalletId, preselectedCrypto]);

  const handleBack = () => {
    if (step === 'select') {
      navigate('/home');
    } else {
      setStep('select');
    }
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
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
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

  if (xcoinsWallets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button onClick={() => navigate('/home')} className="text-blue-600 text-lg">
              ← Back
            </button>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Wallets Available</h3>
          <p className="text-gray-600 mb-6">
            You need a Xcoins wallet with crypto to sell.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={handleBack} className="text-blue-600 text-lg mr-4">
              ← {step === 'select' ? 'Back' : 'Edit'}
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Sell Crypto</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {step === 'select' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Note:</strong> You can only sell from your Xcoins wallets to your USD account.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Wallet</label>
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
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl mr-3">
                            {c.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{c.name}</p>
                            <p className="text-sm text-gray-600">{formatCrypto(w.amount)} {c.symbol}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(value)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00000000"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Available: {formatCrypto(wallet.amount)} {crypto.symbol}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCryptoAmount(wallet.amount.toString())}
                    className="text-sm text-green-600 font-semibold hover:text-green-700"
                  >
                    Max
                  </button>
                </div>
              </div>
            )}

            {crypto && amount > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">You will receive:</p>
                <p className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(usdAmount)}</p>
                <p className="text-sm text-gray-600">
                  Selling {formatCrypto(amount)} {crypto.symbol} @ {formatCurrency(crypto.currentPrice)}
                </p>
              </div>
            )}

            <button
              onClick={handleContinueToSummary}
              className="w-full bg-green-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              Continue to Summary
            </button>
          </div>
        )}

        {step === 'summary' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sale Summary</h3>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Selling:</span>
                <span className="font-semibold text-gray-900">{formatCrypto(amount)} {crypto?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Price:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(crypto?.currentPrice || 0)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">You'll Receive:</span>
                  <span className="text-green-600">{formatCurrency(usdAmount)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmSale}
              className="w-full bg-green-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              Confirm Sale
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">⚡</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Sale...</h3>
            <p className="text-gray-600">Please wait</p>
            <div className="mt-6">
              <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-green-600 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sale Complete!</h3>
            <p className="text-gray-600 mb-2">
              You have successfully sold {formatCrypto(amount)} {crypto?.symbol}
            </p>
            <p className="text-2xl font-bold text-green-600 mb-6">+{formatCurrency(usdAmount)}</p>
            <button
              onClick={() => navigate('/home')}
              className="bg-green-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-green-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
