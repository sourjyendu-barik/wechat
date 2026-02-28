import React from "react";

const LoadingSpinner = ({ fullScreen = true, text = "Loading..." }) => {
  return (
    <div
      className={`d-flex flex-column justify-content-center align-items-center ${
        fullScreen ? "vh-100" : "py-5"
      }`}
    >
      <div className="spinner-border text-primary" role="status" />
      {text && <div className="mt-3 text-muted">{text}</div>}
    </div>
  );
};

export default LoadingSpinner;
