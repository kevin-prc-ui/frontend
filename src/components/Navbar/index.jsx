import React, { useEffect, useState } from "react";
import { Navbar } from "react-bootstrap";
import MicrosoftLoginButton from "../MicrosoftAuth/LoginButton";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";

const Index = () => {
  return (
    <>
      <Navbar
        bg="white shadow"
        variant="white"
        className="navbarStyle flex flex-wrap justify-content-between"
      >
        <a className="w-45" href="/">
          <img
            // src="https://serdiaceros.com.mx/wp-content/uploads/2022/08/SERDI-logo-web-1.png"
            src="https://tienda.serdi.com.mx/static/media/LOGO%20COLOR_navbar.0c4356a0.svg"
            alt=""
            width={"100%"}
          />
        </a>
        <AuthenticatedTemplate>
          <ProfileContent />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate />
        <MicrosoftLoginButton /> {/* Reemplaza el Button anterior */}
      </Navbar>
    </>
  );
};
const ProfileContent = () => {
  const { accounts } = useMsal();
  const isAuthenticated = localStorage.getItem("authToken");
  if (!isAuthenticated)
    return (
      <div className="card-title">
        Inicia sesión para ver tu información de perfil.
      </div>
    );
  else
    return (
      <>
        <div className="">Bienvenido, {accounts[0].name}!</div>
      </>
    );
};
export default Index;
