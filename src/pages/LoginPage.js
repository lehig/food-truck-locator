/* 
PUBLIC PAGE 
*/
import React from "react";
import Navbar from "../Components/Navbar/Navbar";
import LoginForm from '../Components/LoginForm/LoginForm';
import Footer from "../Components/Footer/Footer";

function LoginPage() {
  return (
    <>
      <Navbar />
      <LoginForm />
      <Footer />
    </>
  );
}

export default LoginPage;
