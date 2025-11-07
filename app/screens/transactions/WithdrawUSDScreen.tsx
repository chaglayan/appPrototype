import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/format';

type WithdrawStep = 'select' | 'amount' | 'summary' | 'processing' | 'complete';

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  type: 'checking' | 'savings';
  icon: string;
}

const mockBankAccounts: BankAccount[] = [
  { id: 'ach1', name: 'Chase Checking', accountNumber: '****1234', type: 'checking', icon: '🏦' },
  { id: 'ach2', name: 'Wells Fargo Savings', accountNumber: '****5678', type: 'savings', icon: '🏦' },
];

export function WithdrawUSDScreen() {
  const navigate = useNavigate();
  const { usdBalance, updateUsdBalance, addNotification } = useApp();

  const [step, setStep] = useState<WithdrawStep>('select');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [amount, setAmount] = useState('');

  const selectedBank = mockBankAccounts.find(b => b.id === selectedBankId);
  const withdrawAmount = parseFloat(amount) || 0;

  const handleBack = () => {
    if (step === 'select') {
      navigate('/home');
    } else if (step === 'amount') {
      setStep('select');
    } else if (step === 'summary') {
      setStep('amount');
    }
  };

  const handleContinueToAmount = () => {
    if (!selectedBankId) {
      addNotification({
        type: 'error',
        title: 'Select Bank Account',
        message: 'Please select a bank account to continue',
      });
      return;
    }
    setStep('amount');
  };

  const handleContinueToSummary = () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
      });
      return;
    }

    if (withdrawAmount < 10) {
      addNotification({
        type: 'error',
        title: 'Minimum Amount',
        message: 'Minimum withdrawal amount is $10.00',
      });
      return;
    }

    if (withdrawAmount > usdBalance) {
      addNotification({
        type: 'error',
        title: 'Insufficient Balance',
        message: 'You do not have enough balance to withdraw',
      });
      return;
    }

    setStep('summary');
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedBank) return;

    setStep('processing');

    addNotification({
      type: 'info',
      title: 'Withdrawal Initiated',
      message: `Transferring ${formatCurrency(withdrawAmount)} to ${selectedBank.name}...`,
    });

    // Simulate ACH processing (normally takes 1-3 business days)
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      updateUsdBalance(-withdrawAmount);
      setStep('complete');

      addNotification({
        type: 'success',
        title: 'Withdrawal Complete',
        message: `${formatCurrency(withdrawAmount)} has been sent to your bank account!`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: 'There was an error processing your withdrawal',
      });
      setStep('select');
    }
  };

  const handleAddNewBank = () => {
    addNotification({
      type: 'info',
      title: 'Coming Soon',
      message: 'Bank account linking will be available soon',
    });
  };

  if (usdBalance <= 0) {
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
          <div className="text-6xl mb-4">💵</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Balance Available</h3>
          <p className="text-gray-600 mb-6">
            You need funds in your USD account to withdraw.
          </p>
          <button
            onClick={() => navigate('/topup')}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Top Up Account
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
            <h1 className="text-xl font-semibold text-gray-900">Withdraw USD</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {step === 'select' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Available Balance</p>
              <p className="text-4xl font-bold text-gray-900">{formatCurrency(usdBalance)}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Select Bank Account</label>
                <button
                  onClick={handleAddNewBank}
                  className="text-sm text-blue-600 font-semibold hover:text-blue-700"
                >
                  + Add New
                </button>
              </div>
              <div className="space-y-2">
                {mockBankAccounts.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedBankId === bank.id
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl mr-3">
                          {bank.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{bank.name}</p>
                          <p className="text-sm text-gray-600">
                            {bank.type.charAt(0).toUpperCase() + bank.type.slice(1)} {bank.accountNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-green-600 text-sm font-semibold">✓ Verified</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">How it works:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Select your linked bank account</li>
                <li>• Enter the amount you want to withdraw</li>
                <li>• Funds are deducted from your account</li>
                <li>• ACH transfer typically takes 1-3 business days</li>
              </ul>
            </div>

            <button
              onClick={handleContinueToAmount}
              className="w-full bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-orange-700 transition-colors shadow-lg"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'amount' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Available Balance</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(usdBalance)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-500 text-xl">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  max={usdBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Min: $10.00 • Available: {formatCurrency(usdBalance)}</p>
                <button
                  type="button"
                  onClick={() => setAmount(usdBalance.toFixed(2))}
                  className="text-sm text-orange-600 font-semibold hover:text-orange-700"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">To:</span>
                <span className="font-semibold text-gray-900">{selectedBank?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Time:</span>
                <span className="font-semibold text-gray-900">1-3 Business Days</span>
              </div>
            </div>

            {withdrawAmount > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Remaining balance after withdrawal:</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(usdBalance - withdrawAmount)}</p>
              </div>
            )}

            <button
              onClick={handleContinueToSummary}
              className="w-full bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-orange-700 transition-colors shadow-lg"
            >
              Continue to Summary
            </button>
          </div>
        )}

        {step === 'summary' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">💵</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Summary</h3>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-semibold text-gray-900">{selectedBank?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span className="font-semibold text-gray-900">{selectedBank?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-semibold text-gray-900">ACH Transfer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. Arrival:</span>
                <span className="font-semibold text-gray-900">1-3 Business Days</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Withdrawal Amount:</span>
                  <span className="text-orange-600">{formatCurrency(withdrawAmount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm text-orange-900">
                <strong>⚠️ Important:</strong> Funds will be deducted immediately. The transfer to your bank will take 1-3 business days.
              </p>
            </div>

            <button
              onClick={handleConfirmWithdraw}
              className="w-full bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-orange-700 transition-colors shadow-lg"
            >
              Confirm Withdrawal
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">⚡</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Withdrawal...</h3>
            <p className="text-gray-600">Please wait</p>
            <div className="mt-6">
              <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-orange-600 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Complete!</h3>
            <p className="text-gray-600 mb-2">Successfully withdrew</p>
            <p className="text-3xl font-bold text-orange-600 mb-4">{formatCurrency(withdrawAmount)}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-2">
              <div className="flex justify-between">
                <span className="text-gray-600">New Balance:</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(usdBalance)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Funds will arrive in {selectedBank?.name} within 1-3 business days
            </p>
            <button
              onClick={() => navigate('/home')}
              className="bg-orange-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-orange-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
