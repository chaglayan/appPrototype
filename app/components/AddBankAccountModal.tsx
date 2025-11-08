import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './Modal';

interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AddBankStep = 'select' | 'details' | 'verify' | 'complete';

const popularBanks = [
  { name: 'Chase', icon: '🏦' },
  { name: 'Bank of America', icon: '🏦' },
  { name: 'Wells Fargo', icon: '🏦' },
  { name: 'Citibank', icon: '🏦' },
  { name: 'Capital One', icon: '🏦' },
  { name: 'US Bank', icon: '🏦' },
];

export default function AddBankAccountModal({ isOpen, onClose }: AddBankAccountModalProps) {
  const { addBankAccount, addNotification } = useApp();

  const [step, setStep] = useState<AddBankStep>('select');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');

  const handleVerify = async () => {
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const icon = popularBanks.find(b => b.name === bankName)?.icon || '🏦';
    const maskedAccount = '****' + accountNumber.slice(-4);

    addBankAccount({
      name: accountName,
      accountNumber: maskedAccount,
      routingNumber,
      type: accountType,
      bankName,
      icon,
    });

    addNotification({
      type: 'success',
      title: 'Bank Account Added',
      message: `${bankName} ${accountType} account linked successfully!`,
    });

    setStep('complete');
  };

  // Trigger verification when step becomes 'verify'
  useEffect(() => {
    if (step === 'verify') {
      handleVerify();
    }
  }, [step]);

  const handleReset = () => {
    setStep('select');
    setBankName('');
    setAccountName('');
    setAccountType('checking');
    setAccountNumber('');
    setRoutingNumber('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSelectBank = (name: string) => {
    setBankName(name);
    setStep('details');
  };

  const handleContinueToVerify = () => {
    if (!accountName || !accountNumber || !routingNumber) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in all fields',
      });
      return;
    }

    if (accountNumber.length < 8) {
      addNotification({
        type: 'error',
        title: 'Invalid Account Number',
        message: 'Account number must be at least 8 digits',
      });
      return;
    }

    if (routingNumber.length !== 9) {
      addNotification({
        type: 'error',
        title: 'Invalid Routing Number',
        message: 'Routing number must be 9 digits',
      });
      return;
    }

    setStep('verify');
  };

  const handleFinish = () => {
    handleClose();
  };

  const getModalTitle = () => {
    switch (step) {
      case 'select':
        return 'Link Bank Account';
      case 'details':
        return 'Account Details';
      case 'verify':
        return 'Verifying Account';
      case 'complete':
        return 'Account Verified';
      default:
        return 'Add Bank Account';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()}>
      <div className="p-6">
        {step === 'select' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🏦</div>
              <p className="text-gray-600">Select your bank to get started</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popular Banks
              </label>
              <div className="grid grid-cols-2 gap-2">
                {popularBanks.map((bank) => (
                  <button
                    key={bank.name}
                    onClick={() => handleSelectBank(bank.name)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{bank.icon}</div>
                      <span className="font-semibold text-gray-900">{bank.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">
                <strong>🔒 Secure:</strong> Your bank credentials are encrypted and never stored.
              </p>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-600">Enter your {bankName} account information</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Nickname
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g., Chase Checking"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('checking')}
                    className={`p-3 border-2 rounded-xl font-semibold transition-all ${
                      accountType === 'checking'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Checking
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('savings')}
                    className={`p-3 border-2 rounded-xl font-semibold transition-all ${
                      accountType === 'savings'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Savings
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter account number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={17}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9-digit routing number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={9}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find this on your check or bank statement
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleContinueToVerify}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-pulse">⚡</div>
              <p className="text-gray-600">Please wait while we verify your bank account...</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Bank:</span>
                <span className="font-semibold text-gray-900">{bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span className="font-semibold text-gray-900">{accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold text-gray-900 capitalize">{accountType}</span>
              </div>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6 text-center py-6">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600">
              Your {bankName} account has been successfully linked to your Xcoins account.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-900">
                <strong>✓ Ready to use:</strong> You can now use this account for deposits and withdrawals.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
