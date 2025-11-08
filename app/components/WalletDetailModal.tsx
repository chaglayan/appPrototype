import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Wallet } from '../types';
import { getCryptoById } from '../data/cryptocurrencies';
import { formatCurrency, formatCrypto } from '../utils/format';
import { useApp } from '../context/AppContext';

interface WalletDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet;
}

export const WalletDetailModal: React.FC<WalletDetailModalProps> = ({ isOpen, onClose, wallet }) => {
  const navigate = useNavigate();
  const { addNotification, updateWallet } = useApp();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSimulateDeposit, setShowSimulateDeposit] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  const crypto = getCryptoById(wallet.cryptoId);
  if (!crypto) return null;

  const usdValue = wallet.amount * crypto.currentPrice;

  const handleBuyMore = () => {
    onClose();
    navigate(`/buy?crypto=${wallet.cryptoId}&wallet=xcoins`);
  };

  const handleSell = () => {
    onClose();
    navigate(`/sell?crypto=${wallet.cryptoId}&walletId=${wallet.id}`);
  };

  const handleSimulateDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
      });
      return;
    }

    setShowSimulateDeposit(false);
    setShowDeposit(false);

    // Step 1: Transaction detected
    addNotification({
      type: 'info',
      title: 'Transaction Detected',
      message: `Incoming ${formatCrypto(amount)} ${crypto.symbol} detected on the network`,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Awaiting confirmations
    addNotification({
      type: 'info',
      title: 'Awaiting Confirmations (1/6)',
      message: `${formatCrypto(amount)} ${crypto.symbol} - waiting for network confirmations...`,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    addNotification({
      type: 'info',
      title: 'Confirming (3/6)',
      message: `${formatCrypto(amount)} ${crypto.symbol} - halfway confirmed`,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Final confirmation
    addNotification({
      type: 'info',
      title: 'Confirming (6/6)',
      message: `${formatCrypto(amount)} ${crypto.symbol} - fully confirmed, crediting your wallet...`,
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    updateWallet(wallet.cryptoId, amount);

    addNotification({
      type: 'success',
      title: 'Deposit Complete',
      message: `${formatCrypto(amount)} ${crypto.symbol} has been credited to your wallet!`,
    });

    setDepositAmount('');
    onClose();
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!withdrawAddress) {
      addNotification({
        type: 'error',
        title: 'Missing Address',
        message: 'Please enter a recipient address',
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

    if (amount > wallet.amount) {
      addNotification({
        type: 'error',
        title: 'Insufficient Balance',
        message: 'You do not have enough balance',
      });
      return;
    }

    setShowWithdraw(false);

    // Step 1: Transaction initiated
    addNotification({
      type: 'info',
      title: 'Transaction Initiated',
      message: `Preparing to send ${formatCrypto(amount)} ${crypto.symbol}...`,
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Deduct from wallet immediately after initiation
    updateWallet(wallet.cryptoId, -amount);

    // Step 2: Broadcasting
    addNotification({
      type: 'info',
      title: 'Broadcasting Transaction',
      message: `Sending ${formatCrypto(amount)} ${crypto.symbol} to the network...`,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Pending confirmations
    addNotification({
      type: 'info',
      title: 'Pending Confirmations',
      message: `Transaction broadcast - awaiting blockchain confirmations...`,
    });

    await new Promise(resolve => setTimeout(resolve, 2500));

    // Step 4: Confirmed
    addNotification({
      type: 'success',
      title: 'Withdrawal Confirmed',
      message: `${formatCrypto(amount)} ${crypto.symbol} sent to ${withdrawAddress.substring(0, 10)}...`,
    });

    setWithdrawAddress('');
    setWithdrawAmount('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${crypto.name} Wallet`}>
      <div className="space-y-6">
        {/* Balance Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
          <div className="text-5xl mb-4">{crypto.icon}</div>
          <p className="text-sm text-gray-600 mb-1">Balance</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCrypto(wallet.amount)} {crypto.symbol}
          </p>
          <p className="text-lg text-gray-600">{formatCurrency(usdValue)}</p>
        </div>

        {/* Wallet Address */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-2">Wallet Address</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-gray-900 truncate mr-2">{wallet.address}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(wallet.address);
                addNotification({
                  type: 'success',
                  title: 'Copied!',
                  message: 'Wallet address copied to clipboard',
                });
              }}
              className="text-blue-600 text-sm font-semibold hover:text-blue-700"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleBuyMore}
            className="bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Buy More
          </button>
          <button
            onClick={handleSell}
            className="bg-green-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
          >
            Sell to USD
          </button>
          <button
            onClick={() => setShowDeposit(true)}
            className="bg-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Deposit
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-orange-700 transition-colors"
          >
            Withdraw
          </button>
        </div>

        {/* Deposit Modal */}
        {showDeposit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeposit(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Deposit {crypto.symbol}</h3>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Send {crypto.symbol} to:</p>
                <p className="text-sm font-mono text-gray-900 break-all mb-3">{wallet.address}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(wallet.address);
                    addNotification({
                      type: 'success',
                      title: 'Copied!',
                      message: 'Address copied to clipboard',
                    });
                  }}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Copy Address
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                • Only send {crypto.symbol} to this address
                <br />
                • Minimum deposit: 0.001 {crypto.symbol}
                <br />
                • Funds will appear after network confirmation
              </p>
              <button
                onClick={() => {
                  setShowDeposit(false);
                  setShowSimulateDeposit(true);
                }}
                className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors mb-2"
              >
                Simulate Deposit
              </button>
              <button
                onClick={() => setShowDeposit(false)}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Simulate Deposit Modal */}
        {showSimulateDeposit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSimulateDeposit(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Simulate Deposit</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Deposit</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={handleSimulateDeposit}
                  className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Confirm Deposit
                </button>
                <button
                  onClick={() => setShowSimulateDeposit(false)}
                  className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdraw && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowWithdraw(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Withdraw {crypto.symbol}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Enter ${crypto.symbol} address`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">Available: {formatCrypto(wallet.amount)} {crypto.symbol}</p>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(wallet.amount.toString())}
                      className="text-xs text-orange-600 font-semibold hover:text-orange-700"
                    >
                      Max
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleWithdraw}
                  className="w-full bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Confirm Withdrawal
                </button>
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
