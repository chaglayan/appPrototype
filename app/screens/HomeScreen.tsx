import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { BalanceOverview } from '../components/BalanceOverview';
import { WalletList } from '../components/WalletList';
import { Notifications } from '../components/Notifications';

type ActiveTab = 'home' | 'buy' | 'sell' | 'swap' | 'settings';

const getCategoryBadge = (category: string) => {
  const badges = {
    bronze: { color: 'bg-orange-700', icon: '🥉' },
    silver: { color: 'bg-gray-400', icon: '🥈' },
    gold: { color: 'bg-yellow-500', icon: '🥇' },
    platinum: { color: 'bg-blue-400', icon: '💎' },
    diamond: { color: 'bg-purple-500', icon: '👑' },
  };
  return badges[category as keyof typeof badges] || badges.bronze;
};

export function HomeScreen() {
  const navigate = useNavigate();
  const { user, usdBalance, wallets, balancesHidden, logout } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const categoryBadge = getCategoryBadge(user.category);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* iOS-Style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Welcome + Category */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${categoryBadge.color} rounded-full flex items-center justify-center text-white shadow-md`}>
                <span className="text-xl">{categoryBadge.icon}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Welcome</p>
                <h1 className="text-lg font-semibold text-gray-900">{user.firstName}</h1>
              </div>
            </div>

            {/* Right: Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <span className="text-xl">🔔</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {activeTab === 'home' && (
          <>
            <BalanceOverview />
            <WalletList />
          </>
        )}

        {activeTab === 'buy' && (
          <div className="text-center py-12">
            <p className="text-2xl mb-4">🛒</p>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Buy Crypto</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        )}

        {activeTab === 'sell' && (
          <div className="text-center py-12">
            <p className="text-2xl mb-4">💰</p>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sell Crypto</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        )}

        {activeTab === 'swap' && (
          <div className="text-center py-12">
            <p className="text-2xl mb-4">🔄</p>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Swap Crypto</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Account</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Membership</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 ${categoryBadge.color} text-white rounded-full text-sm font-medium`}>
                      {user.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* iOS-Style Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center py-2 px-4 ${
                activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-2xl mb-1">🏠</span>
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('buy')}
              className={`flex flex-col items-center py-2 px-4 ${
                activeTab === 'buy' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-2xl mb-1">🛒</span>
              <span className="text-xs font-medium">Buy</span>
            </button>

            <button
              onClick={() => setActiveTab('sell')}
              className={`flex flex-col items-center py-2 px-4 ${
                activeTab === 'sell' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-2xl mb-1">💰</span>
              <span className="text-xs font-medium">Sell</span>
            </button>

            <button
              onClick={() => setActiveTab('swap')}
              className={`flex flex-col items-center py-2 px-4 ${
                activeTab === 'swap' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-2xl mb-1">🔄</span>
              <span className="text-xs font-medium">Swap</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center py-2 px-4 ${
                activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-2xl mb-1">⚙️</span>
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowNotifications(false)}>
          <div className="absolute top-0 right-0 w-full max-w-md bg-white h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <button onClick={() => setShowNotifications(false)} className="text-2xl">✕</button>
              </div>
            </div>
            <div className="p-4">
              <Notifications />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
