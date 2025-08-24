import React from 'react';
import { ThreeDots } from 'react-loader-spinner';

const Loader = ({ 
  size = 80, 
  color = "#007bff", 
  text = "Carregando...", 
  height = "100vh",
  width = "100%",
  textColor = "var(--text-secondary)",
  textSize = "var(--font-size-large)"
}) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: height,
      width: width,
      gap: "var(--spacing-lg)"
    }}>
      <ThreeDots
        height={size}
        width={size}
        radius="9"
        color={color}
        ariaLabel="three-dots-loading"
        wrapperStyle={{}}
        wrapperClassName=""
        visible={true}
      />
      {text && (
        <div style={{
          color: textColor,
          fontSize: textSize,
          textAlign: "center"
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

export default Loader;
