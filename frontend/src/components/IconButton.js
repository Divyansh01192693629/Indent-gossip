import React, { useState } from "react";

function IconButton({ icon, onClick, title }) {
  const [hover, setHover] = useState(false);

  return (
    <span
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: "pointer",
        fontSize: "22px",
        transform: hover ? "scale(1.2)" : "scale(1)",
        transition: "0.2s",
      }}
    >
      {icon}
    </span>
  );
}

export default IconButton;
