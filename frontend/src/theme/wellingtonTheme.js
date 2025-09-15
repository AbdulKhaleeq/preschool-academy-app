// Wellington Kids Brand Theme
export const wellingtonTheme = {
  colors: {
    // Primary Colors from Wellington Kids logo
    navy: '#1e3a8a',        // Deep navy blue
    burgundy: '#7f1d1d',    // Rich burgundy/maroon
    gold: '#d4af37',        // Warm gold
    green: '#15803d',       // Fresh green (from tree)
    
    // Extended Palette
    navyLight: '#2563eb',
    navyDark: '#1e1b4b',
    burgundyLight: '#991b1b',
    burgundyDark: '#450a0a',
    goldLight: '#fbbf24',
    goldDark: '#a16207',
    
    // Neutral Colors
    white: '#ffffff',
    cream: '#fef3c7',
    lightGray: '#f8fafc',
    gray: '#64748b',
    darkGray: '#334155',
    
    // Status Colors
    success: '#15803d',
    warning: '#d4af37',
    error: '#dc2626',
    info: '#2563eb'
  },
  
  // Typography
  fonts: {
    primary: '"Inter", "Segoe UI", "Roboto", sans-serif',
    heading: '"Poppins", "Inter", sans-serif'
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  // Border Radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
};

// CSS Custom Properties for easier usage
export const cssVariables = `
  :root {
    --wellington-navy: ${wellingtonTheme.colors.navy};
    --wellington-burgundy: ${wellingtonTheme.colors.burgundy};
    --wellington-gold: ${wellingtonTheme.colors.gold};
    --wellington-green: ${wellingtonTheme.colors.green};
    --wellington-navy-light: ${wellingtonTheme.colors.navyLight};
    --wellington-navy-dark: ${wellingtonTheme.colors.navyDark};
    --wellington-cream: ${wellingtonTheme.colors.cream};
  }
`;

export default wellingtonTheme;