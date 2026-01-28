/* 
PUBLIC PAGE 
*/
import React from "react";
import Navbar from "../Components/Navbar/Navbar";
import BusRegisterForm from "../Components/BusRegisterForm/BusRegisterForm";
import Footer from "../Components/Footer/Footer";

function BusRegisterPage() {
  return (
    <>
      <Navbar />
      <BusRegisterForm />
      <Footer />
    </>
  );
}

export default BusRegisterPage;
