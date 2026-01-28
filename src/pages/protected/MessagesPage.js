/* 
PROTECTED PAGE 
*/
import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import SendMessages from "../../Components/SendMessages/SendMessages";
import Footer from "../../Components/Footer/Footer";

function MessagesPage() {
  return (
    <>
      <Navbar />
      <SendMessages />
      <Footer />
    </>
  );
}

export default MessagesPage;
