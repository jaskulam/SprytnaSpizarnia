import React, { createContext, useContext } from 'react';
import { ColorSchemeName } from 'react-native';

interface ThemeContextValue {
  colorScheme: ColorSchemeName;
}

const ThemeContext = createContext<ThemeContextValue>({ colorScheme: 'light' });

export const ThemeProvider: React.FC<{ colorScheme: ColorSchemeName; children: React.ReactNode }>
  = ({ colorScheme, children }) => (
  <ThemeContext.Provider value={{ colorScheme }}>{children}</ThemeContext.Provider>
);

export const useThemeContext = () => useContext(ThemeContext);

export default ThemeContext;
