/* 
PROTECTED PAGE 
*/
import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import ProfilePage from "../../Components/ProfilePage/ProfilePage";
import Footer from "../../Components/Footer/Footer";

function ProfileNavPage() {
  return (
    <>
      <Navbar />
      <ProfilePage />
      <Footer />
    </>
  );
}

export default ProfileNavPage;
