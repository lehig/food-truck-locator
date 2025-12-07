import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginForm from './Components/LoginForm/LoginForm'
import RegisterForm from './Components/RegisterForm/RegisterForm';
import BusRegisterForm from './Components/BusRegisterForm/BusRegisterForm';
import Dashboard from './Components/Dashboard/Dashboard';
import TestComms from './Components/TestComms/TestComms';
import TestEntry from './Components/TestEntry/TestEntry';
import TestLogin from './Components/TestLogin/TestLogin';
import ProfilePage from './Components/ProfilePage/ProfilePage';
import SendMessages from './Components/SendMessages/SendMessages';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path='/business-register' element={<BusRegisterForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test" element={<TestComms />} />
          <Route path='/test-entry' element={<TestEntry />} />
          <Route path='/test-login' element={<TestLogin />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/messages' element={<SendMessages />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
