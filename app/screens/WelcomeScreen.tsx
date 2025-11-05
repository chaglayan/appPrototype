import { useNavigate } from 'react-router-dom';

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-6 animate-pulse">₿</div>
          <h1 className="text-4xl font-bold text-white mb-2">Xcoins</h1>
          <p className="text-blue-100 text-lg">Your Crypto Exchange</p>
        </div>

        {/* Feature Highlights */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center text-white">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold">Instant Trading</h3>
              <p className="text-sm text-blue-100">Buy and sell crypto instantly</p>
            </div>
          </div>
          <div className="flex items-center text-white">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h3 className="font-semibold">Secure & Safe</h3>
              <p className="text-sm text-blue-100">Bank-level security</p>
            </div>
          </div>
          <div className="flex items-center text-white">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <h3 className="font-semibold">Top Cryptocurrencies</h3>
              <p className="text-sm text-blue-100">14+ coins and stablecoins</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/register')}
            className="w-full bg-white text-purple-700 font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Create Account
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-transparent border-2 border-white text-white font-semibold py-4 px-6 rounded-2xl hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          >
            Sign In
          </button>
        </div>

        {/* Terms */}
        <p className="text-center text-blue-100 text-xs mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
