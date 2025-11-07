import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { BuyScreen } from './screens/transactions/BuyScreen';
import { SellScreen } from './screens/transactions/SellScreen';
import { SwapScreen } from './screens/transactions/SwapScreen';
import { TopUpScreen } from './screens/transactions/TopUpScreen';
import { WithdrawUSDScreen } from './screens/transactions/WithdrawUSDScreen';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/buy" element={<BuyScreen />} />
          <Route path="/sell" element={<SellScreen />} />
          <Route path="/swap" element={<SwapScreen />} />
          <Route path="/topup" element={<TopUpScreen />} />
          <Route path="/withdraw-usd" element={<WithdrawUSDScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
