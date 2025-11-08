import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/format';
import AddBankAccountModal from '../../components/AddBankAccountModal';

type TopUpStep = 'select' | 'amount' | 'summary' | 'processing' | 'complete';

export function TopUpScreen() {
  const navigate = useNavigate();
  const { usdBalance, bankAccounts, updateUsdBalance, addNotification } = useApp();

  const [step, setStep] = useState<TopUpStep>('select');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [amount, setAmount] = useState('');
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  const selectedBank = bankAccounts.find(b => b.id === selectedBankId);
  const depositAmount = parseFloat(amount) || 0;

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
    if (!depositAmount || depositAmount <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
      });
      return;
    }

    if (depositAmount < 10) {
      addNotification({
        type: 'error',
        title: 'Minimum Amount',
        message: 'Minimum deposit amount is $10.00',
      });
      return;
    }

    if (depositAmount > 10000) {
      addNotification({
        type: 'error',
        title: 'Maximum Amount',
        message: 'Maximum deposit amount is $10,000.00',
      });
      return;
    }

    setStep('summary');
  };

  const handleConfirmDeposit = async () => {
    if (!selectedBank) return;

    setStep('processing');

    addNotification({
      type: 'info',
      title: 'ACH Transfer Initiated',
      message: `Transferring ${formatCurrency(depositAmount)} from ${selectedBank.name}...`,
    });

    // Simulate ACH processing (normally takes 1-3 business days)
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      updateUsdBalance(depositAmount);
      setStep('complete');

      addNotification({
        type: 'success',
        title: 'Deposit Complete',
        message: `${formatCurrency(depositAmount)} has been added to your account!`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: 'There was an error processing your deposit',
      });
      setStep('select');
    }
  };

  const handleAddNewBank = () => {
    setShowAddBankModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={handleBack} className="text-blue-600 text-lg mr-4">
              ← {step === 'select' ? 'Back' : 'Edit'}
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Top Up USD Account</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {step === 'select' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Prefunded Account:</strong> Link your bank account for instant ACH transfers.
              </p>
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
                {bankAccounts.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-3">🏦</div>
                    <h3 className="font-semibold text-gray-900 mb-2">No Bank Accounts</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Link your bank account to start making deposits
                    </p>
                    <button
                      onClick={handleAddNewBank}
                      className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      + Add Bank Account
                    </button>
                  </div>
                ) : (
                  bankAccounts.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedBankId === bank.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl mr-3">
                            {bank.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{bank.name}</p>
                            <p className="text-sm text-gray-600">
                              {bank.type.charAt(0).toUpperCase() + bank.type.slice(1)} {bank.accountNumber}
                            </p>
                          </div>
                        </div>
                        {bank.isVerified && (
                          <div className="text-green-600 text-sm font-semibold">✓ Verified</div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">How it works:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Select your linked bank account</li>
                <li>• Enter the amount you want to deposit</li>
                <li>• Funds are available instantly (prefunded)</li>
                <li>• ACH withdrawal processes in the background</li>
              </ul>
            </div>

            <button
              onClick={handleContinueToAmount}
              className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'amount' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(usdBalance)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-500 text-xl">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  max="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Min: $10.00 • Max: $10,000.00</p>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setAmount('100')}
                    className="text-sm text-blue-600 font-semibold hover:text-blue-700 px-2 py-1 rounded-lg bg-blue-50"
                  >
                    $100
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('500')}
                    className="text-sm text-blue-600 font-semibold hover:text-blue-700 px-2 py-1 rounded-lg bg-blue-50"
                  >
                    $500
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('1000')}
                    className="text-sm text-blue-600 font-semibold hover:text-blue-700 px-2 py-1 rounded-lg bg-blue-50"
                  >
                    $1000
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">From:</span>
                <span className="font-semibold text-gray-900">{selectedBank?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Time:</span>
                <span className="font-semibold text-green-600">Instant (Prefunded)</span>
              </div>
            </div>

            {depositAmount > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">New balance after deposit:</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(usdBalance + depositAmount)}</p>
              </div>
            )}

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
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Deposit Summary</h3>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-semibold text-gray-900">{selectedBank?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span className="font-semibold text-gray-900">{selectedBank?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-semibold text-gray-900">ACH Transfer (Prefunded)</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Deposit Amount:</span>
                  <span className="text-blue-600">{formatCurrency(depositAmount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>✓ Instant Availability:</strong> Funds will be available immediately in your account.
              </p>
            </div>

            <button
              onClick={handleConfirmDeposit}
              className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Confirm Deposit
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">⚡</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Deposit...</h3>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Deposit Complete!</h3>
            <p className="text-gray-600 mb-2">Successfully deposited</p>
            <p className="text-3xl font-bold text-blue-600 mb-4">{formatCurrency(depositAmount)}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">New Balance:</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(usdBalance)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>

      <AddBankAccountModal
        isOpen={showAddBankModal}
        onClose={() => setShowAddBankModal(false)}
      />
    </div>
  );
}
