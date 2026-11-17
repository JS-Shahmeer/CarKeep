import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import {
  ColorScheme,
  ColorTokens,
  palettes,
  radii,
  shadow,
  spacing,
  touchTarget,
  typography,
} from "./tokens";

export interface Theme {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadow: typeof shadow;
  touchTarget: number;
}

function buildTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    colors: palettes[scheme],
    spacing,
    radii,
    typography,
    shadow,
    touchTarget,
  };
}

const ThemeContext = createContext<Theme>(buildTheme("light"));

/**
 * Follows the OS light/dark setting (brief 01.4). There is no manual
 * light/dark override in V1 Settings.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const theme = useMemo(() => buildTheme(scheme === "dark" ? "dark" : "light"), [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
