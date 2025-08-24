import React from 'react';
import { ThreeDots } from 'react-loader-spinner';

const LoaderInline = ({ 
  size = 20, 
  color = "#ffffff", 
  text = "", 
  height = "auto",
  width = "auto"
}) => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--spacing-sm)",
      height: height,
      width: width
    }}>
      <ThreeDots
        height={size}
        width={size}
        radius="3"
        color={color}
        ariaLabel="three-dots-loading"
        wrapperStyle={{}}
        wrapperClassName=""
        visible={true}
      />
      {text && (
        <span style={{
          color: color,
          fontSize: "var(--font-size-medium)"
        }}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoaderInline;
