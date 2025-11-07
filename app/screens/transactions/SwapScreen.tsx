import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cryptocurrencies, getCryptoById } from '../../data/cryptocurrencies';
import { formatCrypto, formatCurrency } from '../../utils/format';

type SwapStep = 'select' | 'summary' | 'processing' | 'complete';

export function SwapScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { wallets, updateWallet, createWallet, addNotification } = useApp();

  const preselectedCrypto = searchParams.get('crypto');
  const preselectedWalletId = searchParams.get('walletId');

  const [step, setStep] = useState<SwapStep>('select');
  const [fromWalletId, setFromWalletId] = useState(preselectedWalletId || '');
  const [toCryptoId, setToCryptoId] = useState(cryptocurrencies[0]?.id || '');
  const [fromAmount, setFromAmount] = useState('');

  const xcoinsWallets = wallets.filter(w => w.isXcoinsWallet && w.amount > 0);
  const fromWallet = wallets.find(w => w.id === fromWalletId);
  const fromCrypto = fromWallet ? getCryptoById(fromWallet.cryptoId) : null;
  const toCrypto = getCryptoById(toCryptoId);
  const hasToWallet = wallets.some(w => w.cryptoId === toCryptoId && w.isXcoinsWallet);

  const amount = parseFloat(fromAmount) || 0;
  const toAmount = fromCrypto && toCrypto && amount
    ? (amount * fromCrypto.currentPrice) / toCrypto.currentPrice
    : 0;

  useEffect(() => {
    if (preselectedWalletId) {
      setFromWalletId(preselectedWalletId);
    } else if (preselectedCrypto && xcoinsWallets.length > 0) {
      const matchingWallet = xcoinsWallets.find(w => w.cryptoId === preselectedCrypto);
      if (matchingWallet) {
        setFromWalletId(matchingWallet.id);
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
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      if (!hasToWallet) {
        createWallet(toCryptoId);
      }

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
            You need at least one Xcoins wallet with crypto to swap.
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
            <h1 className="text-xl font-semibold text-gray-900">Swap Crypto</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {step === 'select' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Wallet</label>
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
                          ? 'border-purple-600 bg-purple-50'
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
                        <p className="text-sm text-gray-600">{formatCurrency(w.amount * c.currentPrice)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00000000"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Available: {formatCrypto(fromWallet.amount)} {fromCrypto.symbol}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFromAmount(fromWallet.amount.toString())}
                    className="text-sm text-purple-600 font-semibold hover:text-purple-700"
                  >
                    Max
                  </button>
                </div>
              </div>
            )}

            {fromWalletId && (
              <div className="flex justify-center py-2">
                <div className="bg-purple-100 rounded-full p-3">
                  <span className="text-3xl">⇅</span>
                </div>
              </div>
            )}

            {fromWalletId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Cryptocurrency</label>
                <select
                  value={toCryptoId}
                  onChange={(e) => setToCryptoId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {cryptocurrencies.map((crypto) => (
                    <option key={crypto.id} value={crypto.id}>
                      {crypto.icon} {crypto.name} ({crypto.symbol}) - {formatCurrency(crypto.currentPrice)}
                    </option>
                  ))}
                </select>
                {!hasToWallet && toCrypto && (
                  <p className="text-xs text-purple-600 mt-2">
                    ℹ️ A new {toCrypto.name} wallet will be created for you
                  </p>
                )}
              </div>
            )}

            {fromCrypto && toCrypto && amount > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">You will receive approximately:</p>
                <p className="text-3xl font-bold text-purple-600 mb-3">{formatCrypto(toAmount)} {toCrypto.symbol}</p>
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

            <button
              onClick={handleContinueToSummary}
              className="w-full bg-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
            >
              Continue to Summary
            </button>
          </div>
        )}

        {step === 'summary' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="text-4xl">{fromCrypto?.icon}</div>
                <div className="text-3xl">→</div>
                <div className="text-4xl">{toCrypto?.icon}</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Swap Summary</h3>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-semibold text-gray-900">{formatCrypto(amount)} {fromCrypto?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-semibold text-gray-900">{formatCrypto(toAmount)} {toCrypto?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exchange Rate:</span>
                <span className="font-semibold text-gray-900 text-sm">
                  1 {fromCrypto?.symbol} = {formatCrypto((fromCrypto?.currentPrice || 0) / (toCrypto?.currentPrice || 1), 6)} {toCrypto?.symbol}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-semibold text-gray-900">≈ {formatCurrency(amount * (fromCrypto?.currentPrice || 0))}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmSwap}
              className="w-full bg-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
            >
              Confirm Swap
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">⚡</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Swap...</h3>
            <p className="text-gray-600">Please wait</p>
            <div className="mt-6">
              <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Swap Complete!</h3>
            <p className="text-gray-600 mb-2">You have successfully swapped</p>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {formatCrypto(amount)} {fromCrypto?.symbol}
            </p>
            <p className="text-gray-600 mb-2">for</p>
            <p className="text-2xl font-bold text-purple-600 mb-6">
              {formatCrypto(toAmount)} {toCrypto?.symbol}
            </p>
            <button
              onClick={() => navigate('/home')}
              className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-purple-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
