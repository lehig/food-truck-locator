import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
// import LoginForm from './Components/LoginForm/LoginForm';
// import RegisterForm from './Components/RegisterForm/RegisterForm';
// import BusRegisterForm from './Components/BusRegisterForm/BusRegisterForm';
// import Dashboard from './Components/Dashboard/Dashboard';
import TestComms from './Components/TestComms/TestComms';
import TestEntry from './Components/TestEntry/TestEntry';
import TestLogin from './Components/TestLogin/TestLogin';
// import ProfilePage from './Components/ProfilePage/ProfilePage';
// import SendMessages from './Components/SendMessages/SendMessages';
import ProtectedRoute from './routes/ProtectedRoute';
// import ConfirmSignup from './Components/ConfirmSignUp/ConfirmSignUp';
// import BusinessVerification from './Components/BusinessVerification/BusinessVerification';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BusRegisterPage from './pages/BusRegisterPage';
import ConfirmSignUpPage from './pages/ConfirmSignUpPage';
import BusVerificationPage from './pages/BusVerificationPage';
import DashboardPage from './pages/protected/DashboardPage';
import ProfileNavPage from './pages/protected/ProfileNavPage';
import MessagesPage from './pages/protected/MessagesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SupportPage from './pages/protected/SupportPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfService';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/business-register" element={<BusRegisterPage />} />
        <Route path='/confirm-signup' element={<ConfirmSignUpPage />} />
        <Route path='/business-verification' element={<BusVerificationPage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path='/tos' element={<TermsOfServicePage />} />

        {/* Public tests */}
        <Route path="/test" element={<TestComms />} />
        <Route path="/test-entry" element={<TestEntry />} />
        <Route path="/test-login" element={<TestLogin />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute redirectTo="/" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfileNavPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path='/support' element={<SupportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
