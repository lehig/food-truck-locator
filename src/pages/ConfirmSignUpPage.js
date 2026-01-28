/* 
PUBLIC PAGE 
*/
import React from "react";
import Navbar from "../Components/Navbar/Navbar";
import ConfirmSignup from "../Components/ConfirmSignUp/ConfirmSignUp";
import Footer from "../Components/Footer/Footer";

function ConfirmSignUpPage() {
  return (
    <>
      <Navbar />
      <ConfirmSignup />
      <Footer />
    </>
  );
}

export default ConfirmSignUpPage;
