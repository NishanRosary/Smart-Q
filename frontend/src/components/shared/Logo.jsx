import React from "react";

const Logo = ({ size = 200, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top arc */}
      <path
        d="M40 95
           A60 60 0 0 1 160 95"
        fill="none"
        stroke="#000"
        strokeWidth="26"
        strokeLinecap="round"
      />

      {/* Bottom arc */}
      <path
        d="M40 105
           A60 60 0 0 0 140 150"
        fill="none"
        stroke="#000"
        strokeWidth="26"
        strokeLinecap="round"
      />

      {/* Q tail */}
      <path
        d="M135 135
           C155 150, 170 150, 175 155"
        fill="none"
        stroke="#000"
        strokeWidth="26"
        strokeLinecap="round"
      />

      {/* SMART text */}
      <text
        x="100"
        y="105"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="34"
        fontWeight="900"
        letterSpacing="3"
        fill="#000"
      >
        SMART
      </text>
    </svg>
  );
};

export default Logo;


