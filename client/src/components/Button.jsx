import React from "react";

export default function Button({ text, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button
      type={type}
      className={"btn " + className}
      onClick={onClick}
      disabled={disabled}
      style={{ padding: "8px 12px", borderRadius: 6 }}
    >
      {text}
    </button>
  );
}
