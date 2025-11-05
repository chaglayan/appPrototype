import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';

type RegistrationStep = 'email' | 'email-otp' | 'phone' | 'phone-otp' | 'personal' | 'address';

export function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [step, setStep] = useState<RegistrationStep>('email');
  const [formData, setFormData] = useState({
    email: 'demo@xcoins.com',
    emailOtp: '123456',
    phone: '+1 (555) 123-4567',
    phoneOtp: '654321',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-15',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
  });

  const handleNext = () => {
    const stepOrder: RegistrationStep[] = ['email', 'email-otp', 'phone', 'phone-otp', 'personal', 'address'];
    const currentIndex = stepOrder.indexOf(step);

    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    } else {
      // Complete registration
      register({
        id: '1',
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        category: 'bronze',
      });
      navigate('/home');
    }
  };

  const handleBack = () => {
    const stepOrder: RegistrationStep[] = ['email', 'email-otp', 'phone', 'phone-otp', 'personal', 'address'];
    const currentIndex = stepOrder.indexOf(step);

    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    } else {
      navigate('/');
    }
  };

  const progressPercentage = {
    'email': 16,
    'email-otp': 33,
    'phone': 50,
    'phone-otp': 66,
    'personal': 83,
    'address': 100,
  }[step];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button onClick={handleBack} className="text-blue-600 text-lg">
            ← Back
          </button>
          <h1 className="flex-1 text-center font-semibold text-gray-900">Create Account</h1>
          <div className="w-12"></div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-1 bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {step === 'email' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your email?</h2>
              <p className="text-gray-600">We'll send you a verification code</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
          </div>
        )}

        {step === 'email-otp' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter verification code</h2>
              <p className="text-gray-600">We sent a code to {formData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <input
                type="text"
                value={formData.emailOtp}
                onChange={(e) => setFormData({ ...formData, emailOtp: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <button className="text-blue-600 text-sm">Resend code</button>
          </div>
        )}

        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your phone number?</h2>
              <p className="text-gray-600">We'll send you a verification code</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        )}

        {step === 'phone-otp' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter verification code</h2>
              <p className="text-gray-600">We sent a code to {formData.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <input
                type="text"
                value={formData.phoneOtp}
                onChange={(e) => setFormData({ ...formData, phoneOtp: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <button className="text-blue-600 text-sm">Resend code</button>
          </div>
        )}

        {step === 'personal' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Help us get to know you better</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {step === 'address' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Address</h2>
              <p className="text-gray-600">Where do you live?</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleNext}
          className="w-full mt-8 bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
        >
          {step === 'address' ? 'Complete Registration' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
