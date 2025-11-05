import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('demo@xcoins.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = () => {
    // Simulate login with pre-populated account
    login({
      id: '1',
      email: 'demo@xcoins.com',
      phone: '+1 (555) 123-4567',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: '1992-05-20',
      address: {
        street: '456 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'United States',
      },
      category: 'gold',
    });
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/')} className="text-blue-600 text-lg">
            ← Back
          </button>
          <h1 className="flex-1 text-center font-semibold text-gray-900">Sign In</h1>
          <div className="w-12"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">₿</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your Xcoins account</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-blue-600 mr-2" />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Forgot password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
          >
            Sign In
          </button>

          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Create one
            </button>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>Demo Mode:</strong> Use any credentials to login with pre-populated account
          </p>
        </div>
      </div>
    </div>
  );
}
