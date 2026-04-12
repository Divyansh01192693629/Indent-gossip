import React from "react";

function Loader({ text = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        color: "#aaa",
      }}
    >
      <div className="spinner"></div>
      <span>{text}</span>
    </div>
  );
}

export default Loader;
