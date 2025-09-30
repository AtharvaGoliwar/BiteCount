import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <main>{children}</main>
      <Header />
    </div>
  );
};

export default Layout;
