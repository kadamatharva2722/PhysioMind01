import React from "react";

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div
      style={{
        marginTop: "12px",
        padding: "10px 14px",
        borderRadius: "6px",
        background: "#fee2e2",
        color: "#b91c1c",
        fontSize: "14px",
      }}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
