import React, { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility deve ser usado dentro de um AccessibilityProvider");
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem("fontSize");
    return savedFontSize || "medium";
  });

  const [highContrast, setHighContrast] = useState(() => {
    const savedHighContrast = localStorage.getItem("highContrast");
    return savedHighContrast === "true";
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    const savedReducedMotion = localStorage.getItem("reducedMotion");
    return savedReducedMotion === "true";
  });

  // Aplicar tema ao documento
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Aplicar tamanho de fonte
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-font-size", fontSize);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  // Aplicar alto contraste
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.setAttribute("data-high-contrast", "true");
    } else {
      root.removeAttribute("data-high-contrast");
    }
    localStorage.setItem("highContrast", highContrast.toString());
  }, [highContrast]);

  // Aplicar redução de movimento
  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.setAttribute("data-reduced-motion", "true");
    } else {
      root.removeAttribute("data-reduced-motion");
    }
    localStorage.setItem("reducedMotion", reducedMotion.toString());
  }, [reducedMotion]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const increaseFontSize = () => {
    const sizes = ["small", "medium", "large", "xlarge"];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const sizes = ["small", "medium", "large", "xlarge"];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  };

  const resetFontSize = () => {
    setFontSize("medium");
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  const value = {
    theme,
    fontSize,
    highContrast,
    reducedMotion,
    toggleTheme,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    toggleReducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

