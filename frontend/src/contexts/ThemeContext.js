import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const theme = {
    colors: {
      primary: {
        light: '#667eea',
        dark: '#4c63d2',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      secondary: {
        light: '#f093fb',
        dark: '#f5576c',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      success: {
        light: '#4facfe',
        dark: '#00f2fe',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      }
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    },
    borderRadius: {
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    }
  };

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
