/* 
PUBLIC PAGE 
*/
import React from "react";
import RegisterForm from "../Components/RegisterForm/RegisterForm";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";

function RegisterPage() {
    return (
    <>
      <Navbar />
      <RegisterForm />
      <Footer />
    </>
    )
}

export default RegisterPage;