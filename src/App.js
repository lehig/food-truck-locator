import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import './App.css';
import LoginForm from './Components/LoginForm/LoginForm'
import RegisterForm from './Components/RegisterForm/RegisterForm';

function LoginButton() {
  return (
    <button>Login</button>
  );
}

function UserName() {
  return (
    <div class="form-div">
      <form>
        <label for="username">Username:</label>
        <input type="text" />
      </form>
    </div>
  );
}

function Password() {
  return (
    <div class="form-div">
      <form>
        <label for="password">Password:</label>
        <input type="password" />
      </form>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>;
    </BrowserRouter>
  );
}

export default App;
