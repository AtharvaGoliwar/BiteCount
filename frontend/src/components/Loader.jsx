import React from "react";
import "./Loader.css"; // We will create this CSS file next

const Loader = () => {
  return (
    <div className="loader-overlay" aria-label="Loading..." role="status">
      <img
        src="cookie.png" // Make sure your logo is in the /public folder
        alt="Loading..."
        className="loader-icon"
      />
    </div>
  );
};

export default Loader;
